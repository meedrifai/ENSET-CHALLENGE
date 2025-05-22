import { FiX, FiCheck, FiEye, FiUsers, FiHeart, FiDatabase, FiShield } from 'react-icons/fi';
import {FaBrain} from 'react-icons/fa';

export default function ComparisonSection() {
  const comparisons = [
    {
      problem: "Fraud Detection",
      traditional: {
        icon: FiEye,
        text: "Surveillance cameras and screen monitoring",
        iconColor: "text-red-500"
      },
      edguard: {
        icon: FaBrain,
        text: "AI behavior understanding and pattern recognition",
        iconColor: "text-green-500"
      }
    },
    {
      problem: "Student Trust",
      traditional: {
        icon: FiUsers,
        text: "Treats all students like potential suspects",
        iconColor: "text-red-500"
      },
      edguard: {
        icon: FiHeart,
        text: "Personalized learning with empathetic support",
        iconColor: "text-green-500"
      }
    },
    {
      problem: "Privacy & Data",
      traditional: {
        icon: FiDatabase,
        text: "Risky data collection and storage practices",
        iconColor: "text-red-500"
      },
      edguard: {
        icon: FiShield,
        text: "Secure, blockchain-verified, privacy-first approach",
        iconColor: "text-green-500"
      }
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Why EDGUARD is Different
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Moving beyond surveillance to understanding and support
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
              <div className="grid grid-cols-3 gap-8 px-8 py-6">
                <div className="font-bold text-lg">Challenge</div>
                <div className="font-bold text-lg">Traditional Systems</div>
                <div className="font-bold text-lg">EDGUARD Solution</div>
              </div>
            </div>

            {/* Rows */}
            {comparisons.map((comparison, index) => (
              <div key={index} className={`grid grid-cols-3 gap-8 px-8 py-6 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                {/* Problem */}
                <div className="font-semibold text-gray-800 flex items-center">
                  {comparison.problem}
                </div>

                {/* Traditional */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1">
                    <FiX className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <div className={`${comparison.traditional.iconColor} mb-1`}>
                      <comparison.traditional.icon className="w-5 h-5" />
                    </div>
                    <p className="text-gray-600 text-sm">
                      {comparison.traditional.text}
                    </p>
                  </div>
                </div>

                {/* EDGUARD */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <FiCheck className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className={`${comparison.edguard.iconColor} mb-1`}>
                      <comparison.edguard.icon className="w-5 h-5" />
                    </div>
                    <p className="text-gray-600 text-sm">
                      {comparison.edguard.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-6">
          {comparisons.map((comparison, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-4 text-center">
                {comparison.problem}
              </h3>
              
              <div className="space-y-4">
                {/* Traditional */}
                <div className="border border-red-200 rounded-xl p-4 bg-red-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1">
                      <FiX className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700 mb-1">Traditional Systems</div>
                      <div className={`${comparison.traditional.iconColor} mb-2`}>
                        <comparison.traditional.icon className="w-5 h-5" />
                      </div>
                      <p className="text-gray-600 text-sm">
                        {comparison.traditional.text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* EDGUARD */}
                <div className="border border-green-200 rounded-xl p-4 bg-green-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                      <FiCheck className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700 mb-1">EDGUARD Solution</div>
                      <div className={`${comparison.edguard.iconColor} mb-2`}>
                        <comparison.edguard.icon className="w-5 h-5" />
                      </div>
                      <p className="text-gray-600 text-sm">
                        {comparison.edguard.text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-full font-semibold">
            <FaBrain className="w-5 h-5" />
            Experience the Difference
          </div>
        </div>
      </div>
    </section>
  );
}