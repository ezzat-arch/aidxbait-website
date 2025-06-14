import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AppleIcon, PlayIcon } from "./icons";
import { motion } from "framer-motion";

export function AppDownloadSection() {
  return (
    <section
      id="app"
      className="py-20 bg-gradient-to-br from-primary to-accent text-white"
    >
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, type: "spring" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Download the AidXBait App Today
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl">
              Take control of your orthopedic care journey with our
              comprehensive mobile application. Available for iOS and Android
              devices.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 gap-2"
              >
                <AppleIcon className="h-5 w-5" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs">Download on the</span>
                  <span className="text-sm font-medium">App Store</span>
                </div>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 gap-2"
              >
                <PlayIcon className="h-5 w-5" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs">Get it on</span>
                  <span className="text-sm font-medium">Google Play</span>
                </div>
              </Button>
            </div>

            <div className="mt-12 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Real-time Progress Tracking</h4>
                  <p className="text-white/70">
                    Monitor your recovery journey with detailed analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Seamless Appointment Booking</h4>
                  <p className="text-white/70">
                    Schedule consultations with just a few taps
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">
                    Personalized Exercise Protocols
                  </h4>
                  <p className="text-white/70">
                    Access customized therapy programs for your specific needs
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative h-[600px] hidden lg:block"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, type: "spring" }}
          >
            <div className="absolute top-0 left-0 w-[280px] h-[570px] bg-white/10 rounded-3xl backdrop-blur-sm transform -rotate-6 shadow-xl"></div>
            <div className="absolute top-4 right-4 w-[280px] h-[570px] bg-white/10 rounded-3xl backdrop-blur-sm transform rotate-6 shadow-xl"></div>
            <div className="absolute inset-0 m-auto w-[280px] h-[570px] bg-white/20 rounded-3xl backdrop-blur-md shadow-2xl p-3">
              <div className="w-full h-full bg-black rounded-2xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=564&width=274"
                  alt="AidXBait App Interface"
                  width={274}
                  height={564}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
