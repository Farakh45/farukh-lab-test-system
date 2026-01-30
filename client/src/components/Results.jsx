import { useState, useEffect } from 'react'
import axios from 'axios'
import './Results.css'

const Results = ({ user }) => {
  const [results, setResults] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchResults = async () => {
    setLoading(true)
    try {
      const url = filter ? `/api/results?status=${filter}` : '/api/results'
      const res = await axios.get(url)
      setResults(res.data.data.results || [])
    } catch (_err) {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [filter])

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id)
    try {
      await axios.patch(`/api/results/${id}/status`, { status })
      await fetchResults()
    } catch (_err) {
      // Could show toast
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="loading">Loading results...</div>
  }

  return (
    <div className="results-page">
      <div className="container">
        <h1 className="results-heading">Test Results</h1>
        <div className="results-toolbar">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="results-filter"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        {results.length === 0 ? (
          <p className="results-empty">No results found.</p>
        ) : (
          <ul className="results-list">
            {results.map((r) => (
              <li key={r._id} className="result-item">
                <div className="result-main">
                  <span className="result-patient">{r.patientName}</span>
                  <span className="result-test">{r.testType}</span>
                  <span className="result-value">{r.resultValue} {r.unit && r.unit}</span>
                  <span className={`result-status result-status-${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </div>
                <div className="result-meta">
                  Uploaded by {r.uploadedBy?.name || '—'} · {new Date(r.createdAt).toLocaleString()}
                </div>
                <div className="result-actions">
                  {user.role === 'doctor' && r.status === 'Pending' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={actionLoading === r._id}
                      onClick={() => handleStatusUpdate(r._id, 'Reviewed')}
                    >
                      {actionLoading === r._id ? '...' : 'Mark Reviewed'}
                    </button>
                  )}
                  {user.role === 'admin' && r.status === 'Reviewed' && (
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      disabled={actionLoading === r._id}
                      onClick={() => handleStatusUpdate(r._id, 'Approved')}
                    >
                      {actionLoading === r._id ? '...' : 'Approve'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Results
