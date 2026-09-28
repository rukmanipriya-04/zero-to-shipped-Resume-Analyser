# Resume analysis API

Requires Node.js 22.3 or newer.

```sh
npm install
Copy-Item .env.example .env
npm start
```

`POST /api/resume` accepts a PDF in the `resume` field and a `jobDescription` field as `multipart/form-data`. PDFs must be 5 MB or smaller; job descriptions may contain up to 20,000 characters. The server calculates a keyword-overlap score from 0 to 100 and saves the extracted text, job description, score, and matched/missing keywords in MongoDB.

The server builds the Atlas connection string from `MONGODB_USERNAME` and `MONGODB_PASSWORD`, selecting `MONGODB_DATABASE` (default `resume-analyser`). A `MONGODB_URI` can override Atlas, for example when using a local MongoDB. Credentials from `.env` take precedence; `.env.example` is loaded as a fallback. Avoid committing real credentials in `.env.example`, which is commonly checked into source control. The original PDF is processed in memory and is not stored. Set `PORT` to change the default port (`3001`), or `FRONTEND_ORIGIN` to change the allowed frontend origin (default `http://localhost:5173`).

For local development, start the API and frontend separately; Vite proxies `/api` to the API on port `3001`. For Vercel, keep the project root at the repository root. The root `vercel.json` deploys the Vite frontend and Express server as same-project services. Add `MONGODB_USERNAME`, `MONGODB_PASSWORD`, and optionally `MONGODB_DATABASE` as Vercel environment variables; do not rely on `.env.example` in production.