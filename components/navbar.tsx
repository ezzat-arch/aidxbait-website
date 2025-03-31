"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    })
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="AidXBait Logo" width={150} height={40} className="h-auto w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#services" className="text-sm font-medium hover:text-primary transition-colors">
            Services
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="#app" className="text-sm font-medium hover:text-primary transition-colors">
            Our App
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
            Testimonials
          </Link>
          <Link href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            Log In
          </Button>
          <Button className="bg-primary text-white hover:bg-primary/90">Get Started</Button>
        </div>
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-6 mt-8">
              <Link href="#services" className="text-lg font-medium hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="#how-it-works" className="text-lg font-medium hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="#app" className="text-lg font-medium hover:text-primary transition-colors">
                Our App
              </Link>
              <Link href="#testimonials" className="text-lg font-medium hover:text-primary transition-colors">
                Testimonials
              </Link>
              <Link href="#contact" className="text-lg font-medium hover:text-primary transition-colors">
                Contact
              </Link>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white w-full"
                >
                  Log In
                </Button>
                <Button className="bg-primary text-white hover:bg-primary/90 w-full">Get Started</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

