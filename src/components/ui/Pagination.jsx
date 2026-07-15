/**
 * Reusable pagination bar.
 *
 * Renders "Showing a–b of N" plus Prev / numbered / Next controls.
 * Returns null when there's only one page (totalCount <= pageSize), so callers
 * can drop it in unconditionally — it only appears when data exceeds one screen.
 *
 * Props:
 *   page        1-based current page
 *   pageSize    rows per page (10 for the master sheets)
 *   totalCount  total rows across all pages (server `count`)
 *   onPageChange(nextPage)
 *   disabled    optional — greys out controls while a page is loading
 */

const buildPageList = (current, total) => {
  // Compact list with ellipses: 1 … (c-1) c (c+1) … total
  const pages = [];
  const push = (v) => pages.push(v);
  const window = 1; // neighbors on each side

  for (let p = 1; p <= total; p += 1) {
    const isEdge = p === 1 || p === total;
    const isNear = p >= current - window && p <= current + window;
    if (isEdge || isNear) {
      push(p);
    } else if (pages[pages.length - 1] !== '…') {
      push('…');
    }
  }
  return pages;
};

const Pagination = ({ page, pageSize, totalCount, onPageChange, disabled = false }) => {
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  if (!totalCount || totalCount <= pageSize) return null;

  const current = Math.min(Math.max(1, page), totalPages);
  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, totalCount);

  const go = (p) => {
    if (disabled) return;
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== current) onPageChange(next);
  };

  const baseBtn = {
    minWidth: '36px',
    height: '36px',
    padding: '0 10px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--card)',
    color: 'var(--foreground)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s, border-color 0.15s',
  };

  const activeBtn = {
    ...baseBtn,
    backgroundColor: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
    cursor: 'default',
  };

  const edgeBtn = (isDisabled) => ({
    ...baseBtn,
    opacity: isDisabled || disabled ? 0.5 : 1,
    cursor: isDisabled || disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <div
      style={{
        marginTop: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>
        Showing <strong style={{ color: 'var(--foreground)' }}>{from}</strong>–
        <strong style={{ color: 'var(--foreground)' }}>{to}</strong> of{' '}
        <strong style={{ color: 'var(--foreground)' }}>{totalCount}</strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={disabled || current === 1}
          style={edgeBtn(current === 1)}
          aria-label="Previous page"
        >
          ‹ Prev
        </button>

        {buildPageList(current, totalPages).map((p, i) =>
          p === '…' ? (
            <span
              key={`ellipsis-${i}`}
              style={{ padding: '0 4px', color: 'var(--muted-foreground)' }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              disabled={disabled}
              style={p === current ? activeBtn : baseBtn}
              aria-current={p === current ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={disabled || current === totalPages}
          style={edgeBtn(current === totalPages)}
          aria-label="Next page"
        >
          Next ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;