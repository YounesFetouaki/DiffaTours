"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from '@/lib/i18n/hooks';
import { useParams } from 'next/navigation';
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ChevronUp,
  MessageCircle,
} from "lucide-react";

const Footer = () => {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string || 'fr';

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://www.facebook.com/profile.php?id=61584084283909',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://www.instagram.com/diffa_tours/',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: 'https://wa.me/212691583171',
    },
  ];

  return (
    <footer className="bg-[#1A1A1A] text-white font-body border-t border-solid border-white/10 pt-16 px-6 pb-10 md:pt-20 md:px-8 md:pb-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 blur-3xl opacity-30" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10 lg:gap-8 pb-12 text-center md:text-left">
          {/* Address */}
          <div className="glass-light p-6 card-hover rounded-[20px]">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h6 className="font-display uppercase text-xs tracking-[2px] text-white">
                {t('footer.address')}
              </h6>
            </div>
            <p className="text-sm text-white/80 leading-[1.8]">
              {t('footer.addressText')}
            </p>
          </div>

          {/* Phone */}
          <div className="glass-light p-6 card-hover rounded-[20px]">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Phone className="w-5 h-5 text-primary" />
              <h6 className="font-display uppercase text-xs tracking-[2px] text-white">
                {t('footer.phone')}
              </h6>
            </div>
            <a href="tel:+212524123456" className="text-sm text-white/80 leading-[1.8] hover:text-primary transition-colors inline-block">
              +212 524 123 456
            </a>
          </div>

          {/* Email */}
          <div className="glass-light p-6 card-hover rounded-[20px]">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h6 className="font-display uppercase text-xs tracking-[2px] text-white">
                {t('footer.email')}
              </h6>
            </div>
            <div className="flex flex-col gap-1 text-center md:text-left">
              <a href="mailto:contact@diffatours.com" className="text-sm text-white/80 leading-[1.8] hover:text-primary transition-colors inline-block">
                contact@diffatours.com
              </a>
              <a href="mailto:reservations@diffatours.com" className="text-sm text-white/80 leading-[1.8] hover:text-primary transition-colors inline-block">
                reservations@diffatours.com
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="glass-light p-6 card-hover rounded-[20px]">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <h6 className="font-display uppercase text-xs tracking-[2px] text-white">
                {t('footer.social')}
              </h6>
            </div>
            <div className="flex gap-3 justify-center md:justify-start">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className="w-10 h-10 glass-strong rounded-full flex items-center justify-center text-white hover:text-primary hover:scale-110 transition-all duration-300"
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-solid border-white/10 pt-8">
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 md:gap-4">
            <p className="text-xs text-white/60 text-center">
              {t('footer.copyright')}
            </p>

            <div className="flex items-center flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white/30 hidden">|</span>
              </div>

              <a href="#" aria-label="Scroll to top" className="group">
                <div className="w-10 h-10 glass-strong rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300">
                  <ChevronUp className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;