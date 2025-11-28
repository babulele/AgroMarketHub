import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '../models';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import imageService from '../services/imageService';
import logger from '../utils/logger';

const router = Router();

// Single file upload (for ID documents, profile pictures)
router.post(
  '/single',
  authenticate,
  uploadSingle('file'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
        return;
      }

      const fileUrl = await imageService.uploadFile(
        req.file.path,
        req.file.filename,
        'uploads'
      );

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error: any) {
      logger.error('Upload error:', error);
      next(error);
    }
  }
);

// Multiple files upload (for product images)
router.post(
  '/multiple',
  authenticate,
  authorize(UserRole.FARMER),
  uploadMultiple('files', 5),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
        return;
      }

      const files = Array.isArray(req.files) ? req.files : [req.files];
      const uploadPromises = files.map((file) =>
        imageService.uploadFile(file.path, file.filename, 'products')
      );

      const urls = await Promise.all(uploadPromises);

      res.json({
        success: true,
        message: 'Files uploaded successfully',
        data: {
          urls: urls.map((url, index) => ({
            url,
            filename: files[index].filename,
            size: files[index].size,
            mimetype: files[index].mimetype,
          })),
        },
      });
    } catch (error: any) {
      logger.error('Multiple upload error:', error);
      next(error);
    }
  }
);

// Serve uploaded files (for local storage)
router.get('/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = `${process.env.UPLOAD_PATH || './uploads'}/${filename}`;
  const fs = require('fs');
  const path = require('path');

  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

export default router;

