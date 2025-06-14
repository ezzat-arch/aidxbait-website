"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const HeroSection = React.forwardRef<
  HTMLElement,
  {
    navbar?: React.ReactNode;
    sentinelRef?: React.RefObject<HTMLDivElement | null>;
  }
>(function HeroSection({ navbar, sentinelRef }, ref) {
  return (
    <section
      ref={ref}
      className="relative min-h-screen h-[100vh] flex items-center bg-cover bg-center bg-no-repeat p-0 m-0"
      style={{ backgroundImage: "url('/images/hero_image.jpg')" }}
    >
      {navbar && <div className="fixed top-0 left-0 w-full z-50">{navbar}</div>}
      <div className="absolute inset-0 bg-black/50 z-0" />
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center  z-10"></div>
      <div className="container relative z-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.5 }}
            className="flex flex-col gap-6"
          >
            <h1 className="text-4xl text-slate-200 sm:text-5xl md:text-6xl font-bold tracking-tight">
              Revolutionizing{" "}
              <span className="text-primary">Orthopedic Care</span> Through
              Technology
            </h1>
            <p className="text-lg text-slate-300 max-w-xl">
              AidXBait automates post-operative care, physical therapy, and
              appointment booking for orthopedic patients. Take control of your
              recovery journey with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 hover:bg-white hover:text-primary transition-all duration-500 text-white"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 hover:text-white transition-all duration-500"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, amount: 0.5 }}
            className="relative h-[400px] lg:h-[500px] animate-float"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl transform rotate-3"></div>
            <div className="absolute top-4 left-4 w-full h-full bg-white rounded-3xl shadow-xl p-6 flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=400&width=400"
                alt="AidXBait App Interface"
                width={400}
                height={400}
                className="rounded-xl shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
      <div
        className="absolute top-0 left-0 w-full z-40"
        style={{ height: 1 }}
        ref={sentinelRef}
      />
    </section>
  );
});
