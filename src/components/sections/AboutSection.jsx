import GlassCard from "../ui/GlassCard";

function AboutSection() {
  const features = [
    {
      title: "Premium Grade Only",
      description:
        "We don't just clear shelves. We selectively hand-pick the absolute cleanest, top-tier UK used devices from Lagos' premier tier-1 tech importers and verified corporate hubs.",
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
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Nationwide Shipping",
      description:
        "Fast, reliable, and highly secure delivery across Nigeria. Every order is packaged with maximum protection to ensure your device arrives in pristine condition.",
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
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: "Direct WhatsApp Support",
      description:
        "No chat bots or delayed responses. Connect directly with our team on WhatsApp to ask questions, view real-time product media, or instantly confirm your delivery layout.",
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
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-fuchsia-600/15 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Left-Aligned Heading */}
        <div className="max-w-3xl mb-16 text-left">
          <p className="text-fuchsia-500 font-medium uppercase tracking-widest mb-3">
            Why Choose Verronex
          </p>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Premium Gadgets.
            <br />
            Trusted Sourcing.
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed">
            At Verronex, we filter out the noise so you get the best value.
            Instead of risky blind-buying, we selectively source flawless UK
            used laptops, phones, and accessories from the country's most
            reliable suppliers. Every device is thoroughly inspected and
            verified before it ever reaches our storefront.
          </p>
        </div>

        {/* Feature Cards — Left Aligned Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <GlassCard
              key={index}
              className="p-8 text-left group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-fuchsia-500/10 flex items-center justify-center mb-6 group-hover:bg-fuchsia-500/20 transition-colors">
                {feature.icon}
              </div>

              <h3 className="text-xl font-semibold mb-4 text-white">
                {feature.title}
              </h3>

              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
