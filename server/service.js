import 'pdf-parse/worker'
import { PDFParse } from 'pdf-parse'
import { GoogleGenAI, Type } from '@google/genai'
import { Resume } from './db.js'
import { ApiError } from './errors.js'

const geminiModel = 'gemini-3.5-flash'

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8)
}

function parseAnalysis(raw) {
  let analysis = raw

  if (typeof raw === 'string') {
    const jsonStart = raw.indexOf('{')
    const jsonEnd = raw.lastIndexOf('}')

    if (jsonStart === -1 || jsonEnd <= jsonStart) {
      throw new ApiError(502, 'GEMINI_INVALID_RESPONSE', 'Gemini did not return a valid JSON analysis.')
    }

    try {
      analysis = JSON.parse(raw.slice(jsonStart, jsonEnd + 1))
    } catch {
      throw new ApiError(502, 'GEMINI_INVALID_RESPONSE', 'Gemini did not return a valid JSON analysis.')
    }
  }

  if (!analysis || typeof analysis !== 'object') {
    throw new ApiError(502, 'GEMINI_INVALID_RESPONSE', 'Gemini returned an unreadable analysis.')
  }

  const score = Number(analysis.score)
  if (!Number.isFinite(score) || score < 0 || score > 100 || typeof analysis.summary !== 'string') {
    throw new ApiError(502, 'GEMINI_INVALID_RESPONSE', 'Gemini returned an incomplete analysis.')
  }

  return {
    score: Math.round(score),
    summary: analysis.summary.trim(),
    matchedKeywords: normalizeList(analysis.matchedKeywords),
    missingKeywords: normalizeList(analysis.missingKeywords),
    strengths: normalizeList(analysis.strengths),
    recommendations: normalizeList(analysis.recommendations),
  }
}

async function requestGeminiAnalysis(resumeText, jobDescription) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new ApiError(503, 'GEMINI_KEY_MISSING', 'Resume analysis is not configured yet.')
  }

  const ai = new GoogleGenAI({ apiKey })

  const prompt = [
    'Compare the resume against the job description using only evidence present in the resume.',
    'Do not invent candidate experience or claim skills that are not supported by the resume.',
    'Score the candidate from 0 to 100 based on direct evidence of relevant skills, responsibilities, and experience.',
    'Return valid JSON only with this exact structure:',
    '{"score": number, "summary": string, "matchedKeywords": string[], "missingKeywords": string[], "strengths": string[], "recommendations": string[]}',
    'Each list must contain at most 8 concise items.',
    'Do not include extra commentary outside the JSON object.',
    `RESUME:\n${resumeText}`,
    `JOB DESCRIPTION:\n${jobDescription}`,
  ].join('\n\n')

  try {
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, minimum: 0, maximum: 100 },
            summary: { type: Type.STRING },
            matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['score', 'summary', 'matchedKeywords', 'missingKeywords', 'strengths', 'recommendations'],
        },
      },
    })

    const extractedText = typeof response?.text === 'string'
      ? response.text
      : (response?.candidates ?? [])
        .flatMap((candidate) => candidate?.content?.parts ?? [])
        .filter((part) => part && typeof part.text === 'string')
        .map((part) => part.text)
        .join('')

    if (!extractedText) {
      throw new ApiError(502, 'GEMINI_INVALID_RESPONSE', 'Gemini returned no usable analysis output.')
    }

    return parseAnalysis(extractedText)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    const message = error?.message ?? 'The AI resume analysis service is currently unavailable.'
    if (message.toLowerCase().includes('api key') || message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('forbidden')) {
      throw new ApiError(503, 'GEMINI_UNAUTHORIZED', 'The Gemini API key is invalid or not authorized.')
    }

    if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('429')) {
      throw new ApiError(429, 'GEMINI_RATE_LIMITED', 'The Gemini service is busy. Please try again in a moment.')
    }

    throw new ApiError(502, 'GEMINI_UNAVAILABLE', 'The AI resume analysis service is currently unavailable. Please try again.')
  }
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

  const analysis = await requestGeminiAnalysis(extractedText, jobDescription)

  const resume = await Resume.create({
    filename: file.originalname,
    contentType: file.mimetype,
    sizeBytes: file.size,
    text: extractedText,
    jobDescription,
    ...analysis,
  })

  return {
    id: resume.id,
    filename: resume.filename,
    score: resume.score,
    summary: resume.summary,
    matchedKeywords: resume.matchedKeywords,
    missingKeywords: resume.missingKeywords,
    strengths: resume.strengths,
    recommendations: resume.recommendations,
    creditsPercentLeft: resume.creditsPercentLeft,
  }
}