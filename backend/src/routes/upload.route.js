import { Router } from "express";
import multer from "multer";
import path from "path";
import { uploadFile } from "../controllers/upload.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf|txt|csv|doc|docx/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error("Unsupported file type"));
  },
});

const router = Router();
router.post("/", upload.single("file"), uploadFile);

export default router;
