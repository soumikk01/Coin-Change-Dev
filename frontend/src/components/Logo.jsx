function Logo({ size = 70, className = '' }) {
  return (
    <svg
      className={`logo ${className}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(236, 72, 153, 0.3))' }}
    >
      <defs>
        <linearGradient id="blueCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: '#2563eb', stopOpacity: 1 }}
          />
        </linearGradient>
        <linearGradient id="pinkCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f472b6', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: '#db2777', stopOpacity: 1 }}
          />
        </linearGradient>
        <radialGradient id="coinHighlight" cx="30%" cy="30%">
          <stop
            offset="0%"
            style={{ stopColor: '#ffffff', stopOpacity: 0.4 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: '#ffffff', stopOpacity: 0 }}
          />
        </radialGradient>
      </defs>
      <circle cx="65" cy="55" r="20" fill="url(#pinkCoinGrad)" />
      <circle cx="65" cy="55" r="20" fill="url(#coinHighlight)" />
      <circle cx="65" cy="55" r="16" fill="url(#pinkCoinGrad)" />
      <circle cx="55" cy="50" r="20" fill="url(#blueCoinGrad)" />
      <circle cx="55" cy="50" r="20" fill="url(#coinHighlight)" />
      <circle cx="55" cy="50" r="16" fill="url(#blueCoinGrad)" />
    </svg>
  );
}

export default Logo;
