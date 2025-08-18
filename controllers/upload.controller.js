import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Single file upload controller
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

// Multiple files upload controller
export const uploadMultiple = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    }));

    res.json({
      success: true,
      message: `${req.files.length} file(s) uploaded successfully`,
      files: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
};

// Get list of uploaded files controller
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
    
    // Filter out .gitkeep and other non-uploaded files
    const uploadedFiles = files.filter(filename => filename !== '.gitkeep');
    
    const fileList = uploadedFiles.map(filename => {
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

// Download file controller
export const downloadFile = (req, res) => {
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

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Download failed',
      error: error.message
    });
  }
};

// Delete file controller
export const deleteFile = (req, res) => {
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

    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'File deleted successfully',
      filename: filename
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
    });
  }
};

// Get file info controller
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
        downloadUrl: `/api/upload/download/${filename}`
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
