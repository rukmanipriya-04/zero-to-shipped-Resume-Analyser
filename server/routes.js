import express from 'express'
import multer from 'multer'
import { extname } from 'node:path'
import { ApiError } from './errors.js'
import { uploadResume } from './controller.js'

const maxUploadSize = 5 * 1024 * 1024
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadSize, files: 1 },
  fileFilter(req, file, callback) {
    if (
      !['application/pdf', 'application/octet-stream'].includes(file.mimetype) ||
      extname(file.originalname).toLowerCase() !== '.pdf'
    ) {
      callback(new ApiError(415, 'PDF_ONLY', 'Upload a PDF file.'))
      return
    }

    callback(null, true)
  },
})

const router = express.Router()
router.post('/', upload.single('resume'), uploadResume)

export default router