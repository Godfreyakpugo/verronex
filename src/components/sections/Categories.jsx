import GlassCard from "../ui/GlassCard";
import { Link } from "react-router-dom";

function Categories() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      <h2 className="text-3xl font-bold mb-10">
        Browse Categories
      </h2>

     <div className="grid md:grid-cols-3 gap-8">

  <Link to="/laptops">
    <GlassCard className="p-10 text-center cursor-pointer">
      <h3 className="text-xl font-semibold text-fuchsia-500">
        Laptops
      </h3>
      <p className="text-gray-400 mt-3">
        Powerful machines for work and gaming.
      </p>
    </GlassCard>
  </Link>

  <Link to="/phones">
    <GlassCard className="p-10 text-center cursor-pointer">
      <h3 className="text-xl font-semibold text-fuchsia-500">
        Phones
      </h3>
      <p className="text-gray-400 mt-3">
        Flagship smartphones with cutting-edge tech.
      </p>
    </GlassCard>
  </Link>

  <Link to="/accessories">
    <GlassCard className="p-10 text-center cursor-pointer">
      <h3 className="text-xl font-semibold text-fuchsia-500">
        Accessories
      </h3>
      <p className="text-gray-400 mt-3">
        Essential gadgets to upgrade your setup.
      </p>
    </GlassCard>
  </Link>

</div>

    </section>
  );
}

export default Categories;