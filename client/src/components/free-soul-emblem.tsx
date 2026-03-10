export function FreeSoulEmblem({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <g transform="translate(50,50)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-22"
            rx="10"
            ry="20"
            fill="url(#petalGrad)"
            opacity="0.85"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle cx="0" cy="0" r="12" fill="url(#centerGrad)" />
        <circle cx="0" cy="0" r="7" fill="#fde68a" opacity="0.6" />
      </g>
    </svg>
  );
}
