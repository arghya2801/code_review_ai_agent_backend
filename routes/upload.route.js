import express from 'express';
import upload from '../middleware/upload.middleware.js';
import {
  uploadSingle,
  listFiles,
  getFileInfo
} from '../controllers/upload.controller.js';

const router = express.Router();

router.post('/', upload.single('file'), uploadSingle);
router.get('/list', listFiles);
router.get('/info/:filename', getFileInfo);

export default router;
