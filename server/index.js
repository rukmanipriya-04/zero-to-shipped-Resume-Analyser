import 'dotenv/config'
import { connectToDatabase } from './db.js'

const { default: app } = await import('./app.js')
const port = Number(process.env.PORT) || 3001

async function startServer() {
  await connectToDatabase()
  app.listen(port, () => {
    console.log(`Resume analysis API listening on port ${port}`)
  })
}

startServer().catch((error) => {
  console.error('Unable to connect to MongoDB. Check credentials and Atlas network access.')
  if (error?.message) {
    console.error(error.message)
  }
  process.exitCode = 1
})