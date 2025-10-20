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
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {CONSTANTS.FOOTER_CATEGORIES.map((category) => (
            <div key={`${category.id}-${category.title}`}>
              <h3 className="text-default-50 font-bold text-base mb-4">
                {category.title}
              </h3>
              <ul className="space-y-2.5">
                {category.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-default-200 text-sm hover:text-default-50 transition-colors inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
