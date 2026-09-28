import { useRef, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import './Landing.css'

const MAX_FILE_SIZE = 5 * 1024 * 1024

function formatFileSize(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function App() {
  const fileInputRef = useRef(null)
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  function addFile(file) {
    if (!file) return

    const hasPdfExtension = file.name.toLowerCase().endsWith('.pdf')
    const hasPdfMimeType = !file.type || ['application/pdf', 'application/octet-stream'].includes(file.type)

    if (!hasPdfExtension || !hasPdfMimeType) {
      setError('Please choose a PDF file.')
      setResume(null)
      setResult(null)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('That file is over 5 MB. Try a smaller PDF.')
      setResume(null)
      setResult(null)
      return
    }

    setResume(file)
    setError('')
    setResult(null)
  }

  function handleFileChange(event) {
    addFile(event.target.files?.[0])
    event.target.value = ''
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    addFile(event.dataTransfer.files?.[0])
  }

  function clearFile() {
    setResume(null)
    setError('')
    setResult(null)
  }

  async function submitResume(event) {
    event.preventDefault()

    if (!resume || !jobDescription.trim()) {
      setError('Choose a PDF and add the job description to continue.')
      return
    }

    setIsSubmitting(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('resume', resume)
    formData.append('jobDescription', jobDescription.trim())

    try {
      const response = await fetch('/api/resume', {
        method: 'POST',
        body: formData,
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error?.message ?? 'The resume could not be analyzed.')
      }

      setResult(payload)
    } catch (submitError) {
      setError(submitError.message || 'Could not connect to the resume review service.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <div className="page-grain" aria-hidden="true" />
      <header className="site-header page-width">
        <a className="wordmark" href="#top" aria-label="Goodfit home">
          <span className="brand-mark"><span /></span>
          goodfit<span className="wordmark-period">.</span>
        </a>
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a className="header-link" href="#upload">
            Get your score <ArrowUpRight size={15} strokeWidth={2.2} />
          </a>
        </nav>
      </header>

      <section className="hero page-width" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT ROLE STARTS HERE</div>
          <h1>
            Hey,<br />
            get your resume<br />
            <span className="headline-accent">reviewed.</span>
          </h1>
          <p className="hero-description">
            See how your resume lines up with a specific role, and spot the skills worth bringing forward.
          </p>
          <a className="text-link" href="#upload">
            Find your score <ArrowDownRight size={17} />
          </a>
          <div className="hero-footnote">
            <div className="avatar-stack" aria-hidden="true">
              <span className="avatar avatar-one">J</span>
              <span className="avatar avatar-two">M</span>
              <span className="avatar avatar-three">A</span>
            </div>
            <span><strong>Made for your next move.</strong><br />One small step. A much stronger resume.</span>
          </div>
        </div>

        <div className="hero-art" aria-label="Resume score preview illustration">
          <div className="art-note">A clearer picture<br />of your next step <ArrowDownRight size={17} /></div>
          <div className="paper-shadow" />
          <div className="resume-paper">
            <div className="paper-topline"><span>GOODFIT / REVIEW</span><span>01 — 04</span></div>
            <div className="paper-name">Jordan<br />Morgan<span>.</span></div>
            <div className="paper-role">PRODUCT DESIGNER</div>
            <div className="paper-rule" />
            <div className="paper-section-label">EXPERIENCE</div>
            <div className="paper-lines"><i /><i /><i className="short" /></div>
            <div className="paper-section-label second-label">SELECTED WORK</div>
            <div className="paper-lines"><i /><i className="mid" /><i className="short" /></div>
            <span className="paper-stamp"><Sparkles size={13} /> YOUR STORY, SHARPER</span>
          </div>
          <div className="score-sticker">
            <span className="sticker-top">SAMPLE SCORE</span>
            <span className="sticker-score">82<span>/100</span></span>
            <span className="sticker-bottom"><span /> STRONG START</span>
          </div>
          <span className="art-sparkle sparkle-one" aria-hidden="true">✳</span>
          <span className="art-sparkle sparkle-two" aria-hidden="true">✳</span>
          <span className="art-orbit" aria-hidden="true" />
        </div>
      </section>

      <section className="upload-section page-width" id="upload" aria-labelledby="upload-title">
        <div className="upload-intro">
          <span className="section-index">01 / START HERE</span>
          <h2 id="upload-title">Your next opportunity<br />is one upload away.</h2>
          <p>Add a PDF and the job description. We’ll compare the role’s keywords with the experience in your resume.</p>
          <div className="privacy-note"><LockKeyhole size={15} /> Resume text and score are saved for this review.</div>
        </div>

        <form className="upload-column" onSubmit={submitResume}>
          <div
            className={`upload-box${isDragging ? ' is-dragging' : ''}${resume ? ' has-file' : ''}`}
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false)
            }}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              className="file-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              aria-label="Choose a resume file"
            />
            {resume ? (
              <div className="selected-file">
                <div className="file-icon"><FileText size={22} /></div>
                <div className="file-details">
                  <strong title={resume.name}>{resume.name}</strong>
                  <span>{formatFileSize(resume.size)} <span className="file-ready"><Check size={12} /> READY</span></span>
                </div>
                <button className="icon-button remove-file" onClick={clearFile} aria-label="Remove selected file" type="button">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="upload-icon"><Upload size={21} strokeWidth={1.8} /></div>
                <p className="drop-title">Drop your resume here</p>
                <p className="drop-subtitle">or <button className="browse-button" type="button" onClick={() => fileInputRef.current?.click()}>browse files</button> from your device</p>
                <div className="file-types"><span>PDF ONLY</span><span>UP TO 5 MB</span></div>
              </>
            )}
          </div>
          <label className="jd-field">
            <span>Job description</span>
            <textarea
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(event.target.value)
                setResult(null)
              }}
              maxLength={20000}
              rows={6}
              placeholder="Paste the role description you’re applying for..."
              aria-label="Job description"
            />
            <span className="jd-character-count">{jobDescription.length.toLocaleString()} / 20,000</span>
          </label>
          {error && <p className="upload-message error-message" role="alert">{error}</p>}
          <button
            className={`submit-button${!resume || !jobDescription.trim() || isSubmitting ? ' muted-button' : ''}`}
            type="submit"
            disabled={!resume || !jobDescription.trim() || isSubmitting}
          >
            {isSubmitting ? 'Comparing your resume...' : 'Score my resume'}
            {!isSubmitting && <ArrowRight size={17} />}
          </button>
          <div className="upload-assurance"><LockKeyhole size={13} /> RESUME TEXT SAVED <span /> ORIGINAL PDF DISCARDED</div>
        </form>
      </section>

      {result && (
        <section className="analysis-results page-width" aria-live="polite" aria-labelledby="results-title">
          <div className="analysis-heading">
            <div>
              <span className="section-index">03 / YOUR MATCH</span>
              <h2 id="results-title">Your resume, against the role.</h2>
              <p>Keyword coverage gives you a practical starting point for tailoring your application.</p>
            </div>
            <div className="analysis-score" aria-label={`Fit score ${result.score} out of 100`}>
              <strong>{result.score}<span>/100</span></strong>
              <span>FIT SCORE</span>
            </div>
          </div>
          <div className="keyword-groups">
            <div className="keyword-group">
              <h3>Present in your resume <span>{result.matchedKeywords.length}</span></h3>
              {result.matchedKeywords.length ? (
                <ul>{result.matchedKeywords.map((keyword) => <li key={keyword}>{keyword}</li>)}</ul>
              ) : <p>No matching keywords found yet.</p>}
            </div>
            <div className="keyword-group">
              <h3>Not found in your resume <span>{result.missingKeywords.length}</span></h3>
              {result.missingKeywords.length ? (
                <ul>{result.missingKeywords.map((keyword) => <li key={keyword}>{keyword}</li>)}</ul>
              ) : <p>All identified job-description keywords appear in your resume.</p>}
            </div>
          </div>
        </section>
      )}

      <section className="how-section page-width" id="how-it-works">
        <div className="how-heading">
          <span className="section-index">02 / THE GOOD PART</span>
          <h2>Less guessing.<br /><em>More getting there.</em></h2>
        </div>
        <div className="steps-list">
          <article className="step-row">
            <span className="step-number">01</span>
            <div><h3>Drop it in</h3><p>Upload your resume in a few seconds. No forms, no fuss.</p></div>
            <ArrowUpRight size={19} />
          </article>
          <article className="step-row">
            <span className="step-number">02</span>
            <div><h3>Compare the fit</h3><p>See which role-specific terms are present and which are missing.</p></div>
            <ArrowUpRight size={19} />
          </article>
          <article className="step-row">
            <span className="step-number">03</span>
            <div><h3>Make it stronger</h3><p>Take practical feedback into your next application.</p></div>
            <RotateCcw size={18} />
          </article>
        </div>
      </section>

      <footer className="site-footer page-width">
        <a className="wordmark" href="#top"><span className="brand-mark"><span /></span>goodfit<span className="wordmark-period">.</span></a>
        <span>Make your next move a good one.</span>
        <a href="#upload">Get started <ArrowRight size={14} /></a>
      </footer>
    </main>
  )
}

export default App
