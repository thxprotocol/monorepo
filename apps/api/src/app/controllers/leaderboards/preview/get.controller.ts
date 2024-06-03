import { Request, Response } from 'express';
import { param } from 'express-validator';
import axios from 'axios';
import sharp from 'sharp';
import BrandService from '@thxnetwork/api/services/BrandService';

const validation = [param('id').isMongoId(), param('platform').isString()];

// Helper function to fetch image buffer from a URL
async function fetchImageBuffer(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
}

const dimensions = {
    facebook: { width: 1200, height: 630 },
    twitter: { width: 1200, height: 628 },
    linkedin: { width: 1200, height: 627 },
    pinterest: { width: 1200, height: 1200 },
    whatsapp: { width: 300, height: 300 },
};

const controller = async (req: Request, res: Response) => {
    if (!dimensions[req.params.platform]) throw new Error('Invalid platform');
    const { width, height } = dimensions[req.params.platform];
    const brand = await BrandService.get(req.params.id);
    if (!brand) return res.end(); // Should provide defaults

    try {
        // Fetch the image buffers
        const image1Buffer = await fetchImageBuffer(brand.backgroundImgUrl);
        const image2Buffer = await fetchImageBuffer(brand.logoImgUrl);

        // Crop and resize the first image
        const resizedImage1Buffer = await sharp(image1Buffer).resize(width, height).toBuffer();
        const resizedImage1Metadata = await sharp(resizedImage1Buffer).metadata();

        // Calculate dimensions to maintain aspect ratio of image 2
        const currentImage1Metadata = await sharp(image2Buffer).metadata();
        const desiredWidth = resizedImage1Metadata.width / 3;
        const aspectRatio = currentImage1Metadata.height / currentImage1Metadata.width;
        const desiredHeight = Math.round(desiredWidth * aspectRatio);

        const resizedImage2Buffer = await sharp(image2Buffer).resize(desiredWidth, desiredHeight).toBuffer();
        const resizedImage2Metadata = await sharp(resizedImage2Buffer).metadata();

        // Calculate position to center the second image on the first image
        const left = Math.round((resizedImage1Metadata.width - resizedImage2Metadata.width) / 2);
        const top = Math.round((resizedImage1Metadata.height - resizedImage2Metadata.height) / 2);

        // Combine the images
        const combinedImage = await sharp(resizedImage1Buffer)
            .composite([{ input: resizedImage2Buffer, top, left }])
            .toBuffer();

        // Set the content type to image
        res.set('Content-Type', 'image/png');
        // Send the combined image as response
        res.send(combinedImage);
    } catch (error) {
        console.error('Error combining images:', error);
        res.status(500).send('Error combining images');
    }
};

export { controller, validation };
