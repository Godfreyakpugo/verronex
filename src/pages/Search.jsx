import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ui/ProductCard";

// Score a product against an array of search tokens.
// Higher scores surface to the top of results.
function scoreProduct(product, tokens) {
  let score = 0;

  const name = (product.name || "").toLowerCase();
  const category = (product.category || "").toLowerCase();

  // Flatten JSONB specs object: { "RAM": "16GB", "CPU": "Intel i7" } → "ram 16gb cpu intel i7"
  const specsText = Object.entries(product.specs || {})
    .map(([k, v]) => `${k} ${v}`)
    .join(" ")
    .toLowerCase();

  // Flatten JSONB array fields
  const capsText = (product.capabilities || []).join(" ").toLowerCase();
  const limsText = (product.limitations || []).join(" ").toLowerCase();

  for (const token of tokens) {
    // Name: most important field — weight by match quality
    if (name === token) {
      score += 20; // exact full match
    } else if (name.startsWith(token)) {
      score += 12; // prefix (e.g. "macbook" in "macbook pro")
    } else if (name.includes(token)) {
      score += 8; // anywhere in name
    }

    // Category: high relevance — searching "laptop" or "phone" should rank these first
    if (category.includes(token)) score += 4;

    // Specs: valuable for model/tech searches (e.g. "16gb", "m2", "amoled")
    if (specsText.includes(token)) score += 3;

    // Capabilities/limitations: lower weight, but still useful
    if (capsText.includes(token)) score += 2;
    if (limsText.includes(token)) score += 1;
  }

  return score;
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all visible, in-stock products once on mount.
  // Client-side scoring is fast enough for a store of this size,
  // and lets us re-filter instantly if the user refines the query.
  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, price, stock, category, images, onSale, discount, featured, specs, capabilities, limitations",
        )
        .eq("hidden", false)
        .gt("stock", 0);

      if (error) {
        console.error("Search fetch error:", error.message);
      } else {
        setAllProducts(data || []);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  // Re-score and re-rank whenever query or product list changes
  const searchResults = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // Split into individual tokens, drop anything under 2 chars (avoids "a", "i" noise)
    const tokens = trimmed
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length >= 2);

    if (!tokens.length) return [];

    return allProducts
      .map((product) => ({ product, score: scoreProduct(product, tokens) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product);
  }, [allProducts, query]);

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

        {!loading && query && (
          <p className="text-gray-400 mt-2">
            {searchResults.length > 0
              ? `${searchResults.length} item${searchResults.length !== 1 ? "s" : ""} found`
              : `No results for "${query}"`}
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
          <p className="text-fuchsia-500 font-bold animate-pulse">
            Searching inventory...
          </p>
        </div>
      )}

      {/* Results grid */}
      {!loading && query && searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {searchResults.map((product) => (
            <div
              key={product.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && query && searchResults.length === 0 && (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white mb-3">
            No gadgets found
          </h2>
          <p className="text-gray-400">
            Nothing matched{" "}
            <span className="text-white font-medium">
              &ldquo;{query}&rdquo;
            </span>
            . Try searching for &ldquo;laptop&rdquo;, &ldquo;Samsung&rdquo;, or
            &ldquo;headphones&rdquo;.
          </p>
        </div>
      )}

      {/* Empty query — no search entered yet */}
      {!loading && !query && (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
          <p className="text-white/30 text-xl italic font-light">
            Start typing to search the Verronex catalog.
          </p>
        </div>
      )}
    </div>
  );
}
