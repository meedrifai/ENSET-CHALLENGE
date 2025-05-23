"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
export default function Navbar({location}) {
    const router = useRouter();
  const handleSignOut = () => {
    // Ajoute ici la logique de déconnexion (ex : suppression du token, redirection, etc.)
    console.log("Signed out");
    if (location == "student") {
      localStorage.removeItem("studentData");
      router.push("/student/login");
    } else if (location == "admin") {
      localStorage.removeItem("adminData");
      router.push("/admin/login");
    }
    else if (location == "teacher") {
      localStorage.removeItem("teacherData");
      console.log("Signed out 3");
      router.push("/enseignant/login");
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span onClick={() => router.push("/")} className="cursor-pointer text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              EDGUARD
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="text-gray-700 cursor-pointer hover:text-red-500 border border-gray-300 hover:border-red-500 px-4 py-1 rounded transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
