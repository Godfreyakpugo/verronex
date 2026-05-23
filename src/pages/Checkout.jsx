import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import GlassCard from "../components/ui/GlassCard";
import Toast from "../components/ui/Toast";

const DELIVERY_FEES = {
  BeninCity: 11000,
  Lagos: 7000,
  Abuja: 11000,
  "Port-Harcourt": 11000,
  Warri: 11000,
  Asaba: 11000,
  Sapele: 11000,
  Ekpoma: 11000,
  Auchi: 11000,
  Enugu: 11000,
  Onitsha: 11000,
  Awka: 11000,
  Ikeja: 7000,
  Other: 11000,
};

const FREE_DELIVERY_THRESHOLD = 200000;

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") =>
    setToast({ show: true, message, type });

  // Free delivery if order is 200k or above
  const qualifiesFreeDelivery = cartTotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = qualifiesFreeDelivery ? 0 : DELIVERY_FEES[city] || 0;
  const total = cartTotal + deliveryFee;
  const amountToFreeDelivery = FREE_DELIVERY_THRESHOLD - cartTotal;

  const handlePlaceOrder = async () => {
    if (!name || !phone || !address || !city) {
      return showToast("Please fill in all fields.", "error");
    }

    setLoading(true);

    const orderItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images?.[0] || "",
    }));

    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          customer_city: city,
          items: orderItems,
          subtotal: cartTotal,
          delivery_fee: deliveryFee,
          total,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      setLoading(false);
      return showToast("Error placing order: " + error.message, "error");
    }

    // Decrement stock for each item
    for (const item of cart) {
      await supabase.rpc("decrement_stock", {
        product_id: item.id,
        quantity: item.quantity,
      });
    }

    // Build WhatsApp message
    const itemLines = cart
      .map(
        (item) =>
          `• ${item.quantity}x ${item.name} — ₦${(item.price * item.quantity).toLocaleString()}`,
      )
      .join("\n");

    const deliveryLine = qualifiesFreeDelivery
      ? `*Delivery:* FREE 🎉`
      : `*Delivery:* ₦${deliveryFee.toLocaleString()}`;

    const message =
      `Hello Verronex! I just placed an order.\n\n` +
      `*Order ID:* #${order.id}\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Address:* ${address}, ${city}\n\n` +
      `*Items:*\n${itemLines}\n\n` +
      `*Subtotal:* ₦${cartTotal.toLocaleString()}\n` +
      `${deliveryLine}\n` +
      `*Total:* ₦${total.toLocaleString()}\n\n` +
      `Please confirm my order. Thank you!`;

    clearCart();
    setLoading(false);
    window.open(
      `https://wa.me/2348140181282?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    navigate("/");
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 lg:py-24">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-10">
        Checkout
      </h1>

      {/* FREE DELIVERY BANNER */}
      {qualifiesFreeDelivery ? (
        <div className="mb-8 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-green-400 font-bold text-sm">
              You qualify for FREE delivery!
            </p>
            <p className="text-green-400/60 text-xs mt-0.5">
              Orders above ₦200,000 ship free to any city.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <span className="text-2xl">🚚</span>
          <div>
            <p className="text-white/60 text-sm">
              Add{" "}
              <span className="text-fuchsia-400 font-bold">
                ₦{amountToFreeDelivery.toLocaleString()}
              </span>{" "}
              more to your order for free delivery.
            </p>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-fuchsia-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((cartTotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT: Customer Details */}
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-4">
              Delivery Information
            </h2>

            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase font-bold">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chukwuemeka Obi"
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-fuchsia-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase font-bold">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 08012345678"
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-fuchsia-500 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase font-bold">
                City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-4 rounded-xl bg-black text-white border border-white/10 outline-none focus:border-fuchsia-500 transition"
              >
                <option value="">Select your city</option>
                {Object.keys(DELIVERY_FEES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery fee display */}
            {city && (
              <div>
                {qualifiesFreeDelivery ? (
                  <p className="text-xs text-green-400 font-bold flex items-center gap-1">
                    🎉 Free delivery to {city}!
                  </p>
                ) : (
                  <p className="text-xs text-fuchsia-400 font-bold">
                    Delivery fee for {city}: ₦
                    {(DELIVERY_FEES[city] || 5000).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase font-bold">
                Full Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 12 Sapele Road, GRA"
                rows={3}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-fuchsia-500 transition resize-none"
              />
            </div>
          </GlassCard>
        </div>

        {/* RIGHT: Order Summary */}
        <div>
          <GlassCard className="p-6 sticky top-32">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-4 mb-5">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.images?.[0]}
                    className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                  />
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

            <div className="space-y-3 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Delivery</span>
                {qualifiesFreeDelivery ? (
                  <span className="text-green-400 font-bold">FREE</span>
                ) : (
                  <span>
                    {city
                      ? `₦${(DELIVERY_FEES[city] || 5000).toLocaleString()}`
                      : "—"}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-white font-bold text-xl border-t border-white/10 pt-3">
                <span>Total</span>
                <span className="text-fuchsia-400">
                  ₦{total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 py-4 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white font-bold text-lg transition-all shadow-lg shadow-fuchsia-500/20 active:scale-95"
            >
              {loading
                ? "Placing Order..."
                : "Place Order & Confirm on WhatsApp"}
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
