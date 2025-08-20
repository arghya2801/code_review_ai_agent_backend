import express from 'express';
import {
  generateReportFromFile,
  generateReportFromCode,
  getReportFormat,
  getReportByFilename,
  listReports
} from '../controllers/report.controller.js';

const router = express.Router();

// Generate report from uploaded file
router.post('/file/:filename', generateReportFromFile);

// Generate report from direct code input
router.post('/code', generateReportFromCode);

// Get report format template
router.get('/format', getReportFormat);

// Get existing report by filename
router.get('/file/:filename', getReportByFilename);

// List all available reports
router.get('/list', listReports);

export default router;
