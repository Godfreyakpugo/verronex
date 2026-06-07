// src/components/dashboard/ScraperTab.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import GlassCard from "../ui/GlassCard";
import Toast from "../ui/Toast";

const COLLECTIONS = [
  { label: "Best Selling", handle: "best-selling" },
  { label: "Laptops", handle: "laptops" },
  { label: "Phones", handle: "phones-tablets-1" },
  { label: "Accessories", handle: "accessories" },
  { label: "Smart Gadgets", handle: "smart-gadgets" },
];

const fetchAllProducts = async (collectionHandle) => {
  let allProducts = [];
  let page = 1;
  const limit = 250;
  while (true) {
    const url = `https://shopinverse.com/collections/${collectionHandle}/products.json?limit=${limit}&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const batch = data.products || [];
    allProducts = [...allProducts, ...batch];
    if (batch.length < limit) break;
    page++;
  }
  return allProducts;
};

const CATEGORY_MAP = {
  Laptops: "Laptops",
  Phones: "Phones",
  Accessories: "Accessories",
  "Smart Gadgets": "Accessories",
  "Best Selling": null, // no safe default — detect from product data
};

// Sanitises any category string before it hits the DB.
const normalizeCategory = (raw) => {
  const map = {
    laptops: "Laptops",
    phones: "Phones",
    accessories: "Accessories",
    "computer components": "Computer Components",
    "best selling": "Best Selling",
  };
  return map[(raw || "").trim().toLowerCase()] ?? "Accessories";
};

const detectCategory = (product, collectionLabel) => {
  try {
    const type = (product.product_type || "").toLowerCase();
    const tagsRaw = Array.isArray(product.tags)
      ? product.tags.join(" ")
      : product.tags || "";
    const raw = (type + " " + tagsRaw).toLowerCase();
    const title = (product.title || "").toLowerCase();

    // ── 1. GIFT CARDS ────────────────────────────────────────────────────────
    if (/gift[\s-]*card|voucher/.test(title)) return "Accessories";

    // ── 2. COMPUTER COMPONENTS — title-level (highest confidence) ────────────
    // These patterns in a product TITLE mean the product IS the component,
    // not a device that contains one.

    // RAM sticks — DDR codes in the title = this is the RAM module itself
    if (/\b(ddr[3-5]|lpddr[3-5]|pc[45]|dimm|so-?dimm)\b/.test(title))
      return "Computer Components";

    // NVMe / M.2 storage drives (guard: skip if also mentions laptop/notebook)
    if (/\bnvme\b/.test(title) && !/laptop|notebook|macbook/.test(title))
      return "Computer Components";
    if (/m\.2/.test(title) && !/laptop|notebook|macbook/.test(title))
      return "Computer Components";

    // Standalone SSD — "Samsung 870 EVO SSD" has no capacity before SSD.
    // Laptop spec — "Dell XPS - 512GB SSD" HAS capacity before SSD → ignored.
    if (/\bssd\b/.test(title) && !/\d+\s*[gt]b\s+ssd/i.test(title))
      return "Computer Components";

    // Standalone HDD — same logic as SSD above
    if (/\bhdd\b/.test(title) && !/\d+\s*[gt]b\s+hdd/i.test(title))
      return "Computer Components";

    // ── 3. STANDALONE MONITOR ────────────────────────────────────────────────
    if (/\bmonitor\b/.test(title) && !/laptop|notebook/.test(title))
      return "Accessories";

    // ── 4. ACCESSORIES — product_type / tags ─────────────────────────────────
    if (
      /bag|case|cover|charger|cable|earphone|earbuds|headphone|headset|mousepad|stand|hub|adapter|screen.?protector|power.?bank|tempered|sleeve|pouch|strap|dock|webcam|speaker|flash.?drive|pendrive|\busb\b|hdmi|vga|stylus|tripod|gimbal|ring.?light|memory.?card|sd.?card|gift.?card/.test(
        raw,
      )
    )
      return "Accessories";

    // ── 5. COMPUTER COMPONENTS — product_type / tags ─────────────────────────
    // Only fires when the product isn't already identified as a laptop/phone
    if (!/laptop|notebook|macbook|smartphone|iphone|android/.test(raw)) {
      if (
        /\b(ddr[3-5]|lpddr[3-5]|pc[45]|dimm|so-?dimm|nvme|sata)\b/.test(raw) ||
        /\b(gpu|graphics.?card|video.?card|geforce|radeon|rtx|gtx)\b/.test(
          raw,
        ) ||
        /\b(motherboard|mainboard)\b/.test(raw) ||
        /\b(power.?supply|\bpsu\b)\b/.test(raw)
      )
        return "Computer Components";
    }

    // ── 6. PHONES ────────────────────────────────────────────────────────────
    if (
      /smartphone|iphone|android|mobile.?phone/.test(type) ||
      /smartphone|iphone|android/.test(raw) ||
      /\b(smartphone|iphone|android|mobile phone|cellphone)\b/.test(title)
    )
      return "Phones";

    // ── 7. LAPTOPS ───────────────────────────────────────────────────────────
    if (
      /laptop|notebook|macbook|chromebook|ultrabook|netbook/.test(type) ||
      /laptop|notebook|macbook|chromebook|ultrabook/.test(raw) ||
      /laptop|notebook|macbook|chromebook|ultrabook/.test(title)
    )
      return "Laptops";

    // ── 8. COLLECTION-AWARE FALLBACK ─────────────────────────────────────────
    // Only trust unambiguous collections. Best Selling / Smart Gadgets
    // are mixed bags — anything unclassified there defaults to Accessories.
    if (collectionLabel === "Laptops") return "Laptops";
    if (collectionLabel === "Phones") return "Phones";
    return "Accessories";
  } catch (e) {
    if (collectionLabel === "Laptops") return "Laptops";
    if (collectionLabel === "Phones") return "Phones";
    return "Accessories";
  }
};

const parseSpecs = (product) => {
  const specs = {};

  if (product.options?.length) {
    product.options.forEach((opt, idx) => {
      if (opt.name === "Title") return;
      const val = product.variants?.[0]?.[`option${idx + 1}`];
      if (val && val !== "Default Title") specs[opt.name] = val;
    });
  }

  if (product.title) {
    const parts = product.title
      .split(" - ")
      .map((p) => p.trim())
      .filter(Boolean);
    parts.slice(1).forEach((part) => {
      const ramMatch = part.match(/^(\d+GB)\s+RAM$/i);
      if (ramMatch) {
        specs["RAM"] = ramMatch[1];
        return;
      }

      const ssdMatch = part.match(/^(\d+GB|\d+TB)\s+SSD$/i);
      if (ssdMatch) {
        specs["Storage"] = ssdMatch[1] + " SSD";
        return;
      }

      const hddMatch = part.match(/^(\d+GB|\d+TB)\s+HDD$/i);
      if (hddMatch) {
        specs["Storage"] = hddMatch[1] + " HDD";
        return;
      }

      if (
        /Intel|AMD|Qualcomm|Snapdragon|MediaTek|Dimensity|Helio/i.test(part)
      ) {
        specs["Processor"] = part;
        return;
      }

      const genMatch = part.match(/^(\d+(?:st|nd|rd|th)\s+Gen\.?)$/i);
      if (genMatch) {
        specs["Generation"] = genMatch[1];
        return;
      }

      const displayMatch = part.match(/^([\d.]+(?:-|\s)?inch)$/i);
      if (displayMatch) {
        specs["Display"] = displayMatch[1];
        return;
      }

      if (/^(FHD|HD|4K|QHD|OLED|AMOLED|1080p|720p|2K)/i.test(part)) {
        specs["Resolution"] = part;
        return;
      }

      const battMatch = part.match(/^(\d+mAh)$/i);
      if (battMatch) {
        specs["Battery"] = battMatch[1];
        return;
      }

      const featureMap = {
        Touchscreen: "Touchscreen",
        "Touch Screen": "Touchscreen",
        "Keyboard Light": "Backlit Keyboard",
        Backlit: "Backlit Keyboard",
        "Face ID": "Face ID",
        Fingerprint: "Fingerprint Sensor",
        "5G": "Network",
        "4G LTE": "Network",
      };
      for (const [keyword, specKey] of Object.entries(featureMap)) {
        if (part.toLowerCase().includes(keyword.toLowerCase())) {
          specs[specKey] = ["5G", "4G LTE"].includes(keyword) ? keyword : "Yes";
          return;
        }
      }
    });
  }

  if (product.vendor && product.vendor !== "Shopinverse" && !specs["Brand"]) {
    specs["Brand"] = product.vendor;
  }

  return specs;
};

export default function ScraperTab() {
  const [activeCollection, setActiveCollection] = useState(COLLECTIONS[0]);
  const [scraped, setScraped] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [importing, setImporting] = useState(null);
  const [importName, setImportName] = useState("");
  const [importPrice, setImportPrice] = useState("");
  const [importCategory, setImportCategory] = useState("Laptops");
  const [importImages, setImportImages] = useState([]);
  const [importStock, setImportStock] = useState(1);
  const [importSpecs, setImportSpecs] = useState({});
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [inventoryIds, setInventoryIds] = useState(new Set());
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") =>
    setToast({ show: true, message, type });

  useEffect(() => {
    const loadInventoryIds = async () => {
      const { data } = await supabase
        .from("products")
        .select("shopinverse_id")
        .not("shopinverse_id", "is", null);
      if (data) setInventoryIds(new Set(data.map((p) => p.shopinverse_id)));
    };
    loadInventoryIds();
  }, []);

  const fetchProducts = async (collection) => {
    setFetchLoading(true);
    setFetchError("");
    setScraped([]);
    try {
      const products = await fetchAllProducts(collection.handle);
      setScraped(products);
    } catch (err) {
      setFetchError(
        "Could not fetch products. This is usually a CORS issue in development — " +
          "it will work fine after deployment. Error: " +
          err.message,
      );
    }
    setFetchLoading(false);
  };

  const handleCollectionClick = (col) => {
    setActiveCollection(col);
    fetchProducts(col);
  };

  const openImport = (product) => {
    const price = product.variants?.[0]?.price
      ? Math.round(parseFloat(product.variants[0].price))
      : "";
    const images = (product.images || []).map((img) => img.src);
    const specs = parseSpecs(product);
    setImporting(product);
    setImportName(product.title || "");
    setImportPrice(price);
    setImportCategory(detectCategory(product, activeCollection.label));
    setImportImages(images);
    setImportStock(1);
    setImportSpecs(specs);
    setNewImageFiles([]);
    setSpecKey("");
    setSpecValue("");
  };

  const closeImport = () => {
    setImporting(null);
    setNewImageFiles([]);
  };

  const addSpec = () => {
    if (!specKey || !specValue) return;
    setImportSpecs({ ...importSpecs, [specKey]: specValue });
    setSpecKey("");
    setSpecValue("");
  };

  const removeSpec = (key) => {
    const s = { ...importSpecs };
    delete s[key];
    setImportSpecs(s);
  };

  const saveImport = async () => {
    if (!importName || !importPrice) {
      showToast("Name and price are required.", "error");
      return;
    }
    setSaving(true);

    let uploadedUrls = [];
    if (newImageFiles.length > 0) {
      try {
        const uploads = newImageFiles.map(async (file) => {
          const cleanName = file.name.replace(/\s+/g, "-");
          const fileName = `${Date.now()}-${cleanName}`;
          const { error } = await supabase.storage
            .from("products")
            .upload(fileName, file);
          if (error) throw error;
          const { data } = supabase.storage
            .from("products")
            .getPublicUrl(fileName);
          return data.publicUrl;
        });
        uploadedUrls = await Promise.all(uploads);
      } catch (err) {
        setSaving(false);
        showToast("Image upload error: " + err.message, "error");
        return;
      }
    }

    const finalImages = [...importImages, ...uploadedUrls];

    const { error } = await supabase.from("products").insert([
      {
        name: importName,
        price: Number(importPrice),
        stock: Number(importStock),
        category: normalizeCategory(importCategory),
        description: importing.body_html || "",
        capabilities: [],
        limitations: [],
        specs: importSpecs,
        onSale: false,
        discount: 0,
        featured: false,
        images: finalImages,
        shopinverse_id: importing.id,
        shopinverse_handle: importing.handle,
      },
    ]);

    setSaving(false);

    if (error) {
      showToast("Error saving: " + error.message, "error");
    } else {
      setSavedIds((prev) => new Set([...prev, importing.id]));
      setInventoryIds((prev) => new Set([...prev, importing.id]));
      closeImport();
      showToast(`"${importName}" imported to Verronex!`);
    }
  };

  // ── BULK IMPORT ALL ─────────────────────────────────────────
  const importAll = async () => {
    // Only import products not already in inventory
    const toImport = scraped.filter(
      (p) => !savedIds.has(p.id) && !inventoryIds.has(p.id),
    );

    if (toImport.length === 0) {
      showToast("All products already in your inventory.", "info");
      return;
    }

    setBulkImporting(true);
    setBulkProgress({ done: 0, total: toImport.length });

    let successCount = 0;
    let failCount = 0;
    const newIds = new Set();

    for (const product of toImport) {
      try {
        const price = product.variants?.[0]?.price
          ? Math.round(parseFloat(product.variants[0].price))
          : 0;
        const images = (product.images || []).map((img) => img.src);
        const specs = parseSpecs(product);
        const category = detectCategory(product, activeCollection.label);

        const { error } = await supabase.from("products").insert([
          {
            name: product.title,
            price: price,
            stock: 1,
            category: normalizeCategory(category),
            description: product.body_html || "",
            capabilities: [],
            limitations: [],
            specs: specs,
            onSale: false,
            discount: 0,
            featured: false,
            hidden: false,
            images: images,
            shopinverse_id: product.id,
            shopinverse_handle: product.handle,
          },
        ]);

        if (!error) {
          successCount++;
          newIds.add(product.id);
        } else {
          console.error("Insert error:", error.message);
          failCount++;
        }
      } catch (err) {
        console.error("Import error for product:", product.title, err);
        failCount++;
      }

      setBulkProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      await new Promise((r) => setTimeout(r, 80));
    }

    // Update local state so buttons reflect imported status
    setSavedIds((prev) => new Set([...prev, ...newIds]));
    setInventoryIds((prev) => new Set([...prev, ...newIds]));
    setBulkImporting(false);
    setBulkProgress({ done: 0, total: 0 });

    if (failCount === 0) {
      showToast(`${successCount} products imported successfully!`);
    } else {
      showToast(`${successCount} imported, ${failCount} failed.`, "error");
    }
  };

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Import from Shopinverse</h2>
        <span className="text-xs text-white/30 border border-white/10 px-3 py-1 rounded-lg">
          Powered by Shopify API
        </span>
      </div>

      {/* COLLECTION TABS */}
      <div className="flex flex-wrap gap-2">
        {COLLECTIONS.map((col) => (
          <button
            key={col.label}
            onClick={() => handleCollectionClick(col)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeCollection.label === col.label
                ? "bg-fuchsia-600 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
            }`}
          >
            {col.label}
          </button>
        ))}
      </div>

      {fetchLoading && (
        <div className="text-center py-20 text-white/40 animate-pulse">
          Fetching from Shopinverse...
        </div>
      )}
      {fetchError && (
        <GlassCard className="p-6 border-red-500/20 bg-red-500/5">
          <p className="text-red-400 text-sm">{fetchError}</p>
        </GlassCard>
      )}
      {!fetchLoading && scraped.length === 0 && !fetchError && (
        <div className="text-center py-20 text-white/30">
          Select a collection above to load products.
        </div>
      )}

      {/* IMPORT ALL BAR */}
      {scraped.length > 0 && !fetchLoading && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div>
            <p className="text-sm font-bold text-white">
              {scraped.length} products loaded
            </p>
            <p className="text-xs text-white/40 mt-0.5">
              {
                scraped.filter(
                  (p) => !savedIds.has(p.id) && !inventoryIds.has(p.id),
                ).length
              }{" "}
              not yet in your inventory
            </p>
          </div>

          {/* Progress bar shown during bulk import */}
          {bulkImporting && (
            <div className="flex-1 min-w-[160px]">
              <div className="flex justify-between text-xs text-white/40 mb-1">
                <span>Importing...</span>
                <span>
                  {bulkProgress.done}/{bulkProgress.total}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-fuchsia-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${bulkProgress.total > 0 ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={importAll}
            disabled={
              bulkImporting ||
              scraped.filter(
                (p) => !savedIds.has(p.id) && !inventoryIds.has(p.id),
              ).length === 0
            }
            className="px-5 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all active:scale-95 shrink-0"
          >
            {bulkImporting
              ? `Importing ${bulkProgress.done}/${bulkProgress.total}...`
              : `⬇ Import All (${scraped.filter((p) => !savedIds.has(p.id) && !inventoryIds.has(p.id)).length})`}
          </button>
        </div>
      )}

      {/* PRODUCT GRID */}
      {scraped.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scraped.map((product) => {
            const price = product.variants?.[0]?.price
              ? Math.round(parseFloat(product.variants[0].price))
              : null;
            const image = product.images?.[0]?.src;
            const alreadySaved = savedIds.has(product.id);
            const inInventory = inventoryIds.has(product.id);
            const buttonState = alreadySaved
              ? "just_saved"
              : inInventory
                ? "in_inventory"
                : "available";
            const specCount = Object.keys(parseSpecs(product)).length;

            return (
              <GlassCard key={product.id} className="p-4 flex flex-col gap-3">
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/5">
                  {image ? (
                    <img
                      src={image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm leading-snug line-clamp-2">
                    {product.title}
                  </p>
                  {price && (
                    <p className="text-fuchsia-400 font-bold mt-1">
                      ₦{price.toLocaleString()}
                    </p>
                  )}
                  <div className="flex gap-3 mt-1">
                    <p className="text-white/30 text-xs">
                      {product.images?.length || 0} images
                    </p>
                    {specCount > 0 && (
                      <p className="text-emerald-400/70 text-xs">
                        ✓ {specCount} specs
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (buttonState === "in_inventory")
                      setConfirmProduct(product);
                    else if (buttonState === "available") openImport(product);
                  }}
                  disabled={buttonState === "just_saved"}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                    buttonState === "just_saved"
                      ? "bg-green-500/20 text-green-400 border border-green-500/20 cursor-default"
                      : buttonState === "in_inventory"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 hover:bg-yellow-500/30"
                        : "bg-fuchsia-600 hover:bg-fuchsia-500 text-white active:scale-95"
                  }`}
                >
                  {buttonState === "just_saved"
                    ? "✓ Imported"
                    : buttonState === "in_inventory"
                      ? "⚠ Already in Inventory"
                      : "Import Product"}
                </button>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* ── IMPORT MODAL ── */}
      {importing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0010] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-white">Import Product</h3>
                <button
                  onClick={closeImport}
                  className="text-white/40 hover:text-white text-xl shrink-0"
                >
                  ×
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase font-bold">
                  Product Name
                </label>
                <input
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-fuchsia-500 transition text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase font-bold">
                  Your Selling Price (₦)
                </label>
                <input
                  type="number"
                  value={importPrice}
                  onChange={(e) => setImportPrice(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-fuchsia-500 transition text-sm"
                />
                <p className="text-[10px] text-white/30">
                  Shopinverse price: ₦
                  {Math.round(
                    parseFloat(importing.variants?.[0]?.price || 0),
                  ).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase font-bold">
                  Category
                </label>
                <select
                  value={importCategory}
                  onChange={(e) => setImportCategory(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black text-white border border-white/10 outline-none focus:border-fuchsia-500 transition text-sm"
                >
                  <option>Laptops</option>
                  <option>Phones</option>
                  <option>Accessories</option>
                  <option>Computer Components</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase font-bold">
                  Initial Stock
                </label>
                <input
                  type="number"
                  value={importStock}
                  onChange={(e) => setImportStock(e.target.value)}
                  min="0"
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-fuchsia-500 transition text-sm"
                />
              </div>

              {/* SPECS */}
              <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-fuchsia-400 uppercase font-bold tracking-widest">
                    Specifications
                  </label>
                  {Object.keys(importSpecs).length > 0 && (
                    <span className="text-[10px] text-emerald-400 font-bold">
                      ✓ {Object.keys(importSpecs).length} auto-detected
                    </span>
                  )}
                </div>
                {Object.keys(importSpecs).length > 0 ? (
                  <div className="grid grid-cols-1 gap-1.5">
                    {Object.entries(importSpecs).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between bg-black/30 px-3 py-2 rounded-lg text-xs"
                      >
                        <span className="text-fuchsia-400 font-bold shrink-0 mr-2">
                          {key}:
                        </span>
                        <span className="text-white/80 flex-1 truncate">
                          {value}
                        </span>
                        <button
                          onClick={() => removeSpec(key)}
                          className="ml-2 text-red-500 hover:text-red-400 shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/30">
                    No specs detected. Add manually below.
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Key (e.g. RAM)"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    className="w-1/3 p-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs outline-none focus:border-fuchsia-500 transition"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 16GB)"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSpec()}
                    className="flex-1 p-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs outline-none focus:border-fuchsia-500 transition"
                  />
                  <button
                    onClick={addSpec}
                    className="px-3 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* IMAGES */}
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-bold">
                  Images from Shopinverse ({importImages.length}) — click × to
                  remove
                </label>
                <div className="flex flex-wrap gap-2">
                  {importImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16">
                      <img
                        src={img}
                        className="w-full h-full object-cover rounded-lg border border-white/10"
                      />
                      <button
                        onClick={() =>
                          setImportImages(
                            importImages.filter((_, i) => i !== idx),
                          )
                        }
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] hover:bg-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {importImages.length === 0 && (
                    <p className="text-xs text-white/30">All images removed.</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase font-bold">
                  Add Your Own Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setNewImageFiles(Array.from(e.target.files))}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-sm"
                />
                {newImageFiles.length > 0 && (
                  <p className="text-xs text-fuchsia-400">
                    {newImageFiles.length} file(s) ready to upload.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2 border-t border-white/10">
                <button
                  onClick={closeImport}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveImport}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-bold text-sm transition active:scale-95"
                >
                  {saving ? "Saving..." : "Save to Verronex"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DUPLICATE CONFIRM MODAL ── */}
      {confirmProduct && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setConfirmProduct(null)}
        >
          <div
            className="bg-[#0d0010] border border-yellow-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-white font-bold">Already in Inventory</h3>
                <p className="text-white/50 text-sm mt-1">
                  <span className="text-yellow-300 font-semibold">
                    {confirmProduct.title}
                  </span>{" "}
                  is already in your inventory. Import a duplicate anyway?
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => setConfirmProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  openImport(confirmProduct);
                  setConfirmProduct(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/20 font-bold text-sm transition"
              >
                Import Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
