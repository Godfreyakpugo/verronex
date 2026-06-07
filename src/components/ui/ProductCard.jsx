import { Link } from "react-router-dom";
import GlassCard from "./GlassCard";

export default function ProductCard({ product }) {
  // Option 1 Math: Calculate the discounted price dynamically
  const discountedPrice = product.onSale
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block h-full w-full max-w-[320px] mx-auto"
    >
      <GlassCard className="h-full flex flex-col overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-fuchsia-500/20 group-hover:border-fuchsia-500/50">
        {/* Image Container with Zoom */}
        <div className="relative w-full aspect-square overflow-hidden bg-white/5">
          {product.onSale && (
            <div className="absolute top-3 left-3 z-20 bg-fuchsia-600 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-[0_0_15px_rgba(217,70,239,0.5)] animate-pulse">
              {product.discount}% OFF
            </div>
          )}
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-1 p-5 text-left">
          <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-500 font-bold mb-1">
            {String(product.category || "")
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>

          <h3 className="text-lg font-semibold text-white leading-tight mb-2 group-hover:text-fuchsia-50">
            {product.name}
          </h3>

          {/* Pricing Section */}
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex flex-col">
              {product.onSale ? (
                <>
                  {/* Original Price (The price in your JS file) */}
                  <span className="text-xs text-gray-500 line-through">
                    ₦{product.price.toLocaleString()}
                  </span>
                  {/* Calculated Sale Price */}
                  <p className="text-fuchsia-400 font-bold text-xl">
                    ₦{discountedPrice.toLocaleString()}
                  </p>
                </>
              ) : (
                /* Normal Price (When onSale is false) */
                <p className="text-fuchsia-400 font-bold text-xl">
                  ₦{product.price.toLocaleString()}
                </p>
              )}
            </div>

            <div className="w-8 h-8 rounded-full border border-fuchsia-500/30 flex items-center justify-center group-hover:bg-fuchsia-500 transition-colors">
              <span className="text-white text-xs">→</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
