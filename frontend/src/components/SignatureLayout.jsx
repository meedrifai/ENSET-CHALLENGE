import React from 'react';

export default function SignatureLayout({ 
  children, 
  currentStep = 0, 
  totalSteps = 3, 
  showProgress = false 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress Bar (optional) */}
        {showProgress && (
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index <= currentStep
                        ? 'bg-blue-500 shadow-lg'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 animate-slide-up">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}