import React from "react";

const GENRE_OPTIONS = [
  { value: "All", label: "🎶 All Songs" },
  { value: "Rock", label: "🎸 Rock" },
  { value: "Pop", label: "⭐ Pop" },
  { value: "Ballad", label: "💖 Ballad" },
  { value: "Theatrical", label: "🎭 Theatrical" },
  { value: "Praise", label: "❤️‍🔥 Praise" },
];

export default function GenreFilter({
  value,
  onChange,
  disabled = false,
  className = "genre-dropdown-menu",
  ariaLabel = "Filter by genre",
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {GENRE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
