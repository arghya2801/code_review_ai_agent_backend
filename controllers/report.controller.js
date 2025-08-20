import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import geminiService from '../services/gemini.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Helper function to get report filename
const getReportFilename = (codeFilename) => {
  const baseName = path.parse(codeFilename).name;
  return `${baseName}_report.json`;
};

// Helper function to save report
const saveReport = (filename, reportData) => {
  const reportFilename = getReportFilename(filename);
  const reportPath = path.join(reportsDir, reportFilename);
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');
  return reportFilename;
};

// Helper function to load report
const loadReport = (filename) => {
  const reportFilename = getReportFilename(filename);
  const reportPath = path.join(reportsDir, reportFilename);
  
  if (!fs.existsSync(reportPath)) {
    return null;
  }
  
  try {
    const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    return reportData;
  } catch (error) {
    console.error('Error loading report:', error);
    return null;
  }
};

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

    // Check if report already exists
    const existingReport = loadReport(filename);
    if (existingReport) {
      return res.json({
        success: true,
        message: 'Report already exists',
        filename,
        report: existingReport.report,
        timestamp: existingReport.timestamp,
        metadata: existingReport.metadata,
        cached: true
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
    
    // Prepare report data
    const reportData = {
      filename,
      report: result.report,
      timestamp: result.timestamp,
      metadata: {
        fileSize: fs.statSync(filePath).size,
        problemStatement: problemStatement || null,
        additionalContext: additionalContext || null
      },
      generatedAt: new Date().toISOString()
    };

    // Save report to file
    const reportFilename = saveReport(filename, reportData);
    
    res.json({
      success: true,
      message: 'Report generated and saved successfully',
      filename,
      report: result.report,
      timestamp: result.timestamp,
      metadata: reportData.metadata,
      reportFilename,
      cached: false
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

// Get existing report for a file
export const getReportByFilename = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const reportData = loadReport(filename);
    
    if (!reportData) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report retrieved successfully',
      filename,
      report: reportData.report,
      timestamp: reportData.timestamp,
      metadata: reportData.metadata,
      generatedAt: reportData.generatedAt
    });

  } catch (error) {
    console.error('Error retrieving report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report',
      error: error.message
    });
  }
};

// List all available reports
export const listReports = async (req, res) => {
  try {
    if (!fs.existsSync(reportsDir)) {
      return res.json({
        success: true,
        count: 0,
        reports: []
      });
    }

    const reportFiles = fs.readdirSync(reportsDir).filter(file => file.endsWith('_report.json'));
    
    const reports = reportFiles.map(reportFile => {
      try {
        const reportPath = path.join(reportsDir, reportFile);
        const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const stats = fs.statSync(reportPath);
        
        return {
          reportFile,
          originalFilename: reportData.filename,
          timestamp: reportData.timestamp,
          generatedAt: reportData.generatedAt,
          fileSize: stats.size,
          hasReport: true,
          metadata: reportData.metadata
        };
      } catch (error) {
        console.error(`Error reading report file ${reportFile}:`, error);
        return null;
      }
    }).filter(Boolean);

    res.json({
      success: true,
      count: reports.length,
      reports
    });

  } catch (error) {
    console.error('Error listing reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list reports',
      error: error.message
    });
  }
};
