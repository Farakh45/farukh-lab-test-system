import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Dashboard.css'

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({ pending: 0, reviewed: 0, approved: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/results')
        const results = res.data.data.results || []
        const pending = results.filter((r) => r.status === 'Pending').length
        const reviewed = results.filter((r) => r.status === 'Reviewed').length
        const approved = results.filter((r) => r.status === 'Approved').length
        setStats({
          pending,
          reviewed,
          approved,
          total: results.length
        })
      } catch (_err) {
        setStats({ pending: 0, reviewed: 0, approved: 0, total: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1 className="dashboard-heading">Dashboard</h1>
        <p className="dashboard-role">
          Logged in as <strong>{user.role.replace('_', ' ')}</strong>
        </p>

        <div className="dashboard-cards">
          <div className="dash-card dash-card-pending">
            <span className="dash-card-value">{stats.pending}</span>
            <span className="dash-card-label">Pending</span>
          </div>
          <div className="dash-card dash-card-reviewed">
            <span className="dash-card-value">{stats.reviewed}</span>
            <span className="dash-card-label">Reviewed</span>
          </div>
          <div className="dash-card dash-card-approved">
            <span className="dash-card-value">{stats.approved}</span>
            <span className="dash-card-label">Approved</span>
          </div>
          <div className="dash-card dash-card-total">
            <span className="dash-card-value">{stats.total}</span>
            <span className="dash-card-label">Total results</span>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/results" className="btn btn-primary">View all results</Link>
          {user.role === 'lab_technician' && (
            <Link to="/upload" className="btn btn-success">Upload test result</Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
