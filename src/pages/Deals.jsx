import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ui/ProductCard";

export default function Deals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("onSale", true) // Only fetch products where onSale is true
        .gt("stock", 0); // Ensure we only show products that are in stock  

      if (!error) setProducts(data);
      setLoading(false);
    };
    fetchDeals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24 min-h-[70vh]">
      <div className="mb-12 border-b border-white/10 pb-8">
        <span className="text-fuchsia-500 font-bold tracking-widest uppercase text-sm">Exclusive Offers</span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mt-2">Flash Sale</h1>
        <p className="text-gray-400 mt-4 text-lg">
          Grab these premium gadgets at a fraction of the cost. Limited stock available.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-fuchsia-500">Hunting for deals...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          No active discounts right now. Check back soon!
        </div>
      )}
    </div>
  );
}