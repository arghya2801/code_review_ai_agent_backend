import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import uploadRoutes from './routes/upload.route.js';
import reportRoutes from './routes/report.route.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Code Review AI API Server',
    endpoints: {
      'POST /api/upload/': 'Upload single file',
      'GET /api/upload/list': 'List all uploaded files',
      'GET /api/upload/info/:filename': 'Get specific file information',
      'POST /api/report/file/:filename': 'Generate report from uploaded file',
      'POST /api/report/code': 'Generate report from direct code input',
      'GET /api/report/format': 'Get report format template'
    }
  });
});

app.use('/api/upload', uploadRoutes);
app.use('/api/report', reportRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Upload API available at http://localhost:${PORT}/api/upload`);
  console.log(`Report API available at http://localhost:${PORT}/api/report`);
});
