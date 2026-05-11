import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-8 mt-12">
  <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
    
    {/* Store Info */}
    <div className="text-white/50 text-sm">
      <span className="font-bold text-white">Verronex</span> Premium Gadgets
    </div>

    {/* THE CAMOUFLAGED LINK */}
    <div className="text-white/30 text-xs flex gap-2">
      <span>© 2026 Verronex. All rights reserved.</span>
      {/* 
        This is the secret link. It looks like a tiny, dim dot "•" next to the copyright.
        Customers will ignore it, but you know to click it.
      */}
      <Link 
        to="/verronex-admin-secret" 
        className="hover:text-fuchsia-500 transition duration-300"
      >
        •
      </Link>
    </div>

  </div>
</footer>
  );
}

export default Footer;