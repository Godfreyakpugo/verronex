import { useState, useEffect  } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext"; 
import GlassCard from "../components/ui/GlassCard";
import { supabase } from "../lib/supabase";

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useCart(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showToast, setShowToast] = useState(false);


  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

 if (loading) {
  return <div className="text-center py-20">Loading product...</div>;
}
if (!product) {
  return <div className="text-center py-20 text-fuchsia-500">Product not found.</div>;
};

const handleAddToCart = () => {
  addToCart(product);
  setShowToast(true);
  setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
};

  // 1. Calculate the final price dynamically
  const finalPrice = product.onSale 
    ? product.price * (1 - product.discount / 100) 
    : product.price;

  const handleWhatsApp = () => {
    // 2. Pass the finalPrice to the WhatsApp message, not the original price!
    const message = `Hello Verronex, I'm interested in the ${product.name} (₦${finalPrice.toLocaleString()}). Is it available?`;
    const url = `https://wa.me/2348140181282?text=${encodeURIComponent(message)}`; 
    window.open(url, "_blank");
  };

  const nextImage = () => setActiveImg((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setActiveImg((prev) => (prev - 1 + product.images.length) % product.images.length);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* FANCY TOAST NOTIFICATION */}
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${showToast ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0"}`}>
        <GlassCard className="px-6 py-3 border-fuchsia-500/50 flex items-center gap-3 bg-black/60">
          <div className="bg-fuchsia-500 rounded-full p-1 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-white font-bold text-sm">{product?.name} added to cart!</p>
        </GlassCard>
      </div>
        
        {/* LEFT: Image Gallery */}
<div className="space-y-4">
  <GlassCard className="relative aspect-square rounded-3xl overflow-hidden border-white/10">
    
    {product.onSale && (
      <div className="absolute top-4 left-4 z-20 bg-fuchsia-600 text-white text-xs font-black px-3 py-1 rounded-md animate-pulse">
        {product.discount}% OFF
      </div>
    )}

    {/* Safety Check: Make sure images exists and has at least one item */}
    {product.images && product.images.length > 0 ? (
      <img 
        src={product.images[activeImg]} 
        className="w-full h-full object-cover transition-all duration-500" 
        alt={product.name} 
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-white/5">No Image Available</div>
    )}

    {/* Navigation arrows: only show if there's more than 1 image */}
    {product.images?.length > 1 && (
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <button onClick={prevImage} className="bg-black/50 p-2 rounded-full backdrop-blur-md hover:bg-fuchsia-500 transition">←</button>
        <button onClick={nextImage} className="bg-black/50 p-2 rounded-full backdrop-blur-md hover:bg-fuchsia-500 transition">→</button>
      </div>
    )}
  </GlassCard>

  {/* Thumbnails: only show if there are images */}
  <div className="flex gap-4 overflow-x-auto pb-2">
    {product.images?.map((img, index) => (
      <button 
        key={index}
        onClick={() => setActiveImg(index)}
        className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === index ? "border-fuchsia-500 scale-95" : "border-transparent opacity-50"}`}
      >
        <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
      </button>
    ))}
  </div>
</div>

        {/* RIGHT: Product Info */}
        <div className="flex flex-col h-full">
          <p className="text-fuchsia-500 font-bold tracking-widest uppercase text-sm mb-2">{product.category}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
          
          {/* 3. Updated Pricing UI */}
          <div className="mb-8">
            {product.onSale ? (
              <>
                <p className="text-xl text-gray-500 line-through mb-1">₦{product.price.toLocaleString()}</p>
                <p className="text-4xl text-fuchsia-400 font-bold">₦{finalPrice.toLocaleString()}</p>
              </>
            ) : (
              <p className="text-4xl text-fuchsia-100 font-bold">₦{product.price.toLocaleString()}</p>
            )}
          </div>

          {/* Specs Section */}
          <div className="mb-8">
            <h3 className="text-white/60 uppercase text-xs font-bold tracking-widest mb-4">Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.specs).map(([key, value]) => (
                <GlassCard key={key} className="p-4 border-white/5">
                  <p className="text-[10px] text-fuchsia-500 uppercase font-bold">{key}</p>
                  <p className="text-sm text-white/90">{value}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-auto">
             <button 
                onClick={handleAddToCart}
                className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg transition-all"
              >
              Add to Cart
            </button>
  
            
            <button 
              onClick={handleWhatsApp}
              className="flex-1 py-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-fuchsia-500/20"
            >
              Buy Now
            </button>
          </div>

        </div>
      </div>
      <div className="mt-24 border-t border-white/10 pt-16">
        <div className="max-w-4xl mx-auto">
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Product Overview</h2>
          
          {/* Marketing Description */}
            {product.description && (
        <div className="mb-16">
          <div 
  className="prose prose-invert prose-fuchsia max-w-none w-full
             prose-p:leading-relaxed prose-p:text-gray-400 
             prose-headings:text-white prose-strong:text-white 
             prose-strong:font-bold prose-img:rounded-3xl"
 dangerouslySetInnerHTML={{ 
  __html: product.description
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ') 
}}
/>
  </div>
        )}

          {/* Capabilities vs Limitations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* What It Can Do */}
            {product.capabilities && product.capabilities.length > 0 && (
              <GlassCard className="p-8 border-green-500/20 bg-green-500/5">
                <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-3">
                  <span className="bg-green-500/20 p-2 rounded-lg">🚀</span> 
                  Performance Sweet Spots
                </h3>
                <ul className="space-y-4">
                  {product.capabilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {/* What It Cannot Do */}
            {/* {product.limitations && product.limitations.length > 0 && (
              <GlassCard className="p-8 border-red-500/20 bg-red-500/5">
                <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-3">
                  <span className="bg-red-500/20 p-2 rounded-lg">⚠️</span> 
                  Product Limitations
                </h3>
                <ul className="space-y-4">
                  {product.limitations.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <span className="text-red-500 mt-1">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )} */}

          </div>
        </div>
      </div>
    </div>
  );
}