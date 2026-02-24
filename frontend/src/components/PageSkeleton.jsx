import './PageSkeleton.css';

function PageSkeleton() {
  return (
    <div className="skeleton-page">
      {/* Mock Navbar */}
      <div className="skeleton-navbar">
        <div className="skeleton-logo shimmer"></div>
        <div className="skeleton-nav-links">
          <div className="skeleton-nav-item shimmer"></div>
          <div className="skeleton-nav-item shimmer"></div>
          <div className="skeleton-nav-profile shimmer"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="skeleton-main">
        {/* Header Section */}
        <div className="skeleton-header">
          <div className="skeleton-title shimmer"></div>
          <div className="skeleton-subtitle shimmer"></div>
          <div className="skeleton-subtitle short shimmer"></div>
        </div>

        {/* Content Grid */}
        <div className="skeleton-grid">
          {/* Left Column (Inputs) */}
          <div className="skeleton-left">
            <div className="skeleton-card">
              <div className="skeleton-card-title shimmer"></div>
              <div className="skeleton-input shimmer"></div>
              <div className="skeleton-text-small shimmer"></div>
              <div className="skeleton-buttons">
                <div className="skeleton-btn shimmer"></div>
                <div className="skeleton-btn shimmer"></div>
                <div className="skeleton-btn shimmer"></div>
              </div>
            </div>

            <div className="skeleton-card">
              <div className="skeleton-card-title shimmer"></div>
              <div className="skeleton-chips">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton-chip shimmer"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Explanations/Charts) */}
          <div className="skeleton-right">
            <div className="skeleton-card large">
              <div className="skeleton-card-title shimmer"></div>
              <div className="skeleton-paragraph">
                <div className="skeleton-line shimmer"></div>
                <div className="skeleton-line shimmer"></div>
                <div className="skeleton-line short shimmer"></div>
              </div>
              <div className="skeleton-box shimmer"></div>
              <div className="skeleton-paragraph mt">
                <div className="skeleton-line shimmer"></div>
                <div className="skeleton-line short shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageSkeleton;
