import dns from 'node:dns'
import mongoose from 'mongoose'

const resumeSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    text: { type: String, required: true },
    jobDescription: { type: String, required: true },
    score: { type: Number, min: 0, max: 100, default: null },
    summary: { type: String, required: true },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    creditsPercentLeft: { type: Number, min: 0, max: 100, default: null },
  },
  { timestamps: true },
)

export const Resume = mongoose.models.Resume ?? mongoose.model('Resume', resumeSchema)

export async function connectToDatabase() {
  const username = process.env.MONGODB_USERNAME
  const password = process.env.MONGODB_PASSWORD

  if (!username || !password) {
    throw new Error('MongoDB username or password is missing.')
  }

  const uri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@cluster0.9nu6nax.mongodb.net/?appName=Cluster0`

  dns.setServers(['8.8.8.8', '1.1.1.1'])
  await mongoose.connect(uri)
  console.log('Connected to MongoDB Atlas')
}
