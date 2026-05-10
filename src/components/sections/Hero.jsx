import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-fuchsia-600 blur-[200px] opacity-30"></div>

      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">

        <div className="text-center">

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Next-Gen <span className="text-fuchsia-500">Gadgets</span>  
            <br /> Built for the Future
          </h1>

          <p className="mt-6 text-gray-400 max-w-xl mx-auto">
            Discover premium laptops, smartphones and accessories
            engineered for performance and style.
          </p>

          <div className="mt-10 flex justify-center gap-6">

          <Link to="/Laptops">
          <button className="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg font-semibold transition">
              Shop Laptops
            </button>
          </Link>
            
         <Link to="/all-products">
            <button className="px-8 py-3 border border-white/20 hover:border-fuchsia-500 rounded-lg transition">
              Explore Products
            </button> 
          </Link>

          </div>

        </div>

      </div>
      

    </section>
  );
}

export default Hero;