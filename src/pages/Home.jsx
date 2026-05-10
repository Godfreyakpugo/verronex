import Hero from "../components/sections/Hero";
import Categories from "../components/sections/Categories";
import FeaturedProducts from "../components/sections/FeaturedProducts";
import PromoBanner from "../components/sections/PromoBanner";

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <PromoBanner />
    </>
  );
}

export default Home;