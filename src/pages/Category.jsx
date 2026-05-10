import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ui/ProductCard";

export default function Category({ categoryName, title, description }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      // 'ilike' ensures it finds "Laptops", "laptops", or "LAPTOPS"
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("category", categoryName);

      if (error) {
        console.error("Error fetching category:", error);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchCategoryProducts();
  }, [categoryName]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
      
      {/* Dynamic Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {title}
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          {description}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-fuchsia-500">Loading {categoryName}...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
          <p className="text-fuchsia-400 text-xl font-medium">New {categoryName} arriving soon!</p>
        </div>
      )}
    </div>
  );
}