import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import '../styles/Dashboard.css'

interface MRI {
  id: string
  fileName: string
  originalFileName: string
  fileSize: number
  createdAt: string
  predictions: any[]
}

export default function Dashboard() {
  const [uploads, setUploads] = useState<MRI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUploads()
  }, [])

  const fetchUploads = async () => {
    try {
      const response = await api.get('/uploads/my-uploads')
      setUploads(response.data)
    } catch (err) {
      setError('Failed to load uploads')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    navigate('/login')
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Brain Tumor Detection System</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-content">
        <Link to="/upload" className="upload-btn">Upload MRI Scan</Link>

        {error && <div className="error-message">{error}</div>}

        <div className="uploads-section">
          <h2>Your Uploads</h2>

          {uploads.length === 0 ? (
            <p className="no-uploads">No MRI scans uploaded yet. <Link to="/upload">Upload one now</Link></p>
          ) : (
            <div className="uploads-grid">
              {uploads.map((mri) => (
                <div key={mri.id} className="upload-card">
                  <h3>{mri.originalFileName}</h3>
                  <p>Size: {(mri.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  <p>Uploaded: {new Date(mri.createdAt).toLocaleDateString()}</p>
                  <p>Predictions: {mri.predictions.length}</p>
                  <Link to={`/results/${mri.id}`} className="view-results-btn">
                    View Results
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
