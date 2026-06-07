import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import ScraperTab from "../components/dashboard/ScraperTab";

const STATUS_STYLES = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/20",
  confirmed: "bg-blue-500/20 text-blue-300 border-blue-500/20",
  delivered: "bg-green-500/20 text-green-300 border-green-500/20",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/20",
};

export default function Dashboard() {
  const navigate = useNavigate();

  // --- TAB STATE ---
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "orders"

  // --- PRODUCT FORM STATE ---
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Laptops");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [specs, setSpecs] = useState({});
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [capabilities, setCapabilities] = useState([""]);
  const [limitations, setLimitations] = useState([""]);
  const [showPreview, setShowPreview] = useState(false);
  const [stock, setStock] = useState(1);

  // --- ORDERS STATE ---
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // --- PENDING APPROVAL STATE ---
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    checkUser();
    fetchProducts();
    fetchOrders();
    fetchPending();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) navigate("/verronex-admin-secret");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/verronex-admin-secret");
  };

  // ─── ORDERS ────────────────────────────────────────────────

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data);
    setOrdersLoading(false);
  };

  // ─── PENDING APPROVALS ──────────────────────────────────────

  const fetchPending = async () => {
    setPendingLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("hidden", true)
      .order("id", { ascending: false });
    setPendingProducts(data || []);
    setPendingLoading(false);
  };

  const approveProduct = async (id) => {
    setApprovingId(id);
    const { error } = await supabase
      .from("products")
      .update({ hidden: false })
      .eq("id", id);
    if (!error) setPendingProducts((prev) => prev.filter((p) => p.id !== id));
    setApprovingId(null);
  };

  const approveAll = async () => {
    if (
      !window.confirm(
        `Approve all ${pendingProducts.length} pending products? They will go live immediately.`,
      )
    )
      return;
    const ids = pendingProducts.map((p) => p.id);
    const { error } = await supabase
      .from("products")
      .update({ hidden: false })
      .in("id", ids);
    if (!error) {
      setPendingProducts([]);
      fetchProducts();
    }
  };

  const rejectProduct = async (id, imageUrls) => {
    if (!window.confirm("Delete this product permanently?")) return;
    if (imageUrls?.length > 0) {
      const files = imageUrls.map((u) => u.split("/").pop());
      await supabase.storage.from("products").remove(files);
    }
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) setPendingProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order? This cannot be undone.")) return;
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) alert(error.message);
    else setOrders(orders.filter((o) => o.id !== orderId));
  };

  // ─── PRODUCTS ──────────────────────────────────────────────

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });
    if (!error) setProducts(data);
  };

  const addSpec = () => {
    if (!specKey || !specValue) return;
    setSpecs({ ...specs, [specKey]: specValue });
    setSpecKey("");
    setSpecValue("");
  };

  const removeSpec = (keyToRemove) => {
    const newSpecs = { ...specs };
    delete newSpecs[keyToRemove];
    setSpecs(newSpecs);
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(
      existingImages.filter((_, index) => index !== indexToRemove),
    );
  };

  const deleteProduct = async (id, imageUrls) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    setLoading(true);
    if (imageUrls && imageUrls.length > 0) {
      const filesToDelete = imageUrls.map((url) => url.split("/").pop());
      await supabase.storage.from("products").remove(filesToDelete);
    }
    const { error } = await supabase.from("products").delete().eq("id", id);
    setLoading(false);
    if (error) alert("Error: " + error.message);
    else fetchProducts();
  };

  const updateStock = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", id);
    if (error) alert(error.message);
    else
      setProducts(
        products.map((p) => (p.id === id ? { ...p, stock: newStock } : p)),
      );
  };

  const setManualStock = async (id, value) => {
    const newStock = Math.max(0, parseInt(value) || 0);
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", id);
    if (error) alert(error.message);
    else
      setProducts(
        products.map((p) => (p.id === id ? { ...p, stock: newStock } : p)),
      );
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setCategory(product.category);
    setDescription(product.description || "");
    setSpecs(product.specs || {});
    setIsFeatured(product.featured);
    setOnSale(product.onSale);
    setDiscount(product.discount);
    setExistingImages(product.images || []);
    setCapabilities(
      Array.isArray(product.capabilities) ? product.capabilities : [""],
    );
    setLimitations(
      Array.isArray(product.limitations) ? product.limitations : [""],
    );
    setStock(typeof product.stock === "number" ? product.stock : 1);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setDescription("");
    setSpecs({});
    setImageFiles([]);
    setExistingImages([]);
    setIsFeatured(false);
    setOnSale(false);
    setDiscount(0);
    setShowForm(false);
  };

  const handleArrayChange = (index, value, type) => {
    const newArray = type === "cap" ? [...capabilities] : [...limitations];
    newArray[index] = value;
    type === "cap" ? setCapabilities(newArray) : setLimitations(newArray);
  };

  const addField = (type) => {
    type === "cap"
      ? setCapabilities([...capabilities, ""])
      : setLimitations([...limitations, ""]);
  };

  const saveProduct = async () => {
    if (!name || !price) return alert("Name and price required");
    setLoading(true);

    let newImageUrls = [];
    if (imageFiles.length > 0) {
      try {
        const uploadPromises = imageFiles.map(async (file) => {
          const cleanName = file.name.replace(/\s+/g, "-");
          const fileName = `${Date.now()}-${cleanName}`;
          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(fileName, file);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage
            .from("products")
            .getPublicUrl(fileName);
          return data.publicUrl;
        });
        newImageUrls = await Promise.all(uploadPromises);
      } catch (err) {
        setLoading(false);
        return alert("Error uploading images: " + err.message);
      }
    }

    const finalImagesArray = [...existingImages, ...newImageUrls];
    const productData = {
      name,
      price: Number(price),
      stock: Number(stock),
      category,
      description,
      capabilities,
      limitations,
      specs,
      onSale,
      discount: Number(discount),
      featured: isFeatured,
      images: finalImagesArray,
    };

    let result;
    if (editingId) {
      result = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);
    } else {
      result = await supabase
        .from("products")
        .insert([{ ...productData, stock: 1, images: finalImagesArray }]);
    }

    setLoading(false);
    if (result.error) return alert(result.error.message);
    alert(editingId ? "Product updated!" : "Product added!");
    cancelEdit();
    fetchProducts();
  };

  // ─── RENDER ────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      {/* TOP BAR */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* TABS */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "inventory" ? "bg-fuchsia-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
            >
              📦 Inventory
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all relative ${activeTab === "orders" ? "bg-fuchsia-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
            >
              🧾 Orders
              {orders.filter((o) => o.status === "pending").length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {orders.filter((o) => o.status === "pending").length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("pending");
                fetchPending();
              }}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all relative ${activeTab === "pending" ? "bg-fuchsia-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
            >
              ⏳ Pending
              {pendingProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-fuchsia-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingProducts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("scraper")}
              className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "scraper" ? "bg-fuchsia-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
            >
              🔗 Import
            </button>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3">
            {activeTab === "inventory" && (
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? "Close Form" : "+ Add Product"}
              </Button>
            )}
            <Button onClick={logout} className="bg-red-600 hover:bg-red-500">
              Logout
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* ── INVENTORY TAB ── */}
      {activeTab === "inventory" && (
        <>
          {/* PRODUCT FORM */}
          {showForm && (
            <GlassCard className="p-8 mt-8 space-y-4">
              <h2 className="text-2xl font-bold">
                {editingId ? "Edit Product" : "Add Product"}
              </h2>

              <input
                type="text"
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-fuchsia-500 transition"
              />

              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-fuchsia-500 transition"
              />

              <div className="space-y-1">
                <label className="text-[10px] text-white/40 uppercase font-bold pl-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  placeholder="Initial Stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-fuchsia-500 outline-none transition"
                  min="0"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-4 rounded-xl bg-black text-white border border-white/10"
              >
                <option>Laptops</option>
                <option>Phones</option>
                <option>Accessories</option>
                <option>Computer Components</option>
                <option>Best Selling</option>
              </select>

              {/* MARKETING DESCRIPTION */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-bold text-fuchsia-500 uppercase tracking-widest">
                    Marketing Description
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${showPreview ? "bg-fuchsia-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"}`}
                  >
                    {showPreview ? "Edit Text" : "Preview Design"}
                  </button>
                </div>
                <div className="bg-white/5 rounded-xl overflow-auto border border-white/10 min-h-[200px]">
                  {showPreview ? (
                    <div className="p-4 prose prose-invert prose-fuchsia max-w-none min-w-0 w-full">
                      {description ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: description
                              .replace(/&nbsp;/g, " ")
                              .replace(/\u00A0/g, " "),
                          }}
                        />
                      ) : (
                        <p className="text-gray-500 italic">
                          Nothing to preview yet...
                        </p>
                      )}
                    </div>
                  ) : (
                    <ReactQuill
                      theme="snow"
                      value={description}
                      onChange={setDescription}
                      className="text-white bg-black/20"
                    />
                  )}
                </div>
              </div>

              {/* CAPABILITIES */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  Capabilities
                </label>
                {capabilities.map((cap, index) => (
                  <input
                    key={index}
                    value={cap}
                    onChange={(e) =>
                      handleArrayChange(index, e.target.value, "cap")
                    }
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-emerald-500 transition"
                    placeholder="e.g. 4K Video Editing"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addField("cap")}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  + Add Capability
                </button>
              </div>

              {/* LIMITATIONS */}
              <div className="space-y-4 pt-4">
                <label className="text-xs font-bold text-red-500 uppercase tracking-widest">
                  Limitations
                </label>
                {limitations.map((lim, index) => (
                  <input
                    key={index}
                    value={lim}
                    onChange={(e) =>
                      handleArrayChange(index, e.target.value, "lim")
                    }
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-red-500 transition"
                    placeholder="e.g. No SD Card Slot"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addField("lim")}
                  className="text-xs text-red-400 hover:text-red-300 font-bold"
                >
                  + Add Limitation
                </button>
              </div>

              {/* SPEC BUILDER */}
              <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-white/5">
                <h3 className="font-bold text-sm text-white/70 uppercase">
                  Product Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/10 text-sm"
                    >
                      <span className="text-fuchsia-400 font-bold truncate mr-2">
                        {key}:
                      </span>
                      <span className="text-white/80 truncate flex-1">
                        {value}
                      </span>
                      <button
                        onClick={() => removeSpec(key)}
                        className="ml-2 text-red-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Key (e.g. RAM)"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    className="w-full sm:w-1/3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm outline-none focus:border-fuchsia-500 transition"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 16GB)"
                    value={specValue}
                    onChange={(e) => setSpecValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSpec()}
                    className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-sm outline-none focus:border-fuchsia-500 transition"
                  />
                  <Button
                    onClick={addSpec}
                    className="w-full sm:w-auto px-4 py-3"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* EXISTING IMAGES */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-white/70">
                    Current Gallery (Click × to remove)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20">
                        <img
                          src={img}
                          className="w-full h-full object-cover rounded-lg border border-white/10"
                        />
                        <button
                          onClick={() => removeExistingImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500 shadow-xl"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NEW IMAGES */}
              <div className="space-y-2">
                <label className="text-sm text-white/70">
                  Upload New Images (Max 10)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 10)
                      return alert("Maximum 10 images allowed!");
                    setImageFiles(files);
                  }}
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10"
                />
                {imageFiles.length > 0 && (
                  <p className="text-xs text-fuchsia-400">
                    {imageFiles.length} files selected.
                  </p>
                )}
              </div>

              {/* TOGGLES */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-5 h-5 accent-fuchsia-500"
                  />
                  <span className="text-sm font-medium">Feature on Home</span>
                </label>
                <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition">
                  <input
                    type="checkbox"
                    checked={onSale}
                    onChange={(e) => setOnSale(e.target.checked)}
                    className="w-5 h-5 accent-fuchsia-500"
                  />
                  <span className="text-sm font-medium">Set on Sale</span>
                </label>
              </div>

              {onSale && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs text-fuchsia-400 mb-2 font-bold uppercase tracking-wider">
                    Discount Percentage (%)
                  </p>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white/5 border border-fuchsia-500/30 text-white focus:border-fuchsia-500 outline-none transition"
                  />
                </div>
              )}

              {/* FORM ACTIONS */}
              <div className="flex gap-4 pt-4 border-t border-white/10">
                {editingId && (
                  <button
                    onClick={cancelEdit}
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition font-bold"
                  >
                    Cancel
                  </button>
                )}
                <Button onClick={saveProduct} className="flex-1">
                  {loading
                    ? "Processing..."
                    : editingId
                      ? "Update Product"
                      : "Save New Product"}
                </Button>
              </div>
            </GlassCard>
          )}

          {/* INVENTORY LIST */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Current Inventory</h2>
            {products.length === 0 ? (
              <p className="text-white/50">No products found. Add one above.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <GlassCard
                    key={product.id}
                    className="p-4 flex flex-col gap-4 overflow-hidden"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            className="w-20 h-20 rounded-lg object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-[10px] text-white/40">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg leading-tight truncate">
                          {product.name}
                        </h3>
                        <p className="text-white/50 text-sm truncate">
                          {product.category}
                        </p>
                        <p className="font-bold text-green-400 mt-1">
                          ₦{product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto border-t border-white/10 pt-4 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {product.featured && (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-md border border-yellow-500/20 uppercase font-bold tracking-wider">
                            Featured
                          </span>
                        )}
                        {product.onSale && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md border border-blue-500/20 uppercase font-bold tracking-wider">
                            Sale {product.discount}%
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                          <button
                            onClick={() =>
                              updateStock(product.id, product.stock, -1)
                            }
                            className="px-3 py-1 hover:bg-white/10 transition text-white/50 hover:text-white"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={product.stock}
                            onChange={(e) =>
                              setManualStock(product.id, e.target.value)
                            }
                            className="w-14 bg-transparent text-center text-xs font-mono border-x border-white/10 outline-none focus:bg-white/10 transition py-1"
                          />
                          <button
                            onClick={() =>
                              updateStock(product.id, product.stock, 1)
                            }
                            className="px-3 py-1 hover:bg-white/10 transition text-white/50 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(product)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              deleteProduct(product.id, product.images)
                            }
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all"
                            title="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === "orders" && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Orders</h2>
            <button
              onClick={fetchOrders}
              className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold border border-fuchsia-500/20 px-3 py-1 rounded-lg transition"
            >
              ↺ Refresh
            </button>
          </div>

          {/* SUMMARY PILLS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {["pending", "confirmed", "delivered", "cancelled"].map((s) => (
              <GlassCard key={s} className="p-4 text-center">
                <p className="text-2xl font-black text-white">
                  {orders.filter((o) => o.status === s).length}
                </p>
                <p
                  className={`text-xs font-bold uppercase tracking-wider mt-1 ${STATUS_STYLES[s].split(" ")[1]}`}
                >
                  {s}
                </p>
              </GlassCard>
            ))}
          </div>

          {ordersLoading ? (
            <p className="text-white/50 text-center py-12">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-white/50 text-center py-12">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <GlassCard key={order.id} className="p-0 overflow-hidden">
                  {/* ORDER HEADER */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-4 p-5 cursor-pointer hover:bg-white/5 transition"
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.id ? null : order.id,
                      )
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-white">
                          #{order.id} — {order.customer_name}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {new Date(order.created_at).toLocaleString()} ·{" "}
                          {order.customer_city}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="font-bold text-fuchsia-400">
                        ₦{order.total.toLocaleString()}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-1 rounded-md border uppercase font-bold tracking-wider ${STATUS_STYLES[order.status]}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-white/30 text-xs">
                        {expandedOrder === order.id ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* ORDER DETAILS (Expandable) */}
                  {expandedOrder === order.id && (
                    <div className="border-t border-white/10 p-5 space-y-5">
                      {/* CUSTOMER INFO */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-xs text-white/40 uppercase font-bold">
                            Phone
                          </p>
                          <p className="text-white">{order.customer_phone}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-white/40 uppercase font-bold">
                            Address
                          </p>
                          <p className="text-white">
                            {order.customer_address}, {order.customer_city}
                          </p>
                        </div>
                      </div>

                      {/* ITEMS */}
                      <div>
                        <p className="text-xs text-white/40 uppercase font-bold mb-3">
                          Items Ordered
                        </p>
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-white/40">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="text-sm font-bold text-fuchsia-400 shrink-0">
                                ₦{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* PRICE BREAKDOWN */}
                      <div className="bg-white/5 rounded-xl p-4 text-sm space-y-2">
                        <div className="flex justify-between text-white/60">
                          <span>Subtotal</span>
                          <span>₦{order.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Delivery</span>
                          <span>₦{order.delivery_fee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold border-t border-white/10 pt-2">
                          <span>Total</span>
                          <span className="text-fuchsia-400">
                            ₦{order.total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* STATUS + ACTIONS */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                        <div className="flex gap-2 flex-wrap">
                          {[
                            "pending",
                            "confirmed",
                            "delivered",
                            "cancelled",
                          ].map((s) => (
                            <button
                              key={s}
                              onClick={() => updateOrderStatus(order.id, s)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all ${
                                order.status === s
                                  ? STATUS_STYLES[s]
                                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                              }`}
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="text-xs text-red-500 hover:text-red-400 font-bold border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition"
                        >
                          Delete Order
                        </button>
                      </div>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
      {/* ── SCRAPER TAB ── */}
      {activeTab === "scraper" && <ScraperTab />}

      {/* ── PENDING APPROVAL TAB ── */}
      {activeTab === "pending" && (
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Pending Approval</h2>
              <p className="text-white/40 text-sm mt-1">
                Products auto-imported by sync — review before they go live.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchPending}
                className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold border border-fuchsia-500/20 px-3 py-2 rounded-lg transition"
              >
                ↺ Refresh
              </button>
              {pendingProducts.length > 0 && (
                <button
                  onClick={approveAll}
                  className="text-xs bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold px-4 py-2 rounded-lg transition"
                >
                  ✓ Approve All ({pendingProducts.length})
                </button>
              )}
            </div>
          </div>

          {pendingLoading ? (
            <p className="text-white/40 text-center py-20 animate-pulse">
              Loading pending products...
            </p>
          ) : pendingProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">✓</p>
              <p className="text-white/40">No pending products. All clear.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingProducts.map((product) => (
                <GlassCard
                  key={product.id}
                  className="p-4 flex flex-col gap-3 border-fuchsia-500/10"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/5">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                        No Image
                      </div>
                    )}
                    <span className="absolute top-2 left-2 text-[10px] bg-fuchsia-500/80 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      Pending
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm leading-snug line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {product.category}
                    </p>
                    <p className="text-fuchsia-400 font-bold mt-1">
                      ₦{product.price?.toLocaleString()}
                    </p>
                    {product.specs && Object.keys(product.specs).length > 0 && (
                      <p className="text-emerald-400/60 text-xs mt-1">
                        ✓ {Object.keys(product.specs).length} specs
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => rejectProduct(product.id, product.images)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all"
                      title="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => approveProduct(product.id)}
                      disabled={approvingId === product.id}
                      className="flex-1 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-bold text-sm transition-all"
                    >
                      {approvingId === product.id
                        ? "Approving..."
                        : "✓ Approve"}
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
