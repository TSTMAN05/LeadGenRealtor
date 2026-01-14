export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Submit Your Address",
      description: "Enter your property details in the form above.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      number: 2,
      title: "Expert Analysis",
      description: "I review recent sales and market trends.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      number: 3,
      title: "Get Your CMA",
      description: "Receive a personalized market analysis.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-accent-600 bg-accent-50 px-2 py-0.5 rounded">
                    Step {step.number}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
