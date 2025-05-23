
import Navbar from "@/components/NavbarAuth"
import StudentDashboard from "@/components/StudentDashboard"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar location="student"/>
      <StudentDashboard/>
    </div>
  )
}