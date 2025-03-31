import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Knee Replacement Patient",
    image: "/placeholder.svg?height=80&width=80",
    content:
      "AidXBait transformed my recovery experience after knee replacement surgery. The guided exercises and progress tracking made a huge difference in my rehabilitation journey.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Sports Injury Recovery",
    image: "/placeholder.svg?height=80&width=80",
    content:
      "As an athlete recovering from a shoulder injury, the personalized exercise protocols were exactly what I needed. The virtual consultations saved me so much time.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Physical Therapist",
    image: "/placeholder.svg?height=80&width=80",
    content:
      "From a professional perspective, AidXBait provides an exceptional platform for remote patient monitoring. The detailed analytics help me adjust treatment plans effectively.",
    rating: 4,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-gray-600">
            Discover how AidXBait is helping patients and healthcare professionals transform orthopedic care.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-4">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

