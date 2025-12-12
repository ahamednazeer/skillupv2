const multer = require("multer");

// Use memory storage to keep files in buffer for B2 upload
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit (adjusted from 5 to 10 for safety)
});

module.exports = upload;
