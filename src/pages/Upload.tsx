import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import '../styles/Upload.css'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mriId, setMriId] = useState('')
  const [predicting, setPredicting] = useState(false)
  const navigate = useNavigate()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/uploads/mri', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setMriId(response.data.id)
      setSuccess('File uploaded successfully. Now analyzing...')
      setFile(null)

      // Auto-predict after upload
      setTimeout(() => handlePredict(response.data.id), 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handlePredict = async (id: string) => {
    setPredicting(true)
    try {
      await api.post(`/uploads/predict/${id}`, {})

      setTimeout(() => {
        navigate(`/results/${id}`)
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Prediction failed')
    } finally {
      setPredicting(false)
    }
  }

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h1>Upload MRI Scan</h1>
        <p>Upload a brain MRI image for tumor detection analysis</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleUpload}>
          <div className="file-input-wrapper">
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              accept="image/*"
              disabled={uploading || predicting}
            />
            <label htmlFor="file-input" className="file-label">
              {file ? file.name : 'Click to select MRI image or drag and drop'}
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || uploading || predicting}
            className="upload-submit-btn"
          >
            {uploading ? 'Uploading...' : predicting ? 'Analyzing...' : 'Upload & Analyze'}
          </button>
        </form>

        {mriId && (
          <div className="upload-success">
            <p>MRI uploaded successfully!</p>
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
