// src/pages/Cart.jsx
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import GlassCard from "../components/ui/GlassCard";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  // ✅ All hook data must be retrieved INSIDE the function
  const { cart, removeFromCart, cartTotal, updateQuantity } = useCart();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    const orderDetails = cart.map(item => 
      `• ${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}`
    ).join("%0A"); 

    

    const totalString = `%0A*Total: ₦${cartTotal.toLocaleString()}*`;
    const message = `Hello Verronex! I would like to place an order:%0A%0A${orderDetails}%0A${totalString}%0A%0AIs this available?`;
    
    // Replace with your actual business number
    const url = `https://wa.me/2348140181282?text=${message}`;
    window.open(url, "_blank");
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <GlassCard className="p-12 max-w-md w-full border-white/10">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Looks like you haven't added any premium gadgets yet.</p>
          <Link to="/" className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-500/20 inline-block">
            Start Shopping
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24 min-h-[70vh]">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT: Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <GlassCard key={item.id} className="flex flex-col sm:flex-row items-center gap-6 p-4 border-white/10">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 shrink-0">
                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                <p className="text-fuchsia-400 font-semibold text-sm">₦{item.price.toLocaleString()} each</p>
                
                {/* QUANTITY CONTROLS */}
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white transition active:scale-90"
                  >
                    −
                  </button>
                  <span className="text-white font-mono w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white transition active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="font-bold text-lg text-white">
                  ₦{(item.price * item.quantity).toLocaleString()}
                </p>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all border border-red-500/20"
                >
                  ✕
                </button>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 border-white/10 sticky top-32">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Order Summary</h2>
            
            <div className="flex justify-between items-center mb-4 text-gray-400">
              <span>Subtotal ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center mb-8 text-white font-bold text-2xl border-t border-white/10 pt-4">
              <span>Total</span>
              <span className="text-fuchsia-400">₦{cartTotal.toLocaleString()}</span>
            </div>

            <div className="space-y-4">
              

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-fuchsia-500/20 active:scale-95"
            >
              Proceed to Checkout
            </button>

            <button 
              onClick={handleCheckout}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-fuchsia-500/20 active:scale-95"
            >
              Checkout via WhatsApp
            </button>
            </div>
            
          </GlassCard>
        </div>

      </div>
    </div>
  );
}