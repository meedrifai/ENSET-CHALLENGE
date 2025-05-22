"use client";
import React from 'react';
import { FiPlay, FiShield } from 'react-icons/fi';
import { useState, useEffect} from 'react';
import {FaBrain, FaChalkboardTeacher} from 'react-icons/fa';
import Link from 'next/link';

export default function HeroSection() {
  const [currentAnimation, setCurrentAnimation] = useState(0);
  
  const animations = [
    { icon: FaBrain, text: "Analyzing cognitive patterns..." },
    { icon: FiShield, text: "Detecting unusual behavior..." },
    { icon: FiPlay, text: "Providing supportive feedback..." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimation((prev) => (prev + 1) % animations.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Your Mind.
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Your Integrity.
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                EDGUARD uses AI to protect academic integrity by understanding how you think — not watching what you do.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/student/login" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                <FaBrain className="w-5 h-5" />
                Student Login
              </Link>
              
              <Link href="/enseignant/login" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                <FaChalkboardTeacher className="w-5 h-5" />
                Teacher Login
              </Link>

              <Link href="/admin/login" className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2">
                <FiShield className="w-5 h-5" />
                Admin Login
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiShield className="w-4 h-4 text-green-500" />
                Blockchain Secured
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaBrain className="w-4 h-4 text-blue-500" />
                AI Powered
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                Privacy First
              </div>
            </div>
          </div>

          {/* Right Side - Animation */}
          <div className="flex justify-center">
            <div className="relative w-80 h-80">
              {/* Main Circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl">
                  <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
                    {/* Animated Icon */}
                    <div className="transition-all duration-1000 transform">
                      {React.createElement(animations[currentAnimation].icon, {
                        className: "w-20 h-20 text-blue-600"
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl animate-bounce delay-100 shadow-lg flex items-center justify-center">
                <FaBrain className="w-8 h-8 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl animate-bounce delay-300 shadow-lg flex items-center justify-center">
                <FiShield className="w-8 h-8 text-white" />
              </div>

              {/* Status Text */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border">
                <p className="text-sm text-gray-600 whitespace-nowrap">
                  {animations[currentAnimation].text}
                </p>
              </div>

              {/* Pulse Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping"></div>
              <div className="absolute inset-4 rounded-full border-2 border-cyan-200 animate-ping delay-75"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}