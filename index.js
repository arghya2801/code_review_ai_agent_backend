import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import uploadRoutes from './routes/upload.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'File Upload API Server',
    endpoints: {
      'POST /api/upload/': 'Upload single file',
      'GET /api/upload/list': 'List all uploaded files',
      'GET /api/upload/info/:filename': 'Get specific file information',
    }
  });
});

app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Upload API available at http://localhost:${PORT}/api/upload`);
});
