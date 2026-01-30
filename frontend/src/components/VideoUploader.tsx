import { useState } from 'react'
import axios from 'axios'

interface VideoUploaderProps {
  onUploadSuccess: (jobId: string) => void
}

export default function VideoUploader({ onUploadSuccess }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a video file')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('http://localhost:5000/api/video/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccess(`✅ Video uploaded successfully! Job ID: ${response.data.job_id}`)
      setTimeout(() => {
        onUploadSuccess(response.data.job_id)
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="component-card">
      <h2 className="component-title">📹 Upload Video</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="video-file">Select Video File</label>
          <input
            id="video-file"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={loading}
          />
          <p style={{ marginTop: '8px', color: '#718096', fontSize: '0.9rem' }}>
            Supported formats: MP4, MKV, AVI, MOV, FLV, WebM, WMV
          </p>
        </div>

        {file && (
          <div className="form-group">
            <p><strong>Selected file:</strong> {file.name}</p>
            <p><strong>Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button
          type="submit"
          className="btn-primary"
          disabled={!file || loading}
          style={{ width: '100%' }}
        >
          {loading ? '⏳ Uploading...' : '🚀 Upload Video'}
        </button>
      </form>
    </div>
  )
}
