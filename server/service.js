import { PDFParse } from 'pdf-parse'
import { Resume } from './db.js'
import { ApiError } from './errors.js'

export async function extractResume(file, score) {
  if (!file.buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new ApiError(415, 'INVALID_PDF', 'The uploaded file is not a valid PDF.')
  }

  const parser = new PDFParse({ data: file.buffer })
  let extractedText

  try {
    const result = await parser.getText()
    extractedText = result.text.trim()
  } catch {
    throw new ApiError(422, 'PDF_PARSE_FAILED', 'The PDF could not be read.')
  } finally {
    await parser.destroy()
  }

  if (!extractedText) {
    throw new ApiError(422, 'NO_TEXT_FOUND', 'No readable text was found in the PDF.')
  }

  const resume = await Resume.create({
    filename: file.originalname,
    contentType: file.mimetype,
    sizeBytes: file.size,
    text: extractedText,
    score,
  })

  return {
    id: resume.id,
    filename: resume.filename,
    text: resume.text,
    score: resume.score,
  }
}