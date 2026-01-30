import { useState } from 'react'
import axios from 'axios'

interface SubtitleTranslatorProps {
  jobId: string
  onTranslateSuccess: () => void
  onBack: () => void
}

export default function SubtitleTranslator({ jobId, onTranslateSuccess, onBack }: SubtitleTranslatorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [translated, setTranslated] = useState<any[]>([])
  const [domain, setDomain] = useState<string | null>(null)

  const handleTranslate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post('http://localhost:5000/api/subtitle/translate', {
        job_id: jobId,
        target_language: 'zh-CN',
        detect_domain: true
      })

      setTranslated(response.data.translated_subtitles)
      setDomain(response.data.detected_domain)
      
      setTimeout(() => {
        onTranslateSuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to translate subtitles')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="component-card">
      <h2 className="component-title">🌐 Translate to Chinese</h2>

      {domain && (
        <div className="alert alert-info">
          📚 Detected Domain: <strong>{domain}</strong> - Using domain-specific terminology for better accuracy
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {translated.length > 0 && (
        <div className="form-group">
          <h3 style={{ marginBottom: '15px' }}>Preview (showing first 5)</h3>
          <div className="subtitle-preview">
            {translated.slice(0, 5).map((sub, idx) => (
              <div key={idx} className="subtitle-item">
                <div className="subtitle-time">
                  {sub.start.toFixed(2)}s - {sub.end.toFixed(2)}s
                </div>
                <div style={{ marginBottom: '5px', color: '#718096', fontSize: '0.9rem' }}>
                  <strong>Original:</strong> {sub.original_text}
                </div>
                <div className="subtitle-text" style={{ color: '#667eea', fontWeight: 'bold' }}>
                  <strong>Chinese:</strong> {sub.text}
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '10px', color: '#718096' }}>
            Total: {translated.length} subtitle segments translated
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="btn-primary"
          onClick={handleTranslate}
          disabled={loading}
          style={{ flex: 1 }}
        >
          {loading ? '⏳ Translating...' : '🚀 Translate to Chinese'}
        </button>
        <button className="btn-secondary" onClick={onBack} disabled={loading}>
          ← Back
        </button>
      </div>
    </div>
  )
}
