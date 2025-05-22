'use client';

import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export default function SignatureOverview({ student }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const TraitCard = ({ label, value, type = 'text' }) => {
    if (type === 'percentage') {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-sm font-bold text-blue-600">{value}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </div>
    );
  };

  const StyleTag = ({ children, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]}`}>
        {children}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>Error loading signature data: {error}</p>
      </div>
    );
  }

  if (!student?.signature) {
    return (
      <div className="text-center text-gray-600">
        <p>No signature data available</p>
      </div>
    );
  }

  const signatureData = student.signature;

  return (
    <div>
      {/* Core Traits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <TraitCard 
          label="Last Accuracy" 
          value={signatureData.last_accuracy} 
          type="percentage" 
        />
        <TraitCard 
          label="Cognitive Type" 
          value={signatureData.last_cognitive_type} 
        />
      </div>

      {/* Performance Metrics */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TraitCard 
            label="Test Completion" 
            value={signatureData.has_completed_quiz ? 100 : 0} 
            type="percentage" 
          />
          <TraitCard 
            label="Last Test Date" 
            value={new Date(signatureData.last_test_date).toLocaleDateString()} 
          />
        </div>
      </div>

      {/* Characteristics */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Characteristics</h4>
        <div className="flex flex-wrap gap-2">
          <StyleTag color="blue">{signatureData.field}</StyleTag>
          <StyleTag color="green">{signatureData.last_cognitive_type}</StyleTag>
          <StyleTag color="purple">
            {signatureData.last_accuracy >= 90 ? 'High Performer' : 
             signatureData.last_accuracy >= 70 ? 'Good Performer' : 'Developing'}
          </StyleTag>
        </div>
      </div>

      {/* Signature Confidence */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Signature Confidence</span>
          <span className="text-sm font-bold text-blue-700">
            {signatureData.last_accuracy}%
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${signatureData.last_accuracy}%` }}
          ></div>
        </div>
        <p className="text-xs text-blue-700">
          {signatureData.last_accuracy >= 90 ? 'High confidence level. Signature is reliable for fraud detection.' :
           signatureData.last_accuracy >= 70 ? 'Good confidence level. Signature is reliable.' :
           'Developing confidence level. More data needed for reliable signature.'}
        </p>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Last signature update: {new Date(signatureData.last_test_date).toLocaleString()}</span>
          <span>Field: {signatureData.field}</span>
        </div>
      </div>
    </div>
  );
}