"use client";

export default function StarRating({ value = 0, onChange, size = 20, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(s)}
          style={{ fontSize: size, lineHeight: 1, cursor: readOnly ? "default" : "pointer", background: "none", border: "none" }}
        >
          <span style={{ color: s <= value ? "#C9A24B" : "#E5D9C3" }}>★</span>
        </button>
      ))}
    </div>
  );
}
