import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";

function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Store Info */}
        <div className="text-white/50 text-sm text-center md:text-left">
          <span className="font-bold text-white">Verronex</span> Premium Gadgets
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4 text-white/60">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition duration-300"
          >
            <FaFacebookF size={16} />
          </a>

          <a
            href="https://instagram.com/verronex"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition duration-300"
          >
            <FaInstagram size={16} />
          </a>

          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition duration-300"
          >
            <FaXTwitter size={16} />
          </a>

          <a
            href="https://wa.me/2348140181282"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-500 transition duration-300"
          >
            <FaWhatsapp size={16} />
          </a>
        </div>

        {/* Copyright + Hidden Admin Link */}
        <div className="text-white/30 text-xs flex items-center gap-2">
          <span>© 2026 Verronex. All rights reserved.</span>

          <Link
            to="/verronex-admin-secret"
            className="opacity-20 hover:opacity-100 hover:text-fuchsia-500 transition duration-300"
          >
            •
          </Link>
        </div>

      </div>
    </footer>
  );
}

export default Footer;