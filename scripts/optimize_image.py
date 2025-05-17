from PIL import Image
import os

def optimize_image(input_path, output_path, max_size=(1920, None), quality=80):
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Open the image
    with Image.open(input_path) as img:
        # Calculate new size maintaining aspect ratio
        if max_size[1] is None:
            ratio = max_size[0] / img.size[0]
            new_size = (max_size[0], int(img.size[1] * ratio))
        else:
            ratio = min(max_size[0] / img.size[0], max_size[1] / img.size[1])
            new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
        
        # Resize image
        img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Save optimized image
        img.save(output_path, 'JPEG', quality=quality, optimize=True)

# Input and output paths
input_image = '/Applications/HKU/Z5/Exported/未命名导出/DSC_2223.jpg'
output_dir = 'src/assets/images'

# Create desktop version
optimize_image(
    input_image,
    os.path.join(output_dir, 'background.jpg'),
    max_size=(1920, None),
    quality=80
)

# Create mobile version
optimize_image(
    input_image,
    os.path.join(output_dir, 'background-mobile.jpg'),
    max_size=(800, None),
    quality=70
)

print("Images optimized successfully!") 