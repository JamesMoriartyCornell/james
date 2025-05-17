const sharp = require('sharp');
const path = require('path');

const inputImage = '/Applications/HKU/Z5/Exported/未命名导出/DSC_2223.jpg';
const outputDir = path.join(__dirname, '../assets/images');

// Optimize the image for web
sharp(inputImage)
    .resize(1920, null, { // Max width 1920px, maintain aspect ratio
        withoutEnlargement: true,
        fit: 'inside'
    })
    .jpeg({
        quality: 80,
        progressive: true
    })
    .toFile(path.join(outputDir, 'background.jpg'))
    .then(() => {
        console.log('Background image optimized successfully');
        
        // Create a smaller version for mobile
        return sharp(inputImage)
            .resize(800, null, {
                withoutEnlargement: true,
                fit: 'inside'
            })
            .jpeg({
                quality: 70,
                progressive: true
            })
            .toFile(path.join(outputDir, 'background-mobile.jpg'));
    })
    .then(() => {
        console.log('Mobile background image created successfully');
    })
    .catch(err => {
        console.error('Error optimizing images:', err);
    }); 