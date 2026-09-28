import { PDFParse } from 'pdf-parse'
import { Resume } from './db.js'
import { ApiError } from './errors.js'

const ignoredTerms = new Set([
  'about', 'after', 'all', 'and', 'any', 'are', 'based', 'being', 'best', 'both',
  'can', 'candidate', 'candidates', 'company', 'daily', 'description', 'desired',
  'develop', 'experience', 'for', 'from', 'good', 'have', 'help', 'into', 'including',
  'job', 'join', 'looking', 'more', 'must', 'need', 'our', 'other', 'over', 'position',
  'preferred', 'provide', 'related', 'role', 'skills', 'strong', 'such', 'team',
  'their', 'this', 'through', 'understanding', 'using', 'various', 'what', 'which',
  'will', 'with', 'work', 'working', 'you', 'your',
])

function getKeywords(text) {
  return [...new Set(
    (text.toLowerCase().match(/[a-z][a-z0-9+#]*(?:[.-][a-z0-9+#]+)*/g) ?? [])
      .filter((term) => (term.length > 2 || ['c', 'r', 'go'].includes(term)) && !ignoredTerms.has(term)),
  )]
}

export async function extractResume(file, jobDescription) {
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

  const jobKeywords = getKeywords(jobDescription)
  if (jobKeywords.length === 0) {
    throw new ApiError(422, 'JOB_DESCRIPTION_NOT_ANALYZABLE', 'The job description does not contain enough role-specific terms to compare.')
  }

  const resumeKeywords = new Set(getKeywords(extractedText))
  const matchedKeywords = jobKeywords.filter((keyword) => resumeKeywords.has(keyword))
  const missingKeywords = jobKeywords.filter((keyword) => !resumeKeywords.has(keyword))
  const score = Math.round((matchedKeywords.length / jobKeywords.length) * 100)

  const resume = await Resume.create({
    filename: file.originalname,
    contentType: file.mimetype,
    sizeBytes: file.size,
    text: extractedText,
    jobDescription,
    score,
    matchedKeywords,
    missingKeywords,
  })

  return {
    id: resume.id,
    filename: resume.filename,
    score: resume.score,
    matchedKeywords: resume.matchedKeywords,
    missingKeywords: resume.missingKeywords,
  }
}