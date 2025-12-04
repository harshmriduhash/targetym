const TESTIMONIALS = [
  {
    name: "Sarah Thompson",
    title: "HR Director, Global Tech Inc.",
    quote: "Targetym AI transformed our HR analytics. We now make data-driven decisions 40% faster and understand our workforce like never before.",
    avatar: "/avatars/sarah.jpg"
  },
  {
    name: "Michael Chen",
    title: "Chief People Officer, Innovative Solutions",
    quote: "The AI insights from Targetym have been game-changing. We've improved team productivity and reduced burnout significantly.",
    avatar: "/avatars/michael.jpg"
  }
];

export function LandingTestimonials() {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Témoignages Clients
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Des résultats concrets
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {TESTIMONIALS.map((testimonial) => (
            <div key={testimonial.name} className="daisy-card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="daisy-card-body p-4">
                <div className="flex items-center mb-3">
                  <div className="mr-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{testimonial.name}</h3>
                    <p className="text-xs text-gray-600">{testimonial.title}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 italic leading-normal">{testimonial.quote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
