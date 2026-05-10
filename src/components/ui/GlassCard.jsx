function GlassCard({ children, className }) {
  return (
    <div
      className={`
        backdrop-blur-lg
        bg-white/5
        border border-white/10
        rounded-2xl
        shadow-xl
        hover:border-fuchsia-500/40
        transition
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default GlassCard;