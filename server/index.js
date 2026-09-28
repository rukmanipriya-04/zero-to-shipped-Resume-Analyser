import 'dotenv/config'
import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import { connectToDatabase } from './db.js'
import { ApiError } from './errors.js'
import { handleError } from './controller.js'
import resumeRoutes from './routes.js'

dotenv.config({ path: '.env.example', override: false })

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }))
app.use('/api/resume', resumeRoutes)
app.use((req, res, next) => {
  next(new ApiError(404, 'NOT_FOUND', 'The requested endpoint does not exist.'))
})
app.use(handleError)

async function startServer() {
  await connectToDatabase()
  app.listen(port, () => {
    console.log(`Resume analysis API listening on port ${port}`)
  })
}

startServer().catch(() => {
  console.error('Unable to connect to MongoDB. Check credentials and Atlas network access.')
  process.exitCode = 1
})