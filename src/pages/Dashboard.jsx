import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Laptops");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]); // Holds new files to upload
  const [existingImages, setExistingImages] = useState([]); // Holds URLs of already uploaded images
  const [products, setProducts] = useState([]);
  const [specs, setSpecs] = useState({}); // Stores the final JSON object
  const [specKey, setSpecKey] = useState(""); // Temporary state for typing the Key (e.g., "RAM")
  const [specValue, setSpecValue] = useState(""); // Temporary state for typing the Value (e.g., "16GB")
  const [isFeatured, setIsFeatured] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [capabilities, setCapabilities] = useState([""]); // Start with one empty field
  const [limitations, setLimitations] = useState([""]);
  const [showPreview, setShowPreview] = useState(false);
const [stock, setStock] = useState(1);

 useEffect(() => {
  checkUser();
  fetchProducts();
}, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      navigate("/verronex-admin-secret");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/verronex-admin-secret");
  };

  const fetchProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: false });

  if (!error) {
    setProducts(data);
  }
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

 // --- ADD THIS HELPER INSIDE DASHBOARD COMPONENT ---
const removeExistingImage = (indexToRemove) => {
  setExistingImages(existingImages.filter((_, index) => index !== indexToRemove));
};

// --- UPDATED DELETE LOGIC (Cleans up ALL files) ---
const deleteProduct = async (id, imageUrls) => {
  const confirmDelete = window.confirm("Are you sure? This cannot be undone.");
  if (!confirmDelete) return;

  setLoading(true);

  // 1. Delete ALL images from Storage
  if (imageUrls && imageUrls.length > 0) {
    const filesToDelete = imageUrls.map(url => url.split('/').pop());
    const { error: storageError } = await supabase.storage
      .from("products")
      .remove(filesToDelete);

    if (storageError) console.error("Storage clean-up error:", storageError);
  }

  // 2. Delete the row
  const { error } = await supabase.from("products").delete().eq("id", id);

  setLoading(false);
  if (error) alert("Error: " + error.message);
  else fetchProducts();
};

// This function can be used for both incrementing and decrementing stock
const updateStock = async (id, currentStock, delta) => {
  const newStock = Math.max(0, currentStock + delta); // Prevent negative stock
  
  const { error } = await supabase
    .from("products")
    .update({ stock: newStock })
    .eq("id", id);

  if (error) {
    alert(error.message);
  } else {
    // Optimistic UI update: find the product in our state and update it locally
    // so we don't have to wait for a full fetchProducts() call.
    setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
  }
};

// Manual stock input (for direct edits)
const setManualStock = async (id, value) => {
  // Convert input to a number and ensure it's not negative
  const newStock = Math.max(0, parseInt(value) || 0);

  const { error } = await supabase
    .from("products")
    .update({ stock: newStock })
    .eq("id", id);

  if (error) {
    alert(error.message);
  } else {
    // Update local state so the UI reflects the change immediately
    setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
  }
};

// --- 1. LOAD DATA INTO FORM FOR EDITING ---
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
  
  setShowForm(true); // Open the form
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
};

// --- 2. CANCEL EDITING ---
 const cancelEdit = () => {
  setEditingId(null);
  setName("");
  setPrice("");
  setDescription("");
  setSpecs({});
  setImageFiles([]); // Fixed state name
  setExistingImages([]); // Just reset to empty array
  setIsFeatured(false);
  setOnSale(false);
  setDiscount(0);
  setShowForm(false);
};

const handleArrayChange = (index, value, type) => {
  const newArray = type === 'cap' ? [...capabilities] : [...limitations];
  newArray[index] = value;
  type === 'cap' ? setCapabilities(newArray) : setLimitations(newArray);
};

const addField = (type) => {
  type === 'cap' ? setCapabilities([...capabilities, ""]) : setLimitations([...limitations, ""]);
};

