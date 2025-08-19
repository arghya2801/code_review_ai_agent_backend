import express from 'express';
import {
  generateReportFromFile,
  generateReportFromCode,
  getReportFormat
} from '../controllers/report.controller.js';

const router = express.Router();

// Generate report from uploaded file
router.post('/file/:filename', generateReportFromFile);

// Generate report from direct code input
router.post('/code', generateReportFromCode);

// Get report format template
router.get('/format', getReportFormat);

export default router;
