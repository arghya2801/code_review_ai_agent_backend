import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Allow programming files and common document types
  const allowedExtensions = /\.(js|jsx|ts|tsx|py|java|cpp|c|cs|php|rb|go|rs|html|css|scss|sass|less|vue|svelte|sql|json|xml|yaml|yml|md|txt|sh|bat|ps1|r|scala|kt|swift|dart|pl|lua|m|h|hpp|cc|cxx|f90|f95|f03|f08|vb|pas|asm|s|clj|hs|ml|fs|elm|ex|exs|erl|jl|nim|zig|v|crystal|d|groovy|gradle|makefile|dockerfile|cmake|cfg|conf|ini|toml|properties|gitignore|gitattributes|readme|license|changelog)$/i;
  
  // More comprehensive MIME type checking for programming files
  const allowedMimeTypes = /^(text\/|application\/json|application\/javascript|application\/typescript|application\/xml|application\/x-|image\/(jpeg|jpg|png|gif)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)).*$/;
  
  const extname = allowedExtensions.test(file.originalname);
  const mimetype = allowedMimeTypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error(`Invalid file type. File: ${file.originalname}, MIME: ${file.mimetype}. Only programming files and common document types are allowed.`));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

export default upload;
