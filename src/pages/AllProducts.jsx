import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ui/ProductCard";
import { ChevronDown, ListFilter } from "lucide-react";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const PRODUCTS_PER_PAGE = 16;
  const dropdownRef = useRef(null);

  // 1. Fetch Products
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .gt("stock", 0);

      if (!error) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // 2. Click Outside Listener (Closes the dropdown)
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 3. Sorting Logic
  const sortOptions = [
    { id: "newest", label: "Newest Arrivals" },
    { id: "price-asc", label: "Price: Low to High" },
    { id: "price-desc", label: "Price: High to Low" },
    { id: "name-asc", label: "Name: A-Z" },
    { id: "name-desc", label: "Name: Z-A" },
  ];

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return list.sort((a, b) => b.id - a.id);
    }
  }, [products, sortBy]);

  /* PAGINATION LOGIC */
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  /* Reset page when sorting changes */
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  const currentLabel = sortOptions.find((opt) => opt.id === sortBy)?.label;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
            All Gadgets
          </h1>
          <p className="text-gray-400 text-lg max-w-xl font-light">
            Premium tech for the next generation. Explore the full Verronex
            catalog.
          </p>
        </div>

        {/* CUSTOM DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-fuchsia-500 mb-2 ml-1">
            Sort Collection
          </p>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-64 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all backdrop-blur-md group"
          >
            <div className="flex items-center gap-3">
              <ListFilter size={18} className="text-fuchsia-500" />
              <span className="text-sm font-medium">{currentLabel}</span>
            </div>
            <ChevronDown
              size={18}
              className={`text-white/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* DROPDOWN MENU */}
          {isOpen && (
            <div className="absolute top-[110%] left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSortBy(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 text-sm transition-all flex items-center justify-between
                    ${
                      sortBy === option.id
                        ? "bg-fuchsia-600 text-white font-bold"
                        : "text-white/60 hover:bg-fuchsia-500/10 hover:text-white"
                    }`}
                >
                  {option.label}
                  {sortBy === option.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PRODUCT GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
          <p className="text-fuchsia-500 font-bold animate-pulse">
            Syncing Verronex Inventory...
          </p>
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-40 border border-dashed border-white/10 rounded-3xl">
          <p className="text-white/30 text-xl italic font-light">
            The vault is currently empty.
          </p>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-16 flex-wrap">
          {/* PREV */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white disabled:opacity-30 hover:bg-white/10 transition"
          >
            Prev
          </button>

          {/* PAGE NUMBERS */}
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-11 h-11 rounded-xl text-sm font-bold transition
            ${
              currentPage === page
                ? "bg-fuchsia-600 text-white shadow-lg"
                : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
            }`}
              >
                {page}
              </button>
            );
          })}

          {/* NEXT */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white disabled:opacity-30 hover:bg-white/10 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
