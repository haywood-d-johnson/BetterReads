import { useState } from "react";

export default function GoalProgress({ finished, target, onSetGoal }) {
  const [editing, setEditing] = useState(!target);
  const [inputVal, setInputVal] = useState(target || 24);

  const pct = target ? Math.min(Math.round((finished / target) * 100), 100) : 0;

  function handleSave() {
    const val = Math.max(1, Math.floor(Number(inputVal)));
    if (!val || isNaN(val)) return;
    onSetGoal(val);
    setEditing(false);
  }

  if (editing || !target) {
    return (
      <div
        className="card"
        style={{
          textAlign: "center",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: "2rem" }}>{"\u{1F3AF}"}</span>
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {new Date().getFullYear()} Goal
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="number"
            min="1"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            style={{
              width: 60,
              padding: "4px 8px",
              textAlign: "center",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-bg-card)",
              color: "var(--color-text)",
              fontSize: "var(--font-size-base)",
            }}
          />
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>books</span>
        </div>
        <button
          onClick={handleSave}
          className="btn btn-primary btn-sm"
          style={{ marginTop: 4 }}
        >
          Set Goal
        </button>
      </div>
    );
  }

  return (
    <div
      data-stat-card
      className="card"
      style={{
        textAlign: "center",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        cursor: "pointer",
      }}
      onClick={() => setEditing(true)}
      title="Click to edit goal"
    >
      <span style={{ fontSize: "2rem" }}>{"\u{1F3AF}"}</span>
      <div
        style={{
          fontSize: "var(--font-size-2xl)",
          fontWeight: 700,
          fontFamily: "var(--font-family)",
          color: "var(--color-primary-dark)",
        }}
      >
        {finished} / {target}
      </div>
      <div
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {new Date().getFullYear()} Goal
      </div>
      <div
        style={{
          width: "100%",
          height: 8,
          background: "var(--color-border)",
          borderRadius: 4,
          marginTop: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: pct >= 100 ? "var(--color-success, #4caf50)" : "var(--color-primary)",
            borderRadius: 4,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div style={{ fontSize: "var(--font-size-xs, 0.75rem)", color: "var(--color-text-muted)", marginTop: 2 }}>
        {pct}%
      </div>
    </div>
  );
}
