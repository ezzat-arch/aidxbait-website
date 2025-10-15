"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

type Testimonial = {
        quote: string;
        name: string;
        designation: string;
        src: string;
};

type TestimonialsCarouselProps = {
        testimonials: Testimonial[];
        autoplay?: boolean;
        autoplayIntervalMs?: number;
};

const DEFAULT_AUTOPLAY_INTERVAL = 5000;

const getRotationValues = (length: number) =>
        Array.from({ length }, () => Math.floor(Math.random() * 21) - 10);

const PlaceholderState = ({ activeTestimonial }: { activeTestimonial: Testimonial }) => {
        return (
                <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl lg:max-w-6xl md:px-8 lg:px-12">
                        <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
                                <div>
                                        <div className="relative h-80 w-full">
                                                <div className="absolute inset-0 origin-bottom">
                                                        <img
                                                                src={activeTestimonial.src}
                                                                alt={activeTestimonial.name}
                                                                width={500}
                                                                height={500}
                                                                draggable={false}
                                                                className="h-full w-full rounded-3xl object-cover object-center"
                                                        />
                                                </div>
                                        </div>
                                </div>
                                <div className="flex flex-col justify-between py-4">
                                        <div>
                                                <h3 className="text-2xl font-bold text-primary dark:text-white">
                                                        {activeTestimonial.name}
                                                </h3>
                                                <p className="text-sm text-primary/70 dark:text-neutral-500">
                                                        {activeTestimonial.designation}
                                                </p>
                                                <p className="mt-8 text-lg text-black/80 dark:text-neutral-300">
                                                        {activeTestimonial.quote}
                                                </p>
                                        </div>
                                        <div className="flex gap-4 pt-12 md:pt-0">
                                                <button
                                                        className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                                                        type="button"
                                                >
                                                        <IconArrowLeft className="h-5 w-5 text-primary transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
                                                </button>
                                                <button
                                                        className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                                                        type="button"
                                                >
                                                        <IconArrowRight className="h-5 w-5 text-primary transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
                                                </button>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

const TestimonialsCarousel = ({
        testimonials,
        autoplay = false,
        autoplayIntervalMs = DEFAULT_AUTOPLAY_INTERVAL,
}: TestimonialsCarouselProps) => {
        const [activeIndex, setActiveIndex] = useState(0);
        const [rotationValues, setRotationValues] = useState<number[]>([]);
        const [isMounted, setIsMounted] = useState(false);

        const goToNext = useCallback(() => {
                setActiveIndex((previous) => (previous + 1) % testimonials.length);
        }, [testimonials.length]);

        const goToPrevious = useCallback(() => {
                setActiveIndex((previous) => (previous - 1 + testimonials.length) % testimonials.length);
        }, [testimonials.length]);

        useEffect(() => {
                setRotationValues(getRotationValues(testimonials.length));
                setIsMounted(true);
        }, [testimonials.length]);

        useEffect(() => {
                if (!autoplay) {
                        return;
                }

                const interval = window.setInterval(goToNext, autoplayIntervalMs);
                return () => window.clearInterval(interval);
        }, [autoplay, autoplayIntervalMs, goToNext]);

        const activeTestimonial = testimonials[activeIndex];

        const rotationLookup = useMemo(() => {
                return rotationValues.reduce<Record<number, number>>((accumulator, value, index) => {
                        accumulator[index] = value;
                        return accumulator;
                }, {});
        }, [rotationValues]);

        if (!isMounted) {
                return <PlaceholderState activeTestimonial={activeTestimonial} />;
        }

        return (
                <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl lg:max-w-6xl md:px-8 lg:px-12">
                        <div className="relative grid grid-cols-1 gap-20 md:grid-cols-2">
                                <div>
                                        <div className="relative h-80 w-full">
                                                <AnimatePresence>
                                                        {testimonials.map((testimonial, index) => {
                                                                const rotation = rotationLookup[index] ?? 0;
                                                                const isActive = index === activeIndex;

                                                                return (
                                                                        <motion.div
                                                                                key={testimonial.src}
                                                                                initial={{
                                                                                        opacity: 0,
                                                                                        scale: 0.9,
                                                                                        z: -100,
                                                                                        rotate: rotation,
                                                                                }}
                                                                                animate={{
                                                                                        opacity: isActive ? 1 : 0.7,
                                                                                        scale: isActive ? 1 : 0.95,
                                                                                        z: isActive ? 0 : -100,
                                                                                        rotate: isActive ? 0 : rotation,
                                                                                        zIndex: isActive ? 40 : testimonials.length + 2 - index,
                                                                                        y: isActive ? [0, -80, 0] : 0,
                                                                                }}
                                                                                exit={{
                                                                                        opacity: 0,
                                                                                        scale: 0.9,
                                                                                        z: 100,
                                                                                        rotate: rotation,
                                                                                }}
                                                                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                                                                className="absolute inset-0 origin-bottom"
                                                                        >
                                                                                <img
                                                                                        src={testimonial.src}
                                                                                        alt={testimonial.name}
                                                                                        width={500}
                                                                                        height={500}
                                                                                        draggable={false}
                                                                                        className="h-full w-full rounded-3xl object-cover object-center"
                                                                                />
                                                                        </motion.div>
                                                                );
                                                        })}
                                                </AnimatePresence>
                                        </div>
                                </div>
                                <div className="flex flex-col justify-between py-4">
                                        <motion.div
                                                key={activeIndex}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -20, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                        >
                                                <h3 className="text-2xl font-bold text-primary dark:text-white">
                                                        {activeTestimonial.name}
                                                </h3>
                                                <p className="text-sm text-primary/70 dark:text-neutral-500">
                                                        {activeTestimonial.designation}
                                                </p>
                                                <motion.p className="mt-8 text-lg text-black/80 dark:text-neutral-300">
                                                        {activeTestimonial.quote.split(" ").map((word, wordIndex) => (
                                                                <motion.span
                                                                        key={`${word}-${wordIndex}`}
                                                                        initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                                                                        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                                                                        transition={{
                                                                                duration: 0.2,
                                                                                ease: "easeInOut",
                                                                                delay: 0.02 * wordIndex,
                                                                        }}
                                                                        className="inline-block"
                                                                >
                                                                        {word}{" "}
                                                                </motion.span>
                                                        ))}
                                                </motion.p>
                                        </motion.div>
                                        <div className="flex gap-4 pt-12 md:pt-0">
                                                <button
                                                        onClick={goToPrevious}
                                                        className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                                                        type="button"
                                                >
                                                        <IconArrowLeft className="h-5 w-5 text-primary transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
                                                </button>
                                                <button
                                                        onClick={goToNext}
                                                        className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800"
                                                        type="button"
                                                >
                                                        <IconArrowRight className="h-5 w-5 text-primary transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
                                                </button>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export type { Testimonial, TestimonialsCarouselProps };
export default TestimonialsCarousel;