// --- 3. SAVE (BOTH CREATE & UPDATE) ---
 const saveProduct = async () => {
  if (!name || !price) return alert("Name and price required");
  setLoading(true);

  // A. Handle Image Batch Upload
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

        const { data } = supabase.storage.from("products").getPublicUrl(fileName);
        return data.publicUrl;
      });

      newImageUrls = await Promise.all(uploadPromises);
    } catch (err) {
      setLoading(false);
      return alert("Error uploading images: " + err.message);
    }
  }

  // Combine existing with new
  const finalImagesArray = [...existingImages, ...newImageUrls];

  const productData = {
    name,
    price: Number(price),
    stock: Number(stock),
    category,
    description, // contains the rich text HTML from ReactQuill
    capabilities,
    limitations,
    specs,
    onSale,
    discount: Number(discount),
    featured: isFeatured,
    images: finalImagesArray, // This is the only place we set images now
  };

  let result;

  if (editingId) {
    result = await supabase
      .from("products")
      .update(productData)
      .eq("id", editingId);
  } else {
    // IMPORTANT: We use finalImagesArray here too!
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




  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <GlassCard className="p-8 space-y-4">
        <p className="text-white/70">
          Welcome Admin. Your dashboard is now protected.
        </p>

        <div className="flex gap-4">
          <Button onClick={() => setShowForm(!showForm)}>
  {showForm ? "Close Form" : "+ Add Product"}
</Button>
          <Button onClick={logout} className="bg-red-600 hover:bg-red-500">
            Logout
          </Button>
        </div>
      </GlassCard>

      {showForm && (
  <GlassCard className="p-8 mt-8 space-y-4">
    <h2 className="text-2xl font-bold">Add Product</h2>

    <input
  type="text"
  placeholder="Product Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full p-4 rounded-xl bg-white/5 border border-white/10"
/>

    <input
      type="number"
      placeholder="Price"
      value={price}
      onChange={(e) => setPrice(e.target.value)}
      className="w-full p-4 rounded-xl bg-white/5 border border-white/10"
    />

    <div className="space-y-1">
  <label className="text-[10px] text-white/40 uppercase font-bold pl-1">Initial Stock</label>
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
</select>

{/* MARKETING DESCRIPTION (RICH TEXT WITH PREVIEW) */}
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

  <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10 min-h-[200px]">
    {showPreview ? (
      /* PREVIEW MODE */
      <div className="p-4 prose prose-invert prose-fuchsia max-w-none">
        {description ? (
          <div dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          <p className="text-gray-500 italic">Nothing to preview yet...</p>
        )}
      </div>
    ) : (
      /* EDIT MODE */
      <ReactQuill 
        theme="snow" 
        value={description} 
        onChange={setDescription}
        className="text-white bg-black/20"
      />
    )}
  </div>
</div>

{/* CAPABILITIES (JSONB ARRAY) */}
<div className="space-y-4">
  <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Capabilities (What it can do)</label>
  {capabilities.map((cap, index) => (
    <input
      key={index}
      value={cap}
      onChange={(e) => handleArrayChange(index, e.target.value, 'cap')}
      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-emerald-500 transition"
      placeholder="e.g. 4K Video Editing at 60fps"
    />
  ))}
  <button 
    type="button" 
    onClick={() => addField('cap')}
    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
  >
    + Add Capability
  </button>
</div>

 {/* SPEC BUILDER */}
        <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-white/5">
          <h3 className="font-bold text-sm text-white/70 uppercase">Product Specifications</h3>
          
          {/* Display added specs */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/10 text-sm">
                <span className="text-fuchsia-400 font-bold">{key}:</span>
                <span className="text-white/80 ml-2 truncate">{value}</span>
                <button 
                  onClick={() => removeSpec(key)}
                  className="ml-2 text-red-500 hover:text-red-400 font-bold px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Add new spec inputs */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. RAM"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              className="w-1/3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm"
            />
            <input
              type="text"
              placeholder="e.g. 16GB Unified Memory"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSpec()}
              className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-sm"
            />
            <Button onClick={addSpec} className="px-4 py-3 bg-white/10 hover:bg-white/20">
              Add
            </Button>
          </div>
        </div>



{/* Inside showForm, before the file input */}
{existingImages.length > 0 && (
  <div className="space-y-2">
    <p className="text-sm text-white/70">Current Gallery (Click × to remove)</p>
    <div className="flex flex-wrap gap-2">
      {existingImages.map((img, idx) => (
        <div key={idx} className="relative group w-20 h-20">
          <img src={img} className="w-full h-full object-cover rounded-lg border border-white/10" />
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

<div className="space-y-2">
  <label className="text-sm text-white/70">Upload New Images (Max 10)</label>
  <input
    type="file"
    accept="image/*"
    multiple // <-- THIS IS THE MAGIC WORD
    onChange={(e) => {
      // Convert the FileList object into a standard array
      const files = Array.from(e.target.files);
      if (files.length > 10) return alert("Maximum 10 images allowed!");
      setImageFiles(files);
    }}
    className="w-full p-4 rounded-xl bg-white/5 border border-white/10"
  />
  {imageFiles.length > 0 && (
    <p className="text-xs text-fuchsia-400">{imageFiles.length} files selected for upload.</p>
  )}
</div>

{/* MARKETING TOGGLES */}
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

        {/* DISCOUNT INPUT (Only shows if Sale is checked) */}
        {onSale && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs text-fuchsia-400 mb-2 font-bold uppercase tracking-wider">Discount Percentage (%)</p>
            <input
              type="number"
              placeholder="e.g. 10"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/5 border border-fuchsia-500/30 text-white focus:border-fuchsia-500 outline-none transition"
            />
          </div>
        )}

    {/* FORM ACTION BUTTONS */}
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
            {loading ? "Processing..." : editingId ? "Update Product" : "Save New Product"}
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
              <GlassCard key={product.id} className="p-4 flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  {/* Image Thumbnail */}
                  {product.images && product.images.length > 0 ? (
                    <div className="flex gap-1">
 {product.images?.slice(0,3).map((img,i)=>(
   <img key={i} src={img} className="w-16 h-16 rounded object-cover" />
 ))}
</div>
                  ) : (
                    <div className="w-16 h-16 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-xs text-white/40">
                      No Img
                    </div>
                  )}

                  {/* Product Details */}
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
                    <p className="text-white/50 text-sm">{product.category}</p>
                    <p className="font-bold text-green-400 mt-1">₦{product.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Management Badges (We will add Edit/Delete buttons here next) */}
               {/* Management Section - Refactored for Responsiveness */}
<div className="mt-auto border-t border-white/10 pt-4 space-y-4">
  
  {/* TOP ROW: Status Badges */}
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

  {/* BOTTOM ROW: Controls & Actions */}
  <div className="flex flex-wrap items-center justify-between gap-3">
    
    {/* Stock Pill - UPDATED for manual typing */}
<div className="flex items-center bg-white/5 rounded-lg border border-white/10 overflow-hidden">
  <button 
    onClick={() => updateStock(product.id, product.stock, -1)}
    className="px-3 py-1 hover:bg-white/10 transition text-white/50 hover:text-white"
  >
    −
  </button>
  
  <input 
    type="number"
    value={product.stock}
    onChange={(e) => setManualStock(product.id, e.target.value)}
    className="w-14 bg-transparent text-center text-xs font-mono border-x border-white/10 outline-none focus:bg-white/10 transition py-1"
  />

  <button 
    onClick={() => updateStock(product.id, product.stock, 1)}
    className="px-3 py-1 hover:bg-white/10 transition text-white/50 hover:text-white"
  >
    +
  </button>
</div>

    {/* Action Buttons */}
    <div className="flex gap-2">
      <button
        onClick={() => startEdit(product)}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        title="Edit Product"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <button
        onClick={() => deleteProduct(product.id, product.images)}
        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all"
        title="Delete Product"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    </div>
  );
}