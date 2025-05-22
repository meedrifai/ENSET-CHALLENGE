import { FiYoutube, FiUser, FiStar } from 'react-icons/fi';

export default function TestimonialSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Quote Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-8 backdrop-blur-sm">
            <FiYoutube className="w-8 h-8 text-cyan-300" />
          </div>

          {/* Main Quote */}
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-8">
            "I almost cheated... but EDGUARD reminded me{' '}
            <span className="text-cyan-300 font-semibold">who I want to become</span>."
          </blockquote>

          {/* Attribution */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-md opacity-30"></div>
            </div>

            <div className="text-left">
              <div className="font-semibold text-lg">Future Me</div>
              <div className="text-cyan-300 text-sm">2025 Graduate</div>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
          </div>

          {/* Additional Context */}
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-blue-100 leading-relaxed mb-6">
              EDGUARD doesn't just catch cheating — it helps you become the person you aspire to be. 
              Through understanding and support, not punishment and surveillance.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-300 mb-2">98%</div>
                <div className="text-blue-200">Integrity Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-300 mb-2">50K+</div>
                <div className="text-blue-200">Students Supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-300 mb-2">Zero</div>
                <div className="text-blue-200">Privacy Violations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-cyan-400 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute bottom-32 right-32 w-3 h-3 bg-blue-400 rounded-full animate-pulse opacity-40 delay-75"></div>
      <div className="absolute top-1/3 right-20 w-2 h-2 bg-white rounded-full animate-pulse opacity-50 delay-150"></div>
      <div className="absolute bottom-20 left-1/3 w-5 h-5 bg-cyan-300 rounded-full animate-pulse opacity-30 delay-300"></div>
    </section>
  );
}