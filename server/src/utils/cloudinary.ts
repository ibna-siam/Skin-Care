import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';

const isConfigured = !!(
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret &&
  config.cloudinary.cloudName !== 'your_cloud_name'
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'skincare-products'
): Promise<{ url: string; publicId: string }> {
  if (!isConfigured) {
    // Development Fallback: Convert buffer to data URI if credentials are not configured
    const base64 = buffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;
    return {
      url: dataUri,
      publicId: `dev-upload-${Date.now()}`,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1000, crop: 'limit' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export { cloudinary, isConfigured as isCloudinaryConfigured };
