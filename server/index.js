import { connectToDatabase } from './db.js'

const { default: app } = await import('./app.js')

export default async function handler(req, res) {
  try {
    await connectToDatabase()
    return app(req, res)
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error)

    return res.status(500).json({
      error: 'DATABASE_CONNECTION_FAILED',
      message: 'Unable to connect to MongoDB.',
    })
  }
}