import Hero from "../components/sections/Hero";
import Categories from "../components/sections/Categories";
import FeaturedProducts from "../components/sections/FeaturedProducts";
import PromoBanner from "../components/sections/PromoBanner";
import AboutSection from "../components/sections/AboutSection";

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <AboutSection />
      <PromoBanner />
    </>
  );
}

export default Home;
