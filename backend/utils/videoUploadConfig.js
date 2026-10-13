import multer from "multer";

const storage = multer.memoryStorage();

const videoUpload = multer({
  storage: storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 300MB limit for lecture videos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed (e.g. mp4, webm, mov, mkv)"));
    }
  },
});

export default videoUpload;
