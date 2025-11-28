import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

class ImageService {
  private useCloudinary: boolean;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    this.useCloudinary = !!(cloudName && apiKey && apiSecret);

    if (this.useCloudinary) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      logger.info('Cloudinary configured for image storage');
    } else {
      logger.warn('Cloudinary not configured. Using local file storage.');
    }
  }

  async uploadFile(
    filePath: string,
    fileName: string,
    folder: string = 'uploads'
  ): Promise<string> {
    if (this.useCloudinary) {
      return this.uploadToCloudinary(filePath, fileName, folder);
    } else {
      return this.getLocalUrl(fileName);
    }
  }

  private async uploadToCloudinary(
    filePath: string,
    fileName: string,
    folder: string
  ): Promise<string> {
    try {
      const cloudinaryFolder = process.env.CLOUDINARY_FOLDER || 'agromarkethub';
      const fullFolder = `${cloudinaryFolder}/${folder}`;

      const result = await cloudinary.uploader.upload(filePath, {
        folder: fullFolder,
        resource_type: 'auto', // Automatically detect image, video, or raw
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      });

      // Delete local file after upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      logger.info(`File uploaded to Cloudinary: ${result.public_id}`);
      return result.secure_url;
    } catch (error: any) {
      logger.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload file to Cloudinary');
    }
  }

  private getLocalUrl(fileName: string): string {
    // Return URL for local file storage
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (this.useCloudinary && fileUrl.includes('cloudinary.com')) {
      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{folder}/{filename}.{format}
        // We need to extract everything after /upload/v{version}/
        const uploadIndex = fileUrl.indexOf('/upload/');
        if (uploadIndex > -1) {
          const afterUpload = fileUrl.substring(uploadIndex + 8); // 8 = length of '/upload/'
          // Remove version (v1234567890/)
          const versionMatch = afterUpload.match(/^v\d+\//);
          const withoutVersion = versionMatch 
            ? afterUpload.substring(versionMatch[0].length)
            : afterUpload;
          
          // Remove file extension to get public_id
          const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
          
          await cloudinary.uploader.destroy(publicId);
          logger.info(`File deleted from Cloudinary: ${publicId}`);
        }
      } catch (error: any) {
        logger.error('Cloudinary delete error:', error);
      }
    } else {
      // Delete local file
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        const filePath = path.join(process.env.UPLOAD_PATH || './uploads', fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
  }

  async uploadMultipleFiles(
    filePaths: string[],
    folder: string = 'uploads'
  ): Promise<string[]> {
    const uploadPromises = filePaths.map((filePath) => {
      const fileName = path.basename(filePath);
      return this.uploadFile(filePath, fileName, folder);
    });

    return Promise.all(uploadPromises);
  }
}

export default new ImageService();
