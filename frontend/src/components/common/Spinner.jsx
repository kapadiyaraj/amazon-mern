// ── Spinner.jsx ─────────────────────────────────────────
import { ClipLoader } from 'react-spinners';

export function Spinner({ size = 40, color = 'var(--amazon-orange)' }) {
  return (
    <div className="loading-center">
      <ClipLoader size={size} color={color} />
    </div>
  );
}

// ── Pagination.jsx ──────────────────────────────────────
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '32px 0' }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >← Prev</button>

      {pages.map(p => (
        <button
          key={p}
          className={`btn btn-sm ${p === currentPage ? 'btn-dark' : 'btn-outline'}`}
          onClick={() => onPageChange(p)}
        >{p}</button>
      ))}

      <button
        className="btn btn-outline btn-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >Next →</button>
    </div>
  );
}
