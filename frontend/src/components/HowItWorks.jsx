import { FiUser, FiShield, FiArrowRight } from 'react-icons/fi';
import {FaBrain} from 'react-icons/fa';

export default function HowItWorks() {
  const steps = [
    {
      icon: FiUser,
      title: "Build Your Cognitive Signature",
      description: "EDGUARD learns your unique thinking patterns, writing style, and problem-solving approach through initial assessments.",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: FaBrain,
      title: "Learn with Live AI Support",
      description: "Get personalized feedback and encouragement as you study. Our AI understands when you're struggling and offers help.",
      color: "from-cyan-400 to-teal-400"
    },
    {
      icon: FiShield,
      title: "Fair & Secure Exams with Smart Feedback",
      description: "During exams, EDGUARD monitors for unusual patterns and provides supportive guidance while maintaining integrity.",
      color: "from-teal-400 to-green-400"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            How EDGUARD Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to build trust, maintain integrity, and support your learning journey
          </p>
        </div>

        <div className="relative">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                {/* Step Card */}
                <div className="relative group">
                  <div className="w-80 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Step Number */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* Arrow (except for last step) */}
                {index < steps.length - 1 && (
                  <div className="mx-8 text-gray-400">
                    <FiArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connecting Line (except for last step) */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-4">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-blue-300 to-cyan-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 mx-auto">
            <FaBrain className="w-5 h-5" />
            Start Building Your Signature
          </button>
        </div>
      </div>
    </section>
  );
}