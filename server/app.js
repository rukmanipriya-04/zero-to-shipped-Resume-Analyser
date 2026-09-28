import cors from 'cors'
import express from 'express'
import { ApiError } from './errors.js'
import { handleError } from './controller.js'
import resumeRoutes from './routes.js'

const app = express()

if (process.env.FRONTEND_ORIGIN) {
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN }))
} else if (!process.env.VERCEL) {
  app.use(cors({ origin: 'http://localhost:5173' }))
}

app.get('/health', (req, res) => {
  res.json({ success: true })
})
app.use('/api/resume', resumeRoutes)
app.use((req, res, next) => {
  next(new ApiError(404, 'NOT_FOUND', 'The requested endpoint does not exist.'))
})
app.use(handleError)

export default app