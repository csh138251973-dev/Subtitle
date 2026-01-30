import { useState } from 'react'
import axios from 'axios'

interface SubtitleExporterProps {
  jobId: string
  onBack: () => void
}

export default function SubtitleExporter({ jobId, onBack }: SubtitleExporterProps) {
  const [format, setFormat] = useState<'srt' | 'vtt'>('srt')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(
        `http://localhost:5000/api/subtitle/export/${jobId}?format=${format}`,
        { responseType: 'blob' }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `subtitles.${format}`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to export subtitles')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="component-card">
      <h2 className="component-title">💾 Export Subtitles</h2>

      <div className="alert alert-success">
        ✨ All processing completed successfully! Now export your subtitles.
      </div>

      <div className="form-group">
        <label>Export Format</label>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <label style={{ flex: 1, cursor: 'pointer', padding: '10px', border: '2px solid', borderColor: format === 'srt' ? '#667eea' : '#e2e8f0', borderRadius: '8px' }}>
            <input
              type="radio"
              value="srt"
              checked={format === 'srt'}
              onChange={(e) => setFormat(e.target.value as 'srt')}
            />{' '}
            SRT Format
          </label>
          <label style={{ flex: 1, cursor: 'pointer', padding: '10px', border: '2px solid', borderColor: format === 'vtt' ? '#667eea' : '#e2e8f0', borderRadius: '8px' }}>
            <input
              type="radio"
              value="vtt"
              checked={format === 'vtt'}
              onChange={(e) => setFormat(e.target.value as 'vtt')}
            />{' '}
            WebVTT Format
          </label>
        </div>
      </div>

      <p style={{ marginTop: '15px', color: '#718096', fontSize: '0.9rem' }}>
        {format === 'srt'
          ? '📋 SRT (SubRip) format - Compatible with most video players'
          : '🌐 WebVTT format - Best for web video players'}
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <button
          className="btn-success"
          onClick={handleExport}
          disabled={loading}
          style={{ flex: 1 }}
        >
          {loading ? '⏳ Exporting...' : `📥 Download ${format.toUpperCase()}`}
        </button>
        <button className="btn-secondary" onClick={onBack} disabled={loading}>
          ← Back
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '10px', color: '#2d3748' }}>✅ What's Next?</h3>
        <ul style={{ paddingLeft: '20px', color: '#718096' }}>
          <li>Open your downloaded subtitle file with your favorite video player</li>
          <li>Enjoy watching the video with Chinese subtitles!</li>
          <li>If you need further adjustments, you can edit the subtitle file with any text editor</li>
        </ul>
      </div>
    </div>
  )
}
