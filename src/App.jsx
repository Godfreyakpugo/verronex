import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import Product from "./pages/Product";
import Search from "./pages/Search";
import Cart from "./pages/Cart";
import Deals from "./pages/Deals";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Category from "./pages/Category"; 
import WhatsAppButton from "./components/ui/WhatsAppButton";

function App() {

  return (
      <div className="bg-black text-white min-h-screen">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
        
          <Route path="/laptops" element={
            <Category 
              categoryName="Laptops" 
              title="Premium Laptops" 
              description="Engineered for power, designed for portability. Discover our handpicked selection of top-tier machines." 
            />
          } />

          <Route path="/phones" element={
            <Category 
              categoryName="Phones" 
              title="Premium Phones for Every Lifestyle" 
              description="Discover our curated selection of the most innovative smartphones, designed to keep you connected and productive." 
            />
          } />

          <Route path="/accessories" element={
            <Category 
              categoryName="Accessories" 
              title="Premium Accessories" 
              description="Level up your tech game with our curated selection of premium accessories." 
            />
          } />
          
          <Route path="/product/:id" element={<Product />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/all-products" element={<AllProducts />} />
          <Route path="/deals" element={<Deals />} /> 
          <Route path="/verronex-admin-secret" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

        <Footer />
        <WhatsAppButton />
      </div> 
  );
}

export default App;