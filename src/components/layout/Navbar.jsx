// src/components/layout/Navbar.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext"; // Import the cart hook
import logo from "../../assets/images/logo/verronex-logo.jpg";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart(); // Get the total number of items

  const navLinks = [
    { name: "Laptops", path: "/laptops" },
    { name: "Phones", path: "/phones" },
    { name: "Accessories", path: "/accessories" },
    { name: "Components", path: "/components" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">

        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3 z-50 flex-shrink-0">
          <div className="w-10 h-10 overflow-hidden rounded-full border border-white/10 group-hover:border-fuchsia-500/50 transition-colors duration-300">
            <img src={logo} alt="Verronex logo" className="w-full h-full object-cover" />
          </div>
          <span className="hidden sm:block text-2xl font-bold text-white tracking-wide group-hover:text-fuchsia-400 transition-colors duration-300">
            Verronex
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex gap-8 items-center">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.4)]" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right Side: Search & Cart */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end">
        
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block relative w-full max-w-[250px]">
            <input
              type="text"
              placeholder="Search gadgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-4 pl-10 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all placeholder:text-white/30"
            />
            
              {/* Search Icon */}
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

           
          </form>

          {/* Cart Icon */}
          <Link to="/cart" className="relative group p-2">
            <svg className="w-6 h-6 text-gray-300 group-hover:text-fuchsia-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>

            {/* Cart Badge */}
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-fuchsia-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-black animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="lg:hidden text-white p-2 z-50 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile Menu (Includes Search) */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96 border-opacity-100" : "max-h-0 border-opacity-0"}`}>
        <div className="flex flex-col px-6 py-4 gap-4">
          
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative w-full mb-2">
            <input
              type="text"
              placeholder="Search gadgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-fuchsia-500/50"
            />
          </form>
          
          
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-lg text-gray-300 hover:text-fuchsia-400 border-b border-white/5 pb-2"
            >
              {link.name}
            </Link>
          ))}

          
        </div>
      </div>

    </nav>
  );
}

export default Navbar;