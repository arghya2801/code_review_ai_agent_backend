import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadSingle = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
};

export const listFiles = (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: true,
        files: []
      });
    }

    const files = fs.readdirSync(uploadsDir);
    
    const fileList = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        uploadDate: stats.birthtime,
        modifiedDate: stats.mtime,
        url: `/api/upload/download/${filename}`
      };
    });

    res.json({
      success: true,
      count: fileList.length,
      files: fileList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to list files',
      error: error.message
    });
  }
};

export const getFileInfo = (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Basic filename validation
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const stats = fs.statSync(filePath);
    
    res.json({
      success: true,
      file: {
        filename,
        size: stats.size,
        uploadDate: stats.birthtime,
        modifiedDate: stats.mtime,
        isFile: stats.isFile(),
        extension: path.extname(filename),
        // downloadUrl: `/api/upload/download/${filename}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get file info',
      error: error.message
    });
  }
};
