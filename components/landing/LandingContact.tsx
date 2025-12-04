'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const CONTACT_INFO = [
  {
    icon: Mail,
    title: 'Email',
    value: 'contact@targetym.ai',
    link: 'mailto:contact@targetym.ai',
  },
  {
    icon: Phone,
    title: 'Phone',
    value: '+1 (555) 123-4567',
    link: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    title: 'Address',
    value: 'San Francisco, CA 94105',
    link: null,
  },
];

export function LandingContact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-10 lg:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            Contactez-nous
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Une question ? Notre équipe est là pour vous.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="daisy-card bg-base-100 shadow-lg">
            <div className="daisy-card-body">
              <h2 className="daisy-card-title text-2xl">Send us a message</h2>
              <p className="text-sm text-gray-600">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div>
                  <label htmlFor="name" className="daisy-label">
                    <span className="daisy-label-text">Full Name *</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="daisy-input daisy-input-bordered w-full"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="daisy-label">
                    <span className="daisy-label-text">Email Address *</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="daisy-input daisy-input-bordered w-full"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="daisy-label">
                    <span className="daisy-label-text">Company Name</span>
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    className="daisy-input daisy-input-bordered w-full"
                    placeholder="Acme Inc."
                  />
                </div>

                <div>
                  <label htmlFor="message" className="daisy-label">
                    <span className="daisy-label-text">Message *</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="daisy-textarea daisy-textarea-bordered w-full"
                    placeholder="Tell us about your HR analytics needs..."
                  />
                </div>

                <button type="submit" className="daisy-btn daisy-btn-primary daisy-btn-lg w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                {CONTACT_INFO.map((info) => {
                  const Icon = info.icon;
                  return (
                    <div key={info.title} className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-gray-600">{info.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="daisy-card bg-blue-600 text-white border-none shadow-lg">
              <div className="daisy-card-body">
                <h2 className="daisy-card-title text-white">Need immediate assistance?</h2>
                <p className="text-blue-100 text-sm">
                  Schedule a live demo with our team
                </p>
                <button className="daisy-btn daisy-btn-lg w-full bg-white text-blue-600 hover:bg-gray-100 border-none mt-4">
                  Schedule Demo
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-2">Office Hours</h4>
              <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM PST</p>
              <p className="text-gray-600">Weekend: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
