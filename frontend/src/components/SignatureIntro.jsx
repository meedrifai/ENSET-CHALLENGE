import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Shield, Heart, Sparkles } from 'lucide-react';
import SignatureLayout from './SignatureLayout';
import NextButton from './NextButton';

export default function SignatureIntro() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleBeginSetup = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/profile-setup/writing');
    }, 800);
  };

  return (
    <SignatureLayout>
      <div className="text-center">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg animate-float">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 animate-fade-in">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">EDGUARD</span>
        </h1>

        {/* Description */}
        <div className="max-w-xl mx-auto mb-8 animate-fade-in-delay">
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            Let's get to know how <em className="text-blue-600 font-semibold">you</em> think. We'll ask a few creative questions to build your cognitive signature.
          </p>
          <p className="text-lg text-gray-500">
            This helps us <strong className="text-green-600">support you</strong> — not judge you.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-10 animate-slide-up-delay">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-800 text-sm">Privacy First</h3>
            <p className="text-xs text-blue-600 mt-1">Your data stays secure</p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <Heart className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800 text-sm">Supportive AI</h3>
            <p className="text-xs text-green-600 mt-1">Here to help, not judge</p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <Brain className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold text-purple-800 text-sm">Your Signature</h3>
            <p className="text-xs text-purple-600 mt-1">Unique as your mind</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in-delay-2">
          <NextButton 
            onClick={handleBeginSetup}
            loading={isLoading}
          >
            Begin Setup
          </NextButton>
        </div>

        {/* Additional Info */}
        <p className="text-sm text-gray-400 mt-6 animate-fade-in-delay-3">
          This process takes about 5-10 minutes to complete
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s ease-out 0.6s both;
        }

        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.3s both;
        }
      `}</style>
    </SignatureLayout>
  );
}