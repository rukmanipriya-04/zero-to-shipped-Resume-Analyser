# Resume analysis API

Requires Node.js 22.3 or newer.

```sh
npm install
Copy-Item .env.example .env
npm start
```

`POST /api/resume` accepts one PDF as `multipart/form-data` in the `resume` field. Files must be 5 MB or smaller. Add an optional `score` field between 0 and 100. The extracted text, score, and upload metadata are saved in MongoDB and successful requests return `{ "success": true, "id": "...", "filename": "...", "text": "...", "score": null }` (or the supplied score).

The server builds the Atlas connection string from `MONGODB_USERNAME` and `MONGODB_PASSWORD`, selecting `MONGODB_DATABASE` (default `resume-analyser`). A `MONGODB_URI` can override Atlas, for example when using a local MongoDB. Credentials from `.env` take precedence; `.env.example` is loaded as a fallback. Avoid committing real credentials in `.env.example`, which is commonly checked into source control. The original PDF is processed in memory and is not stored. Set `PORT` to change the default port (`3001`), or `FRONTEND_ORIGIN` to change the allowed frontend origin (default `http://localhost:5173`).

For a single-project Vercel deployment, keep the Vercel project root at the repository root. The root `vercel.json` builds `frontend/`, serves `frontend/dist`, and routes `/api/*` to a serverless Express function. Add `MONGODB_USERNAME`, `MONGODB_PASSWORD`, and optionally `MONGODB_DATABASE` as Vercel environment variables; do not rely on `.env.example` in production.