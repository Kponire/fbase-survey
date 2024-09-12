import multer from 'multer';
import path from 'path';
import sharp from 'sharp';

// Set up storage for photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize multer upload
export const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  },
});

// Optimize images using Sharp
export const optimizeImage = async (filePath) => {
  const optimizedPath = `${filePath}-optimized.jpg`;
  await sharp(filePath).resize(800, 600).toFile(optimizedPath);
  return optimizedPath;
};
