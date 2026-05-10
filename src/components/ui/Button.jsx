export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-6 py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold transition duration-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}