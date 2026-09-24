export default function Pagination({ page, totalPages, total, onChange }) {
  if (!total) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
      <span>
        Page {page} of {totalPages} ({total} {total === 1 ? 'ticket' : 'tickets'})
      </span>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary px-3 py-1" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </button>
        <button
          type="button"
          className="btn-secondary px-3 py-1"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}