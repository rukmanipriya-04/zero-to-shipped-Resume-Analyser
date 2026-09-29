import 'dotenv/config'
import dotenv from 'dotenv'
import { connectToDatabase } from './db.js'

dotenv.config({ path: '.env.example', override: false })

const { default: app } = await import('./app.js')
const port = Number(process.env.PORT) || 3001

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