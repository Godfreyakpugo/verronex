// src/pages/Search.jsx
import { useSearchParams } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ui/ProductCard";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  // Filter products by checking if the name or category includes the search query
  const searchResults = products.filter((product) => 
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24 min-h-[70vh]">
      
      {/* Header */}
      <div className="mb-12 border-b border-white/10 pb-8">
        <p className="text-fuchsia-500 font-bold tracking-widest uppercase text-sm mb-2">
          Search Results
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {query ? `Results for "${query}"` : "Search Gadgets"}
        </h1>
        <p className="text-gray-400 mt-2">
          Found {searchResults.length} item(s)
        </p>
      </div>

      {/* Grid or Empty State */}
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-2">No gadgets found</h2>
          <p className="text-gray-400">
            We couldn't find anything matching "{query}". Try searching for "laptops" or "Samsung".
          </p>
        </div>
      )}

    </div>
  );
}