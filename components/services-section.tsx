import Image from "next/image"
import { Calendar, Activity, Video, ShoppingBag, Clock, Smartphone } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    icon: <Activity className="h-10 w-10 text-primary" />,
    title: "Automated Physical Therapy",
    description: "Personalized therapy protocols with real-time feedback and progress tracking.",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    icon: <Calendar className="h-10 w-10 text-primary" />,
    title: "Seamless Appointment Booking",
    description: "Book in-person or virtual consultations with specialists in just a few taps.",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    icon: <Video className="h-10 w-10 text-primary" />,
    title: "Virtual Consultations",
    description: "Connect with orthopedic specialists from the comfort of your home.",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    icon: <ShoppingBag className="h-10 w-10 text-primary" />,
    title: "Exercise Protocol Marketplace",
    description: "Purchase specialized exercise protocols designed for your specific injury.",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    icon: <Clock className="h-10 w-10 text-primary" />,
    title: "Post-Op Recovery Tracking",
    description: "Monitor your recovery progress with detailed analytics and insights.",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    icon: <Smartphone className="h-10 w-10 text-primary" />,
    title: "Mobile Accessibility",
    description: "Access all features through our intuitive mobile application anytime, anywhere.",
    image: "/placeholder.svg?height=120&width=120",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Comprehensive Services</h2>
          <p className="text-lg text-gray-600">
            AidXBait offers a complete ecosystem for orthopedic care, from post-operative recovery to ongoing physical
            therapy.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card
              key={index}
              className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
            >
              <CardHeader className="pb-0">
                <div className="mb-4 flex justify-between items-start">
                  <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-primary/10 transition-colors duration-300">
                    {service.icon}
                  </div>
                  <div className="relative w-24 h-24 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  </div>
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mt-2">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

