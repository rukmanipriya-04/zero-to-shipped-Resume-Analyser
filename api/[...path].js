let appPromise
let databasePromise

module.exports = async function handler(req, res) {
  try {
    appPromise ??= import('../server/app.js')
    const [{ default: app }, { connectToDatabase }] = await Promise.all([
      appPromise,
      import('../server/db.js'),
    ])

    if (!databasePromise) {
      databasePromise = connectToDatabase().catch((error) => {
        databasePromise = undefined
        throw error
      })
    }

    await databasePromise
    return app(req, res)
  } catch {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    return res.end(JSON.stringify({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'The resume service is temporarily unavailable.',
      },
    }))
  }
}