import { MessageCircle } from "lucide-react"; // or use a standard SVG

export default function WhatsAppButton() {
  const phoneNumber = "2348140181282"; // My WhatsApp number
  const defaultMessage = "Hello Verronex! I'm browsing your website, and I have a question.";

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[999] group flex items-center gap-3"
    >
      {/* Tooltip/Label (Hidden on mobile, shows on hover for desktop) */}
      <span className="hidden md:block bg-black/60 backdrop-blur-md border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
        Chat with us
      </span>

      {/* The Actual Button */}
      <div className="w-11 h-11 bg-[#038733] text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all duration-300 relative">
        <MessageCircle size={27} fill="currentColor" className="text-white" />
        
        {/* Simple Pulse Effect to draw attention */}
        <span className="absolute inset-0 rounded-full bg-[#038733] animate-ping opacity-30"></span>
      </div>
    </a>
  );
}