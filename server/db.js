import mongoose from 'mongoose'

const resumeSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    text: { type: String, required: true },
    jobDescription: { type: String, required: true },
    score: { type: Number, min: 0, max: 100, default: null },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
  },
  { timestamps: true },
)

export const Resume = mongoose.models.Resume ?? mongoose.model('Resume', resumeSchema)

export async function connectToDatabase() {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    return
  }

  const { MONGODB_USERNAME: username, MONGODB_PASSWORD: password } = process.env

  if (!username || !password) {
    throw new Error('MongoDB credentials are missing.')
  }

  const uri = new URL('mongodb+srv://cluster0.9nu6nax.mongodb.net/')
  uri.pathname = `/${encodeURIComponent(process.env.MONGODB_DATABASE ?? 'resume-analyser')}`
  uri.searchParams.set('appName', 'Cluster0')
  uri.username = username
  uri.password = password

  await mongoose.connect(uri.toString())
  console.log('Connected to MongoDB Atlas')
}