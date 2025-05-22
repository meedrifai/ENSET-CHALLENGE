import {FiArrowRight, FiHeart, FiShield } from 'react-icons/fi';
import {FaBrain} from 'react-icons/fa';
export default function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 to-cyan-400"></div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Main Message */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-gray-800">It's not just about</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                passing.
              </span>
              <br />
              <span className="text-gray-800">It's about becoming</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-500 to-teal-400 bg-clip-text text-transparent">
                someone you're proud of.
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              EDGUARD helps you build integrity, character, and confidence through understanding and support — not surveillance and punishment.
            </p>
          </div>

          {/* Main CTA Button */}
          <div className="mb-12">
            <button className="group relative px-12 py-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
              {/* Button Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex items-center gap-3">
                <FaBrain className="w-6 h-6" />
                Start Building Your Signature
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>

          {/* Value Propositions */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <FaBrain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Personalized Learning</h3>
              <p className="text-gray-600 text-sm">AI that understands your unique learning style and provides tailored support.</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <FiHeart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Empathetic Support</h3>
              <p className="text-gray-600 text-sm">Get encouragement and guidance when you need it most, not judgment.</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-green-400 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Privacy Protected</h3>
              <p className="text-gray-600 text-sm">Your data is secure, encrypted, and blockchain-verified. Always.</p>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center gap-2">
              Learn More About AI Ethics
            </button>
            
            <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center gap-2">
              View Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                SOC 2 Compliant
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                GDPR Ready
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                Blockchain Verified
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                Open Source
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full animate-pulse delay-75"></div>
    </section>
  );
}