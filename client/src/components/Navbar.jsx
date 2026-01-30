import { Link } from 'react-router-dom'
import './Navbar.css'

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="farukh-nav">
      <div className="farukh-nav-inner">
        <Link to="/dashboard" className="farukh-nav-brand">
          FARUKH Lab
        </Link>
        <div className="farukh-nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/results">Results</Link>
          {user.role === 'lab_technician' && <Link to="/upload">Upload</Link>}
          <button type="button" onClick={onLogout} className="btn btn-secondary farukh-nav-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
