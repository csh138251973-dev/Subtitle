import { useState } from 'react'
import axios from 'axios'

interface QualityVerifierProps {
  jobId: string
  onVerifySuccess: () => void
  onBack: () => void
}

export default function QualityVerifier({ jobId, onVerifySuccess, onBack }: QualityVerifierProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<any | null>(null)

  const handleVerify = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post('http://localhost:5000/api/subtitle/verify', {
        job_id: jobId
      })

      setReport(response.data.quality_report)
      
      setTimeout(() => {
        onVerifySuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify subtitles')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 0.9) return '#48bb78'
    if (score >= 0.7) return '#ed8936'
    if (score >= 0.5) return '#f6ad55'
    return '#f56565'
  }

  return (
    <div className="component-card">
      <h2 className="component-title">✅ Quality Verification</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {report && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div
              style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: getScoreColor(report.overall_quality_score),
                marginBottom: '10px'
              }}
            >
              {(report.overall_quality_score * 100).toFixed(1)}%
            </div>
            <p style={{ fontSize: '1.2rem', color: '#2d3748' }}>
              Quality Level: <strong>{report.quality_level.toUpperCase()}</strong>
            </p>
          </div>

          <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>📊 Quality Metrics</h3>
          <div className="quality-metrics">
            {Object.entries(report.metrics).map(([key, value]: [string, any]) => (
              <div key={key} className="metric-card">
                <div className="metric-value">{(value * 100).toFixed(0)}%</div>
                <div className="metric-label">{key.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>

          {report.issues.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>⚠️ Issues Found</h3>
              <ul style={{ paddingLeft: '20px' }}>
                {report.issues.map((issue: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '10px', color: '#f56565' }}>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '15px', color: '#2d3748' }}>💡 Recommendations</h3>
            <ul style={{ paddingLeft: '20px' }}>
              {report.recommendations.map((rec: string, idx: number) => (
                <li key={idx} style={{ marginBottom: '10px', color: '#48bb78' }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <button
          className="btn-primary"
          onClick={handleVerify}
          disabled={loading}
          style={{ flex: 1 }}
        >
          {loading ? '⏳ Verifying...' : '🔍 Verify Quality'}
        </button>
        <button className="btn-secondary" onClick={onBack} disabled={loading}>
          ← Back
        </button>
      </div>
    </div>
  )
}
