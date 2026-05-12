import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ui/ProductCard";
import { ChevronDown, ListFilter } from "lucide-react";

export default function Category({
  categoryName,
  title,
  description,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("newest");
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);

  // FETCH PRODUCTS
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("category", categoryName)
        .gt("stock", 0);

      if (error) {
        console.error("Error fetching category:", error);
      } else {
        setProducts(data);
      }

      setLoading(false);
    };

    fetchCategoryProducts();
  }, [categoryName]);

  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  // SORT OPTIONS
  const sortOptions = [
    { id: "newest", label: "Newest Arrivals" },
    { id: "price-asc", label: "Price: Low to High" },
    { id: "price-desc", label: "Price: High to Low" },
    { id: "name-asc", label: "Name: A-Z" },
    { id: "name-desc", label: "Name: Z-A" },
  ];

  // SORTING LOGIC
  const sortedProducts = useMemo(() => {
    const list = [...products];

    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);

      case "price-desc":
        return list.sort((a, b) => b.price - a.price);

      case "name-asc":
        return list.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

      case "name-desc":
        return list.sort((a, b) =>
          b.name.localeCompare(a.name)
        );

      default:
        return list.sort((a, b) => b.id - a.id);
    }
  }, [products, sortBy]);

  const currentLabel =
    sortOptions.find((opt) => opt.id === sortBy)?.label;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            {title}
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl">
            {description}
          </p>
        </div>

        {/* SORT DROPDOWN */}
        <div className="relative" ref={dropdownRef}>

          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-fuchsia-500 mb-2 ml-1">
            Sort Collection
          </p>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-64 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <ListFilter
                size={18}
                className="text-fuchsia-500"
              />

              <span className="text-sm font-medium">
                {currentLabel}
              </span>
            </div>

            <ChevronDown
              size={18}
              className={`text-white/40 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* DROPDOWN MENU */}
          {isOpen && (
            <div className="absolute top-[110%] left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

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
        <div className="text-center py-20 text-fuchsia-500">
          Loading {categoryName}...
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
          <p className="text-fuchsia-400 text-xl font-medium">
            New {categoryName} arriving soon!
          </p>
        </div>
      )}
    </div>
  );
}