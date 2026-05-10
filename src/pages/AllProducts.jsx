// src/pages/AllProducts.jsx
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ui/ProductCard";
import { useState, useEffect } from "react";

  

export default function AllProducts() {
  const [products, setProducts] = useState([]); // Start with an empty shelf
  const [loading, setLoading] = useState(true); // Show a loading state

  useEffect(() => {
    async function fetchProducts() {
      // 1. Ask Supabase for all products
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .gt("stock", 0); // Only show products that are in stock

      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        // 2. Put the data on our shelf
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

 
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
      
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          All Gadgets
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          From high-performance laptops to the latest smartphones. Explore the full Verronex collection.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
}