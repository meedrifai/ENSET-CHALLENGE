import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function NextButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  variant = 'primary' 
}) {
  const baseClasses = "w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 hover:shadow-lg focus:ring-blue-500",
    secondary: "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:scale-105 hover:shadow-md focus:ring-blue-500"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          <span>{children}</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}