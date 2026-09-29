# Resume analysis API

Requires Node.js 22.3 or newer.

```sh
npm install
Copy-Item .env.example .env
npm start
```

`POST /api/resume` accepts a PDF in the `resume` field and a `jobDescription` field as `multipart/form-data`. PDFs must be 5 MB or smaller; job descriptions may contain up to 20,000 characters. The server extracts the text from the PDF and sends it, along with the job description, to Google Gemini for a 0–100 score, summary, strengths, matched/missing keywords, and recommendations.

The original PDF is processed in memory and is not stored. The analysis result is returned to the browser and is not persisted to a database. Set `PORT` to change the default port (`3001`), or `FRONTEND_ORIGIN` to change the allowed frontend origin (default `http://localhost:5173`).

Set `GEMINI_API_KEY` in the server environment. The key is only used by the server and is never sent to the browser.

For local development, start the API and frontend separately; Vite proxies `/api` to the API on port `3001`. For Vercel, keep the project root at the repository root. The root `vercel.json` deploys the Vite frontend and Express server as same-project services. Add `GEMINI_API_KEY` as a Vercel environment variable; do not rely on `.env.example` in production.