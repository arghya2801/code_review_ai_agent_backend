import express from 'express';
import upload from '../middleware/upload.middleware.js';
import {
  uploadSingle,
  uploadMultiple,
  listFiles,
  downloadFile,
  deleteFile,
  getFileInfo
} from '../controllers/upload.controller.js';

const router = express.Router();

// Single file upload
router.post('/single', upload.single('file'), uploadSingle);

// Multiple files upload (max 5 files)
router.post('/multiple', upload.array('files', 5), uploadMultiple);

// Get list of uploaded files
router.get('/list', listFiles);

// Get specific file info
router.get('/info/:filename', getFileInfo);

// Download file
router.get('/download/:filename', downloadFile);

// Delete file
router.delete('/delete/:filename', deleteFile);

export default router;
