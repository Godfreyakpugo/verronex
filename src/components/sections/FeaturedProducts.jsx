import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import ProductCard from "../ui/ProductCard";
import { Link } from "react-router-dom"; // Better for navigation

export default function FeaturedProducts() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true) // Only fetch featured items
        .gt("stock", 0)
        .limit(6); // Keep the homepage clean

      if (!error) setFeatured(data);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  if (loading) return <div className="py-24 text-center text-white/20">Loading Top Picks...</div>;
  if (featured.length === 0) return null; // Hide section if nothing is featured

  // In Home.jsx or Shop.jsx (wherever you display the product grid)

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="text-fuchsia-500 font-bold tracking-widest uppercase text-sm mb-2">Top Picks</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Trending Gadgets</h2>
        </div>
        <Link to="/all-products" className="hidden md:block text-sm text-gray-400 hover:text-fuchsia-400 transition border-b border-transparent hover:border-fuchsia-400 pb-1">
          View All Models →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}