"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "@/lib/i18n/hooks";

export default function ContactForm() {
  const params = useParams();
  const locale = params.locale as string || 'fr';
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Phone validation: only allow numbers, spaces, +, -, (, )
    if (name === 'phone') {
      const phoneRegex = /^[0-9\s+\-()]*$/;
      if (!phoneRegex.test(value)) {
        return; // Don't update if invalid characters
      }
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone if provided
    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 8) {
        toast.error(t('contact.form.phoneError'));
        return;
      }
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          locale, // Pass locale to API
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t('contact.form.error'));
        setIsSubmitting(false);
        return;
      }

      toast.success(t('contact.form.success'));
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error(t('contact.form.error'));
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass p-8 md:p-10 shadow-2xl">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-foreground mb-2">
              {t('contact.form.firstName')} *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-input bg-white/90 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-foreground mb-2">
              {t('contact.form.lastName')} *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-input bg-white/90 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
            {t('contact.form.email')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-input bg-white/90 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
            {t('contact.form.phone')}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder={t('contact.form.phonePlaceholder')}
            className="w-full px-4 py-3 border border-input bg-white/90 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-muted mt-1">{t('contact.form.phoneHelper')}</p>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">
            {t('contact.form.subject')} *
          </label>
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-input bg-white/90 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
          >
            <option value="">{t('contact.form.selectSubject')}</option>
            <option value="reservation">{t('contact.form.subjects.reservation')}</option>
            <option value="information">{t('contact.form.subjects.information')}</option>
            <option value="event">{t('contact.form.subjects.event')}</option>
            <option value="other">{t('contact.form.subjects.other')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
            {t('contact.form.message')} *
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            value={formData.message}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-input bg-white/90 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
        >
          {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}