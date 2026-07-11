import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import '../styles/Results.css'

interface Prediction {
  id: string
  tumorDetected: boolean
  confidence: number
  prediction: string
  createdAt: string
}

interface MRI {
  id: string
  fileName: string
  originalFileName: string
  fileSize: number
  predictions: Prediction[]
}

export default function Results() {
  const { mriId } = useParams()
  const [mri, setMri] = useState<MRI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchResults()
  }, [mriId])

  const fetchResults = async () => {
    try {
      const response = await api.get(`/uploads/${mriId}`)
      setMri(response.data)
    } catch (err) {
      setError('Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading results...</div>
  }

  if (!mri) {
    return (
      <div className="results-container">
        <div className="error-message">{error || 'MRI not found'}</div>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    )
  }

  const latestPrediction = mri.predictions[0]
  const predictionData = typeof latestPrediction.prediction === 'string'
    ? JSON.parse(latestPrediction.prediction)
    : latestPrediction.prediction

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Analysis Results</h1>
        <button onClick={() => navigate('/dashboard')} className="back-btn">Back</button>
      </div>

      <div className="results-content">
        <div className="mri-info">
          <h2>MRI Information</h2>
          <p><strong>File:</strong> {mri.originalFileName}</p>
          <p><strong>Size:</strong> {(mri.fileSize / 1024 / 1024).toFixed(2)} MB</p>
          <p><strong>Uploaded:</strong> {new Date(mri.createdAt).toLocaleString()}</p>
        </div>

        {latestPrediction && (
          <div className={`prediction-result ${latestPrediction.confidence > 0.5 ? 'positive' : 'negative'}`}>
            <h2>Tumor Detection Result</h2>

            <div className="result-indicator">
              <div className={`status-badge ${latestPrediction.confidence > 0.5 ? 'detected' : 'not-detected'}`}>
                {latestPrediction.confidence > 0.5 ? 'TUMOR DETECTED' : 'NO TUMOR DETECTED'}
              </div>
            </div>

            <div className="result-details">
              <p>
                <strong>Confidence:</strong>
                <span className="confidence-score">
                  {(latestPrediction.confidence * 100).toFixed(2)}%
                </span>
              </p>

              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${latestPrediction.confidence * 100}%` }}
                ></div>
              </div>

              <p><strong>Model Version:</strong> {predictionData.modelVersion}</p>
              <p><strong>Processing Time:</strong> {predictionData.processingTime.toFixed(2)}s</p>
            </div>

            <div className="result-timestamp">
              Analyzed on: {new Date(latestPrediction.createdAt).toLocaleString()}
            </div>
          </div>
        )}

        {mri.predictions.length > 1 && (
          <div className="history-section">
            <h2>Analysis History</h2>
            <div className="history-list">
              {mri.predictions.map((pred, index) => (
                <div key={pred.id} className="history-item">
                  <p><strong>Analysis #{index + 1}:</strong></p>
                  <p>
                    Result: {pred.tumorDetected ? 'Tumor Detected' : 'No Tumor'} |
                    Confidence: {(pred.confidence * 100).toFixed(2)}% |
                    {new Date(pred.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
