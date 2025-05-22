import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import HowItWorks from "@/components/HowItWorks"
import ComparisonSection from "@/components/ComparisonSection"
import TestimonialSection from "@/components/TestimonialSection"
import CallToAction from "@/components/CallToAction"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <ComparisonSection />
      <TestimonialSection />
      <CallToAction />
      <Footer />
    </div>
  )
}