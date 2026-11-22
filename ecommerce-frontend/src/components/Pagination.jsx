export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // Show at most 5 page buttons around the current page
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const end = Math.min(totalPages, start + 5);
  const pages = [];
  for (let i = start; i < end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button disabled={page === 0} onClick={() => onChange(page - 1)}>Prev</button>
      {pages.map((p) => (
        <button key={p} className={p === page ? "active" : ""} onClick={() => onChange(p)}>
          {p + 1}
        </button>
      ))}
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );
}