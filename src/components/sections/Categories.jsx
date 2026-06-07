import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GlassCard from "../ui/GlassCard";

function Categories() {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Disconnect observer once triggered so it doesn't re-trigger when scrolling up
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Fires when 10% of the section is visible
        rootMargin: "0px 0px -50px 0px", // Smooth buffer zone
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categoryData = [
    {
      title: "Laptops",
      description:
        "Powerful, hand-verified machines for ultimate work and gaming performance.",
      path: "/laptops",
      delayClass: "delay-0",
      icon: (
        <svg
          className="w-6 h-6 text-fuchsia-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Phones",
      description:
        "Flagship smartphones with cutting-edge cameras and elite batteries.",
      path: "/phones",
      delayClass: "md:delay-150",
      icon: (
        <svg
          className="w-6 h-6 text-fuchsia-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Computer Components",
      description:
        "Reliable memory, storage, graphics, and core hardware for builds, upgrades, and repairs.",
      path: "/computer-components",
      delayClass: "md:delay-300",
      icon: (
        <svg
          className="w-6 h-6 text-fuchsia-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Accessories",
      description:
        "Essential, premium gadgets engineered to fully upgrade your setup.",
      path: "/accessories",
      delayClass: "md:delay-400",
      icon: (
        <svg
          className="w-6 h-6 text-fuchsia-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Components",
      description:
        "Standalone computer parts and PC components for building or upgrading your rig.",
      path: "/components",
      delayClass: "md:delay-450",
      icon: (
        <svg
          className="w-6 h-6 text-fuchsia-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 11h14M5 15h14M7 7h10M7 19h10"
          />
        </svg>
      ),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="max-w-7xl mx-auto px-6 py-20 overflow-hidden"
    >
      {/* Header reveal animation */}
      <div
        className={`transition-all duration-700 transform text-left mb-12 ${
          isInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Browse <span className="text-fuchsia-500">Categories</span>
        </h2>
      </div>

      {/* Grid containing staggered cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categoryData.map((category, index) => (
          <Link
            key={index}
            to={category.path}
            className={`w-full transform transition-all duration-1000 ease-out ${category.delayClass} ${
              isInView
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-16 scale-95"
            }`}
          >
            <GlassCard className="p-8 text-left cursor-pointer group h-full flex flex-col items-start transition-all duration-300 hover:scale-[1.03]">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center mb-6 group-hover:bg-fuchsia-500/20 transition-colors duration-300">
                {category.icon}
              </div>

              <h3 className="text-xl font-semibold text-white group-hover:text-fuchsia-400 transition-colors duration-300">
                {category.title}
              </h3>

              <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                {category.description}
              </p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Categories;
