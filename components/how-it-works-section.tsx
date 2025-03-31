import Image from "next/image"
import { CheckCircle } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Download the App",
    description: "Get started by downloading the AidXBait app from the App Store or Google Play Store.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    number: "02",
    title: "Create Your Profile",
    description: "Set up your personal profile with your medical history and specific orthopedic needs.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    number: "03",
    title: "Connect with Specialists",
    description: "Browse and connect with orthopedic specialists or physical therapists based on your needs.",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    number: "04",
    title: "Start Your Recovery Journey",
    description: "Begin your personalized therapy program with real-time guidance and progress tracking.",
    image: "/placeholder.svg?height=300&width=300",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How AidXBait Works</h2>
          <p className="text-lg text-gray-600">
            Our platform simplifies the orthopedic care process with an intuitive, step-by-step approach.
          </p>
        </div>

        <div className="space-y-20 md:space-y-32">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? "md:flex-row-reverse" : ""}`}
            >
              <div className={`order-2 ${index % 2 === 1 ? "md:order-1" : "md:order-2"}`}>
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
              </div>
              <div className={`order-1 ${index % 2 === 1 ? "md:order-2" : "md:order-1"}`}>
                <div className="flex items-start gap-4">
                  <div className="text-4xl font-bold text-primary/20">{step.number}</div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-lg text-gray-600 mb-6">{step.description}</p>
                    <ul className="space-y-2">
                      {[1, 2, 3].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="text-gray-700">
                            Feature point {item} for {step.title.toLowerCase()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

