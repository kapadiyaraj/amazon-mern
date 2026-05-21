// ── StarRating.jsx ──────────────────────────────────────
import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

export default function StarRating({ rating = 0, count, size = 16 }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1)   return 'full';
    if (rating >= i + 0.5) return 'half';
    return 'empty';
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {stars.map((s, i) => (
          s === 'full'  ? <FaStar     key={i} size={size} color="var(--amazon-orange)" /> :
          s === 'half'  ? <FaStarHalfAlt key={i} size={size} color="var(--amazon-orange)" /> :
                          <FiStar    key={i} size={size} color="var(--border)" />
        ))}
      </div>
      {count !== undefined && (
        <span style={{ fontSize: size - 2, color: 'var(--text-secondary)' }}>({count})</span>
      )}
    </div>
  );
}
