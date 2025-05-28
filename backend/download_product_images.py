import json
import os
import requests # For making HTTP requests to download images
from urllib.parse import urlparse # To parse URLs and extract path components
import re # For sanitizing filenames (optional but good practice)

# --- Configuration ---
JSON_FILE_PATH = 'products_from_atlas.json'  # IMPORTANT: Replace with the actual path to your JSON file if different
UPLOADS_DIR = 'uploads' # Name of the folder to save images into

def sanitize_filename(name):
    """Removes or replaces characters not suitable for filenames."""
    # Remove leading/trailing whitespace
    name = name.strip()
    # Replace known problematic characters with a hyphen
    name = re.sub(r'[\\/*?:"<>| ]', '-', name)
    # Remove any remaining characters that are not alphanumeric, hyphen, or dot
    name = re.sub(r'[^-a-zA-Z0-9._]+', '', name)
    # Prevent names that are just dots or empty
    if not name or all(c == '.' for c in name):
        return "default_image_name"
    return name


def extract_image_urls_from_file(filepath):
    """
    Loads product data from a JSON file and extracts all unique image URLs
    from 'thumbnail' and 'images' fields of each product.
    """
    all_image_urls = set()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            products_data = json.load(f) # Assumes top-level structure could be an object or array
        
        # Determine if products_data is a list of products or an object containing a 'users' or 'products' list
        if isinstance(products_data, list):
            products_list = products_data
        elif isinstance(products_data, dict) and 'products' in products_data:
            products_list = products_data['products']
        elif isinstance(products_data, dict) and 'users' in products_data: # Handle your previous user JSON structure
             products_list = products_data['users']
        else:
            print(f"Error: JSON structure in '{filepath}' is not a recognized product list or object containing 'products'/'users'.")
            return []
            
        for product in products_list:
            if product.get('thumbnail') and isinstance(product['thumbnail'], str):
                all_image_urls.add(product['thumbnail'])
            
            if product.get('images') and isinstance(product['images'], list):
                for img_url in product['images']:
                    if isinstance(img_url, str):
                        all_image_urls.add(img_url)
        return list(all_image_urls)
    except FileNotFoundError:
        print(f"Error: JSON file not found at '{filepath}'")
        return []
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{filepath}'. Make sure it's a valid JSON.")
        return []
    except Exception as e:
        print(f"An unexpected error occurred while reading the JSON file: {e}")
        return []

def generate_custom_filename(url):
    """
    Generates a custom filename based on the URL structure if the original filename
    is '1.webp', '2.webp', '3.webp', or 'thumbnail.webp'.
    Otherwise, returns the original filename from the URL.
    """
    try:
        parsed_url = urlparse(url)
        path_segments = [segment for segment in parsed_url.path.split('/') if segment] # Get non-empty path segments
        
        if not path_segments:
            return "unknown_image.jpg" # Fallback for unusual URLs

        original_filename_with_ext = path_segments[-1]
        original_filename_base, original_ext = os.path.splitext(original_filename_with_ext)

        # Define the specific filenames that trigger custom naming
        # Ensure to compare with the full filename including extension
        special_filenames_to_rename = ["1.webp", "2.webp", "3.webp", "thumbnail.webp"]

        if original_filename_with_ext in special_filenames_to_rename:
            if len(path_segments) >= 2:
                # Assume the segment before the filename is the product slug/identifier
                product_slug = path_segments[-2] 
                # Sanitize slug and base filename before combining
                sanitized_slug = sanitize_filename(product_slug)
                sanitized_base = sanitize_filename(original_filename_base)
                
                new_filename = f"{sanitized_slug}-{sanitized_base}{original_ext}"
                return new_filename
            else:
                # Not enough path segments to determine product slug, use original with sanitation
                return sanitize_filename(original_filename_with_ext)
        else:
            # Not a special filename, use the original (but sanitized)
            return sanitize_filename(original_filename_with_ext)
            
    except Exception as e:
        print(f"Error generating filename for URL {url}: {e}")
        # Fallback to a very generic name if anything goes wrong
        return sanitize_filename(os.path.basename(url) or f"image_{hash(url)}.jpg")


def download_image(url, target_folder):
    """
    Downloads an image from a given URL and saves it to the target_folder
    using the custom filename generation logic.
    Returns the final filename if successful, or None if failed.
    """
    if not url:
        return None
    try:
        response = requests.get(url, stream=True, timeout=30) 
        response.raise_for_status()

        final_filename = generate_custom_filename(url)
        
        # Ensure filename is not empty after generation/sanitization
        if not final_filename:
            print(f"Warning: Filename generation resulted in empty string for {url}. Skipping.")
            return None

        filepath = os.path.join(target_folder, final_filename)
        
        # Ensure subdirectories are created if filename implies them (though our current logic doesn't)
        # os.makedirs(os.path.dirname(filepath), exist_ok=True) # Not needed with current flat structure

        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Successfully downloaded: {final_filename} (from {url})")
        return final_filename
    except requests.exceptions.RequestException as e:
        print(f"Failed to download {url}: {e}")
        return None
    except Exception as e:
        print(f"An error occurred while downloading {url}: {e}")
        return None

def main():
    if not os.path.exists(UPLOADS_DIR):
        os.makedirs(UPLOADS_DIR)
        print(f"Created directory: '{UPLOADS_DIR}'")

    print(f"Reading product data from: '{JSON_FILE_PATH}'")
    image_urls = extract_image_urls_from_file(JSON_FILE_PATH)
    
    if not image_urls:
        print("No image URLs found or error reading file. Exiting.")
        return

    print(f"\nFound {len(image_urls)} unique image URL(s) to download.")
    
    successful_downloads = 0
    failed_downloads = 0
    
    print(f"\nStarting downloads into '{UPLOADS_DIR}' directory...\n")
    for i, url in enumerate(image_urls):
        # print(f"Processing URL {i+1}/{len(image_urls)}: {url}") # Already printed inside download_image
        filename = download_image(url, UPLOADS_DIR)
        if filename:
            successful_downloads += 1
        else:
            failed_downloads += 1
            
    print(f"\n--- Download Report ---")
    print(f"Successfully downloaded: {successful_downloads} image(s)")
    print(f"Failed to download: {failed_downloads} image(s)")
    print(f"Images are saved in the '{UPLOADS_DIR}' folder.")

if __name__ == '__main__':
    if JSON_FILE_PATH == 'path_to_your_products.json': # Default placeholder check
        print("ERROR: Please update the 'JSON_FILE_PATH' variable in the script with the actual path to your JSON file.")
    else:
        main()
