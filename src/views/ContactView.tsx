import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react';

export const ContactView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
          Get In Touch
        </span>
        <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-stone-950 tracking-tight">
          Contact SkillStream
        </h1>
        <p className="text-base text-stone-600 leading-relaxed font-normal">
          Have questions regarding courses, batch enrollment, or curriculum structure? Our admissions and support team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-6">
            <h3 className="font-heading font-bold text-xl text-stone-900">
              Support Channels
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-stone-400">Direct Email</h4>
                  <a href="mailto:practicebd22@gmail.com" className="text-sm font-semibold text-stone-900 hover:text-amber-600 transition-colors">
                    practicebd22@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-stone-400">Support Hours</h4>
                  <p className="text-sm font-semibold text-stone-900">
                    Monday – Saturday: 9:00 AM – 8:00 PM (EST)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-amber-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-stone-400">Headquarters</h4>
                  <p className="text-sm font-semibold text-stone-900">
                    SkillStream Global Learning Network
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-2xl bg-white border border-stone-200 shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-stone-900">
                  Message Transmitted Successfully
                </h3>
                <p className="text-sm text-stone-600 max-w-md mx-auto">
                  Thank you for contacting SkillStream. A curriculum advisor will review your inquiry and follow up within 24 business hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="px-6 py-2.5 bg-stone-950 text-white rounded-xl text-xs font-bold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-heading font-bold text-xl text-stone-900 mb-2">
                  Submit an Inquiry
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Miller"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    Subject / Course of Interest
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Batch 20 Enrollment or Google Ads Curriculum"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your query or learning goals..."
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-bold text-xs tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>SEND MESSAGE</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
