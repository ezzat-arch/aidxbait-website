"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar({
  sentinelRef,
}: {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    if (!sentinelRef?.current) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setAtTop(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [sentinelRef]);

  return (
    <header
      className={`fixed top-0  left-0 w-full z-50 transition-all duration-200 ${
        atTop
          ? "navbar--transparent"
          : "navbar--scrolled bg-slate-100 backdrop-blur-md shadow-sm"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="AidXBait Logo"
            width={180}
            height={100}
            className="object-contain"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: "#services", label: "Services" },
            { href: "#how-it-works", label: "How It Works" },
            { href: "#app", label: "Our App" },
            { href: "#testimonials", label: "Testimonials" },
            { href: "#contact", label: "Contact" },
          ].map(({ href, label }) => {
            const baseStyle = {
              fontFamily: "Manrope, Arial, sans-serif",
              fontWeight: 500,
              color: atTop ? "rgb(243, 241, 236)" : "rgb(36, 42, 42)",
              fontSize: 14,
              lineHeight: "21px",
              transition: "color 0.2s",
            };
            return (
              <Link
                key={href}
                href={href}
                className="navbar-link"
                style={baseStyle}
                onMouseEnter={e =>
                  (e.currentTarget.style.color = "rgb(183, 174, 136)")
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.color = atTop
                    ? "rgb(243, 241, 236)"
                    : "rgb(36, 42, 42)")
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            className={`rounded-full text-white px-10 py-5 font-medium shadow-none border-none backdrop-blur-md transition-all duration-700 ${
              atTop
                ? "bg-white/30 hover:bg-black/30"
                : "bg-black/70 hover:bg-[#242A2A]"
            }`}
            style={{
              fontFamily: "Manrope, Arial, sans-serif",
              fontWeight: 500,
              color: "rgb(243, 241, 236)",
              fontSize: 16,
              lineHeight: "26px",
            }}
          >
            Login
          </Button>
        </div>
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex text-white flex-col gap-6 mt-8">
              <Link
                href="#services"
                className="text-lg font-medium hover:text-primary transition-colors"
              >
                Services
              </Link>
              <Link
                href="#how-it-works"
                className="text-lg font-medium hover:text-primary transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#app"
                className="text-lg font-medium hover:text-primary transition-colors"
              >
                Our App
              </Link>
              <Link
                href="#testimonials"
                className="text-lg font-medium hover:text-primary transition-colors"
              >
                Testimonials
              </Link>
              <Link
                href="#contact"
                className="text-lg font-medium hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="ghost"
                  className={`rounded-full text-white px-8 py-2 font-medium shadow-none border-none backdrop-blur-md transition-colors ${
                    atTop ? "bg-black/20" : "bg-[#242A2A]"
                  }`}
                >
                  Login
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
