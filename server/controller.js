import multer from 'multer'
import { ApiError } from './errors.js'
import { extractResume } from './service.js'

export async function uploadResume(req, res) {
  if (!req.file) {
    throw new ApiError(400, 'RESUME_REQUIRED', 'Attach a PDF in the "resume" field.')
  }

  const jobDescription = req.body.jobDescription?.trim()

  if (!jobDescription) {
    throw new ApiError(400, 'JOB_DESCRIPTION_REQUIRED', 'Add the job description to score your resume.')
  }

  if (jobDescription.length > 20000) {
    throw new ApiError(413, 'JOB_DESCRIPTION_TOO_LARGE', 'The job description must be 20,000 characters or less.')
  }

  const resume = await extractResume(req.file, jobDescription)
  return res.json({ success: true, ...resume })
}

export function handleError(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === 'LIMIT_FILE_SIZE'
    const unexpectedFile = error.code === 'LIMIT_UNEXPECTED_FILE'

    return res.status(tooLarge ? 413 : 400).json({
      success: false,
      error: {
        code: tooLarge ? 'FILE_TOO_LARGE' : unexpectedFile ? 'UNEXPECTED_FILE' : 'UPLOAD_FAILED',
        message: tooLarge
          ? 'The PDF must be 5 MB or smaller.'
          : unexpectedFile
            ? 'Attach one PDF in the "resume" field.'
            : 'The file upload could not be processed.',
      },
    })
  }

  const status = error.status ?? 500
  return res.status(status).json({
    success: false,
    error: {
      code: error.code ?? 'INTERNAL_ERROR',
      message: status === 500 ? 'An unexpected server error occurred.' : error.message,
    },
  })
}