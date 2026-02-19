/**
 * ReaderToggle — "Me / Kids" toggle buttons or filter dropdown.
 *
 * Usage:
 *   <ReaderToggle value="me" onChange={setReader} />           // compact toggle (add flow)
 *   <ReaderToggle value="" onChange={setReader} showAll />      // filter with "All" option
 */
export default function ReaderToggle({ value, onChange, showAll = false, style }) {
  const options = showAll ? [["", "All"], ["me", "Me"], ["kids", "Kids"]] : [["me", "Me"], ["kids", "Kids"]];

  return (
    <div
      style={{
        display: "inline-flex",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        ...style,
      }}
    >
      {options.map(([val, label]) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          style={{
            padding: "4px 12px",
            fontSize: "var(--font-size-sm)",
            border: "none",
            cursor: "pointer",
            background: value === val ? "var(--color-primary)" : "var(--color-bg-card)",
            color: value === val ? "#fff" : "var(--color-text)",
            fontWeight: value === val ? 600 : 400,
            transition: "var(--transition-fast)",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
