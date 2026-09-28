# Resume analysis API

Requires Node.js 22.3 or newer.

```sh
npm install
Copy-Item .env.example .env
npm start
```

`POST /api/resume` accepts a PDF in the `resume` field and a `jobDescription` field as `multipart/form-data`. PDFs must be 5 MB or smaller; job descriptions may contain up to 20,000 characters. The server sends the extracted resume text and job description to LABD for a 0–100 score, summary, strengths, matched/missing terms, and recommendations. The analysis and LABD's remaining allowance percentage are saved in MongoDB.

The server builds the Atlas connection string from `MONGODB_USERNAME` and `MONGODB_PASSWORD`, selecting `MONGODB_DATABASE` (default `resume-analyser`). A `MONGODB_URI` can override Atlas, for example when using a local MongoDB. Credentials from `.env` take precedence; `.env.example` is loaded as a fallback. Avoid committing real credentials in `.env.example`, which is commonly checked into source control. The original PDF is processed in memory and is not stored. Set `PORT` to change the default port (`3001`), or `FRONTEND_ORIGIN` to change the allowed frontend origin (default `http://localhost:5173`).

Set `LABD_API_KEY` in the server environment. The existing `LABD_AI_KEY` name is also accepted for local compatibility. The key is only used by the server and is never sent to the browser. LABD errors are returned as JSON; `402` allowance exhaustion and `429` rate limits include actionable messages.

For local development, start the API and frontend separately; Vite proxies `/api` to the API on port `3001`. For Vercel, keep the project root at the repository root. The root `vercel.json` deploys the Vite frontend and Express server as same-project services. Add `MONGODB_USERNAME`, `MONGODB_PASSWORD`, `LABD_API_KEY`, and optionally `MONGODB_DATABASE` as Vercel environment variables; do not rely on `.env.example` in production.