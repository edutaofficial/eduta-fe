"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { CONSTANTS } from "@/lib/constants";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedinIcon,
  YoutubeIcon,
  MailIcon,
  PhoneIcon,
  MapPin,
} from "lucide-react";
import { useCategoryStore } from "@/store/useCategoryStore";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { categories, loading, fetchCategories } = useCategoryStore();

  // Fetch categories on mount
  React.useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  const socialIcons = [
    {
      name: "Facebook",
      icon: FacebookIcon,
      href: CONSTANTS.SOCIAL_LINKS.facebook,
    },
    {
      name: "Instagram",
      icon: InstagramIcon,
      href: CONSTANTS.SOCIAL_LINKS.instagram,
    },
    {
      name: "Twitter",
      icon: TwitterIcon,
      href: CONSTANTS.SOCIAL_LINKS.twitter,
    },
    {
      name: "LinkedIn",
      icon: LinkedinIcon,
      href: CONSTANTS.SOCIAL_LINKS.linkedin,
    },
    {
      name: "YouTube",
      icon: YoutubeIcon,
      href: CONSTANTS.SOCIAL_LINKS.youtube,
    },
  ];

  return (
    <footer className="bg-primary-900 text-default-50">
      <div className="w-full max-w-[90rem] mx-auto px-6 py-12">
        {/* Logo Section */}
        <div className="mb-12">
          <Link href="/" className="inline-block">
            <Image
              src="/logo-main.webp"
              alt="Eduta Logo"
              width={120}
              height={38}
              className="brightness-0 invert"
            />
          </Link>
          <p className="mt-4 text-default-200 max-w-md text-sm">
            Empowering learners worldwide with quality education and innovative
            learning experiences. Join thousands of students transforming their
            careers.
          </p>

          {/* Contact Information */}
          <div className="mt-6 space-y-3">
            <a
              href={`mailto:${CONSTANTS.CONTACT_INFO.email}`}
              className="flex items-center gap-3 text-default-200 hover:text-default-50 transition-colors text-sm group"
            >
              <div className="size-8 rounded-lg bg-primary-800 flex items-center justify-center text-default-200 group-hover:bg-primary-700 group-hover:text-default-50 transition-all">
                <MailIcon className="size-4" />
              </div>
              <span>{CONSTANTS.CONTACT_INFO.email}</span>
            </a>
            <a
              href={`tel:${CONSTANTS.CONTACT_INFO.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 text-default-200 hover:text-default-50 transition-colors text-sm group"
            >
              <div className="size-8 rounded-lg bg-primary-800 flex items-center justify-center text-default-200 group-hover:bg-primary-700 group-hover:text-default-50 transition-all">
                <PhoneIcon className="size-4" />
              </div>
              <span>{CONSTANTS.CONTACT_INFO.phone}</span>
            </a>
            <div className="flex items-start gap-3 text-default-200 text-sm">
              <div className="size-8 rounded-lg bg-primary-800 flex items-center justify-center text-default-200 shrink-0">
                <MapPin className="size-4" />
              </div>
              <div>
                <p className="font-medium">{CONSTANTS.CONTACT_INFO.address.company}</p>
                <p>{CONSTANTS.CONTACT_INFO.address.street}</p>
                <p>
                  {CONSTANTS.CONTACT_INFO.address.city}, {CONSTANTS.CONTACT_INFO.address.province}, {CONSTANTS.CONTACT_INFO.address.postalCode}
                </p>
                <p>{CONSTANTS.CONTACT_INFO.address.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Company Section */}
          <div>
            <h3 className="text-default-50 font-bold text-base mb-4">Company</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/about"
                  className="text-default-200 text-sm hover:text-default-50 transition-colors inline-block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-default-200 text-sm hover:text-default-50 transition-colors inline-block"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-default-200 text-sm hover:text-default-50 transition-colors inline-block"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-default-50 font-bold text-base mb-4">Support</h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/faqs"
                  className="text-default-200 text-sm hover:text-default-50 transition-colors inline-block"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-default-200 text-sm hover:text-default-50 transition-colors inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-default-200 text-sm hover:text-default-50 transition-colors inline-block"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {loading ? (
            // Skeleton Loading State for Categories
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-6 w-32 bg-primary-800 animate-pulse rounded mb-4" />
                  <div className="space-y-2.5">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 w-full bg-primary-800 animate-pulse rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Dynamic Categories
            <>
              {categories.slice(0, 4).map((category) => (
                <div key={category.categoryId}>
                  <h3 className="text-default-50 font-bold text-base mb-4">
                    {category.name}
                  </h3>
                  <ul className="space-y-2.5">
                    {category.subcategories.slice(0, 5).map((subcategory) => (
                      <li key={subcategory.categoryId}>
                        <Link
                          href={`/all-courses?categories=${subcategory.categoryId}`}
                          className="text-default-200 text-sm hover:text-default-50 transition-colors inline-block"
                        >
                          {subcategory.name}
                        </Link>
                      </li>
                    ))}
                    {category.subcategories.length > 5 && (
                      <li>
                        <Link
                          href={`/all-courses?categories=${category.categoryId}`}
                          className="text-primary-300 text-sm hover:text-primary-200 transition-colors inline-block font-medium"
                        >
                          View all →
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Separator */}
        <Separator className="bg-primary-700 mb-8" />

        {/* Bottom Section: Copyright & Social Icons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-default-200 text-sm text-center md:text-left">
            <p>© {currentYear} Eduta. All rights reserved.</p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {socialIcons.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="size-10 rounded-full bg-primary-800 hover:bg-primary-700 flex items-center justify-center text-default-200 hover:text-default-50 transition-all hover:scale-110"
                >
                  <Icon className="size-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
