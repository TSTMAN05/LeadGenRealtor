export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah M.",
      neighborhood: "Myers Park",
      quote: "The home valuation was spot-on. We sold in just 5 days!",
    },
    {
      name: "James T.",
      neighborhood: "Dilworth",
      quote: "This CMA actually reflected the unique features of our historic home.",
    },
    {
      name: "Michael R.",
      neighborhood: "South End",
      quote: "Professional and knowledgeable. Gave us confidence to make the right decision.",
    },
  ];

  const StarRating = () => (
    <div className="flex gap-0.5 mb-2">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className="w-4 h-4 text-accent-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
          What Clients Say
        </h2>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
            >
              <StarRating />
              <blockquote className="text-gray-700 text-sm mb-4 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.neighborhood}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
