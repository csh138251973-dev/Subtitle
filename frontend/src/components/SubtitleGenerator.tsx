import { useState } from 'react'
import axios from 'axios'

interface SubtitleGeneratorProps {
  jobId: string
  onGenerateSuccess: () => void
  onBack: () => void
}

export default function SubtitleGenerator({ jobId, onGenerateSuccess, onBack }: SubtitleGeneratorProps) {
  const [method, setMethod] = useState<'audio' | 'ocr'>('audio')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subtitles, setSubtitles] = useState<any[]>([])

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      let response
      
      if (method === 'audio') {
        // First extract audio
        const audioRes = await axios.post(`http://localhost:5000/api/video/extract-audio/${jobId}`)
        console.log('Audio extracted:', audioRes.data)

        // Then generate subtitles from audio
        response = await axios.post('http://localhost:5000/api/subtitle/generate-from-audio', {
          job_id: jobId,
          language
        })
      } else {
        // Generate subtitles from OCR
        response = await axios.post('http://localhost:5000/api/subtitle/generate-from-ocr', {
          job_id: jobId
        })
      }

      setSubtitles(response.data.subtitles)
      setTimeout(() => {
        onGenerateSuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate subtitles')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="component-card">
      <h2 className="component-title">🎯 Generate Subtitles</h2>

      <div className="form-group">
        <label>Generation Method</label>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <label style={{ flex: 1, cursor: 'pointer', padding: '10px', border: '2px solid', borderColor: method === 'audio' ? '#667eea' : '#e2e8f0', borderRadius: '8px' }}>
            <input
              type="radio"
              value="audio"
              checked={method === 'audio'}
              onChange={(e) => setMethod(e.target.value as 'audio')}
            />{' '}
            🎵 From Audio (Speech-to-Text)
          </label>
          <label style={{ flex: 1, cursor: 'pointer', padding: '10px', border: '2px solid', borderColor: method === 'ocr' ? '#667eea' : '#e2e8f0', borderRadius: '8px' }}>
            <input
              type="radio"
              value="ocr"
              checked={method === 'ocr'}
              onChange={(e) => setMethod(e.target.value as 'ocr')}
            />{' '}
            📸 From Video (OCR)
          </label>
        </div>
      </div>

      {method === 'audio' && (
        <div className="form-group">
          <label htmlFor="language">Audio Language</label>
          <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">🇬🇧 English</option>
            <option value="zh">🇨🇳 Chinese</option>
            <option value="ja">🇯🇵 Japanese</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="fr">🇫🇷 French</option>
            <option value="de">🇩🇪 German</option>
          </select>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {subtitles.length > 0 && (
        <div className="form-group">
          <h3 style={{ marginBottom: '15px' }}>Preview (showing first 5)</h3>
          <div className="subtitle-preview">
            {subtitles.slice(0, 5).map((sub, idx) => (
              <div key={idx} className="subtitle-item">
                <div className="subtitle-time">
                  {sub.start.toFixed(2)}s - {sub.end.toFixed(2)}s
                </div>
                <div className="subtitle-text">{sub.text}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '10px', color: '#718096' }}>
            Total: {subtitles.length} subtitle segments
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading}
          style={{ flex: 1 }}
        >
          {loading ? '⏳ Generating...' : '✨ Generate Subtitles'}
        </button>
        <button className="btn-secondary" onClick={onBack} disabled={loading}>
          ← Back
        </button>
      </div>
    </div>
  )
}
