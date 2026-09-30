import { connectToDatabase } from './db.js'
import app from './app.js'

await connectToDatabase()

export default app