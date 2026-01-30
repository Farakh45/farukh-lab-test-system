import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './UploadResult.css'

const UploadResult = ({ user }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    testType: '',
    resultValue: '',
    unit: '',
    referenceRange: '',
    notes: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (user.role !== 'lab_technician') {
      setError('Only lab technicians can upload results.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await axios.post('/api/results', formData)
      navigate('/results')
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (user.role !== 'lab_technician') {
    return (
      <div className="container upload-page">
        <p className="error">Only lab technicians can upload test results.</p>
      </div>
    )
  }

  return (
    <div className="upload-page">
      <div className="container">
        <h1 className="upload-heading">Upload Test Result</h1>
        <p className="upload-desc">New results are saved with status Pending. A doctor can then mark them as Reviewed.</p>
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label>Patient name *</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Patient ID (optional)</label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Test type *</label>
            <input
              type="text"
              name="testType"
              value={formData.testType}
              onChange={handleChange}
              placeholder="e.g. CBC, Glucose"
              required
            />
          </div>
          <div className="form-group">
            <label>Result value *</label>
            <input
              type="text"
              name="resultValue"
              value={formData.resultValue}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Unit (optional)</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g. g/dL, mg/dL"
              />
            </div>
            <div className="form-group">
              <label>Reference range (optional)</label>
              <input
                type="text"
                name="referenceRange"
                value={formData.referenceRange}
                onChange={handleChange}
                placeholder="e.g. 12-16"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload result'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default UploadResult
