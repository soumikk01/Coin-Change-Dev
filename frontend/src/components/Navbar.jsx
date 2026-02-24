import { useNavigate } from 'react-router-dom';
import './Navbar.scss';

function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Title */}
        <div className="navbar-brand">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(236, 72, 153, 0.6))',
            }}
          >
            <defs>
              <linearGradient
                id="navCoinGradient1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: '#60a5fa', stopOpacity: 1 }}
                />
                <stop
                  offset="50%"
                  style={{ stopColor: '#ec4899', stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: '#a855f7', stopOpacity: 1 }}
                />
              </linearGradient>
              <linearGradient
                id="navCoinGradient2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: '#f472b6', stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: '#60a5fa', stopOpacity: 1 }}
                />
              </linearGradient>
              <linearGradient
                id="navCoinGradient3"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: '#a855f7', stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: '#ec4899', stopOpacity: 1 }}
                />
              </linearGradient>
            </defs>
            <circle
              cx="24"
              cy="24"
              r="11"
              fill="url(#navCoinGradient1)"
              opacity="0.95"
            />
            <circle
              cx="24"
              cy="24"
              r="9"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <circle
              cx="18"
              cy="18"
              r="8"
              fill="url(#navCoinGradient2)"
              opacity="0.85"
            />
            <circle
              cx="18"
              cy="18"
              r="6.5"
              fill="none"
              stroke="white"
              strokeWidth="1.2"
              opacity="0.5"
            />
            <circle
              cx="30"
              cy="20"
              r="6"
              fill="url(#navCoinGradient3)"
              opacity="0.75"
            />
            <path
              d="M 12 36 Q 24 32, 36 36"
              stroke="url(#navCoinGradient1)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M 36 12 Q 24 16, 12 12"
              stroke="url(#navCoinGradient2)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>
          <h1 className="navbar-title">CoinChanger</h1>
        </div>

        {/* Profile/Logout Section */}
        <div className="navbar-actions">
          {userName === 'Admin' && (
            <button className="admin-btn" onClick={() => navigate('/admin')}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                width="16"
                height="16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"
                />
              </svg>
              Admin
            </button>
          )}
          <div className="user-profile">
            <div className="user-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{userName}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
