import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Download the App",
    description:
      "Get started by downloading the AidXBait app from the App Store or Google Play Store.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    number: "02",
    title: "Create Your Profile",
    description:
      "Set up your personal profile with your medical history and specific orthopedic needs.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    number: "03",
    title: "Connect with Specialists",
    description:
      "Browse and connect with orthopedic specialists or physical therapists based on your needs.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    number: "04",
    title: "Start Your Recovery Journey",
    description:
      "Begin your personalized therapy program with real-time guidance and progress tracking.",
    image: "/placeholder.svg?height=300&width=300",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="pt-20 bg-blue-50 overflow-x-hidden">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold ">
            How AidXBait Works
          </h2>
          <p className="text-lg mt-6 text-gray-600">
            Our platform simplifies the orthopedic care process with an
            intuitive, step-by-step approach.
          </p>
        </div>

        <div>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`${
                index % 2 === 0 ? "bg-blue-50" : "bg-blue-100"
              } py-20 relative left-1/2 right-1/2 -mx-[50vw] w-screen`}
            >
              <div className="container mx-auto">
                <div
                  className={`grid md:grid-cols-2 gap-8 items-center ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <motion.div
                    className={`order-2 ${
                      index % 2 === 1 ? "md:order-1" : "md:order-2"
                    }`}
                    initial={{ opacity: 0, x: 80 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1, type: "spring" }}
                  >
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-lg opacity-70"></div>
                      <div className="relative bg-white p-6 rounded-3xl shadow-lg">
                        <Image
                          src={step.image || "/placeholder.svg"}
                          alt={step.title}
                          width={300}
                          height={300}
                          className="w-full h-auto rounded-xl"
                        />
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -80 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1, type: "spring" }}
                  >
                    <motion.div
                      className="text-4xl font-bold text-primary/20"
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 1, delay: 0.1, type: "spring" }}
                    >
                      {step.number}
                    </motion.div>
                    <div>
                      <motion.h3
                        className="text-2xl font-bold mb-4"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                          duration: 1,
                          delay: 0.2,
                          type: "spring",
                        }}
                      >
                        {step.title}
                      </motion.h3>
                      <motion.p
                        className="text-lg text-gray-600 mb-6"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{
                          duration: 0.7,
                          delay: 0.3,
                          type: "spring",
                        }}
                      >
                        {step.description}
                      </motion.p>
                      <motion.ul
                        className="space-y-2"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={{
                          hidden: {},
                          visible: {
                            transition: {
                              staggerChildren: 0.15,
                            },
                          },
                        }}
                      >
                        {[1, 2, 3].map(item => (
                          <motion.li
                            key={item}
                            className="flex items-center gap-2"
                            variants={{
                              hidden: { opacity: 0, y: 20 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ type: "spring", duration: 0.5 }}
                          >
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span className="text-gray-700">
                              Feature point {item} for{" "}
                              {step.title.toLowerCase()}
                            </span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
