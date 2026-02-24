import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from '../components/Background';
import Navbar from '../components/Navbar';
import './AdminPage.scss';

const API_URL = 'http://localhost:5000/api';

function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'calculations'

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken');

      // Fetch users
      const usersResponse = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (usersResponse.status === 403) {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const usersData = await usersResponse.json();
      setUsers(usersData.users);

      // Fetch calculations
      const calcsResponse = await fetch(`${API_URL}/admin/calculations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (calcsResponse.ok) {
        const calcsData = await calcsResponse.json();
        setCalculations(calcsData.calculations);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Background />
      <Navbar />

      <div className="admin-container">
        <div className="admin-card">
          <div className="admin-header">
            <div className="admin-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="admin-title">Admin Panel</h1>
              <p className="admin-subtitle">
                Manage users and view calculations
              </p>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number">{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {users.filter((u) => u.role === 'admin').length}
              </div>
              <div className="stat-label">Admins</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{calculations.length}</div>
              <div className="stat-label">Saved Calculations</div>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users
            </button>
            <button
              className={`tab-btn ${activeTab === 'calculations' ? 'active' : ''}`}
              onClick={() => setActiveTab('calculations')}
            >
              📊 Saved Data
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading data...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p>{error}</p>
              <button
                onClick={() => navigate('/calculator')}
                className="back-button"
              >
                Back to Calculator
              </button>
            </div>
          ) : activeTab === 'users' ? (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="id-cell">{user.id}</td>
                      <td className="name-cell">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </td>
                      <td className="email-cell">{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="date-cell">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="users-table-container">
              {calculations.length === 0 ? (
                <div className="empty-state">
                  <p>No saved calculations yet.</p>
                  <small>
                    Users can save their calculations from the calculator page.
                  </small>
                </div>
              ) : (
                <table className="users-table calculations-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Coins Used</th>
                      <th>Min Coins</th>
                      <th>Saved At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculations.map((calc) => (
                      <tr key={calc.id}>
                        <td className="name-cell">
                          <div className="user-avatar">
                            {calc.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-info">
                            <span className="user-name-text">
                              {calc.user_name}
                            </span>
                            <span className="user-email-text">
                              {calc.user_email}
                            </span>
                          </div>
                        </td>
                        <td className="amount-cell">
                          <span className="amount-badge">₹{calc.amount}</span>
                        </td>
                        <td className="coins-cell">
                          <div className="coins-list">
                            {calc.coins.slice(0, 5).map((coin, i) => (
                              <span key={i} className="coin-chip">
                                {coin}
                              </span>
                            ))}
                            {calc.coins.length > 5 && (
                              <span className="coin-chip">
                                +{calc.coins.length - 5}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="min-coins-cell">
                          <span className="min-coins-badge">
                            {calc.min_coins}
                          </span>
                        </td>
                        <td className="date-cell">
                          {formatDate(calc.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="admin-footer">
            <button
              onClick={() => navigate('/calculator')}
              className="back-link"
            >
              ← Back to Calculator
            </button>
            <button onClick={fetchData} className="refresh-button">
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminPage;
