// src/components/ui/Toast.jsx
import { useEffect } from "react";

export default function Toast({ message, show, onClose, type = "success" }) {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
  const colors = {
    success: "border-fuchsia-500/40 shadow-fuchsia-500/10",
    error: "border-red-500/40 shadow-red-500/10",
    info: "border-blue-500/40 shadow-blue-500/10",
  };
  const iconColors = {
    success: "bg-fuchsia-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    // Click anywhere on overlay to dismiss
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-8 px-4"
      onClick={onClose}
    >
      <div
        className={`
          flex items-center gap-4 px-6 py-4 rounded-2xl
          bg-black/80 backdrop-blur-xl border shadow-2xl
          ${colors[type]}
          animate-in fade-in slide-in-from-top-4 duration-300
        `}
        onClick={(e) => e.stopPropagation()} // clicking toast itself doesn't close
      >
        {/* Icon */}
        <div
          className={`${iconColors[type]} rounded-full w-8 h-8 flex items-center justify-center shrink-0 text-white font-black text-sm`}
        >
          {icon}
        </div>

        {/* Message */}
        <p className="text-white font-semibold text-sm">{message}</p>

        {/* Dismiss hint */}
        <button
          onClick={onClose}
          className="ml-4 text-white/30 hover:text-white/70 text-lg transition shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
}
