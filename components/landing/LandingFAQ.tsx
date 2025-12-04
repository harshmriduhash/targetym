'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'How long does it take to set up Targetym AI?',
    answer: 'Most organizations complete the setup in under 30 minutes. Our OAuth integration process is streamlined, and our onboarding team provides step-by-step guidance to ensure a smooth start.',
  },
  {
    question: 'Is my data secure with Targetym AI?',
    answer: 'Absolutely. We use enterprise-grade encryption (AES-256) for data at rest and in transit. We are SOC 2 Type II certified and GDPR compliant. Your data is stored in secure data centers with regular security audits.',
  },
  {
    question: 'Which platforms does Targetym AI integrate with?',
    answer: 'Currently, we integrate with Microsoft SharePoint (for HR attendance tracking), Microsoft Teams (for collaboration analytics), and Asana (for project management insights). We are continuously adding new integrations based on customer feedback.',
  },
  {
    question: 'Can I try Targetym AI before committing to a paid plan?',
    answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card is required to start your trial. You can explore the platform and see the value firsthand before making a decision.',
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'All plans include email support with response times within 24 hours. Professional and Enterprise plans get priority support with faster response times. Enterprise customers also receive a dedicated account manager and phone support.',
  },
  {
    question: 'Can Targetym AI scale with my organization?',
    answer: 'Yes, Targetym AI is designed to scale from small teams to large enterprises. Our Enterprise plan supports unlimited employees and offers custom infrastructure to handle any data volume.',
  },
  {
    question: 'How does the AI-powered analytics work?',
    answer: 'Our AI engine analyzes patterns across your workforce data from multiple sources. It identifies trends, predicts potential issues (like employee burnout or project delays), and provides actionable recommendations to optimize performance.',
  },
  {
    question: 'What happens to my data if I cancel my subscription?',
    answer: 'You retain full ownership of your data. Upon cancellation, you can export all your data in standard formats (CSV, JSON). We keep your data for 30 days after cancellation before permanent deletion, giving you time to retrieve anything you need.',
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about Targetym AI
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Still have questions CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 max-w-2xl mx-auto border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our team is here to help. Reach out and we'll get back to you within 24 hours.
            </p>
            <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
