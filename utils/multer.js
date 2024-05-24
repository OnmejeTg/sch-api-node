import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"]; // Add PDF and DOC extensions
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    // Reject file if extension is not allowed
    cb(
      new Error("Only JPG, JPEG, PNG, PDF, DOC, and DOCX files are allowed"),
      false
    );
    return;
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// Configure Multer for memory storage
const mstorage = multer.memoryStorage();
const memoryupload = multer({ storage: mstorage, fileFilter });

export { upload, memoryupload };
