import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import geminiService from '../services/gemini.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate report from uploaded file
export const generateReportFromFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const { problemStatement, additionalContext } = req.body;

    // Validate filename
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

    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Generate report using Gemini
    const contextPrompt = `
File: ${filename}
Problem Statement: ${problemStatement || 'Not provided'}
Additional Context: ${additionalContext || 'No additional context'}
`;

    const result = await geminiService.generateReport(fileContent, contextPrompt);
    
    res.json({
      success: true,
      message: 'Report generated successfully',
      filename,
      report: result.report,
      timestamp: result.timestamp,
      metadata: {
        fileSize: fs.statSync(filePath).size,
        problemStatement: problemStatement || null,
        additionalContext: additionalContext || null
      }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};

// Generate report from direct code input
export const generateReportFromCode = async (req, res) => {
  try {
    const { code, filename, problemStatement, additionalContext } = req.body;

    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Code content is required'
      });
    }

    const contextPrompt = `
File: ${filename || 'Direct input'}
Problem Statement: ${problemStatement || 'Not provided'}
Additional Context: ${additionalContext || 'No additional context'}
`;

    const result = await geminiService.generateReport(code, contextPrompt);
    
    res.json({
      success: true,
      message: 'Report generated successfully',
      report: result.report,
      timestamp: result.timestamp,
      metadata: {
        codeLength: code.length,
        filename: filename || 'direct-input',
        problemStatement: problemStatement || null,
        additionalContext: additionalContext || null
      }
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};

// Get report template/format
export const getReportFormat = async (req, res) => {
  try {
    const formatPath = path.join(__dirname, '../report_format.md');
    
    if (!fs.existsSync(formatPath)) {
      return res.status(404).json({
        success: false,
        message: 'Report format file not found'
      });
    }

    const formatContent = fs.readFileSync(formatPath, 'utf8');
    
    res.json({
      success: true,
      message: 'Report format retrieved successfully',
      format: formatContent
    });

  } catch (error) {
    console.error('Error reading report format:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report format',
      error: error.message
    });
  }
};
