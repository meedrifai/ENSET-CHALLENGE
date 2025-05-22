'use client';

import { useEffect, useState } from 'react';
import AdminNavbar from '@/components/AdminNavbar';
import StudentProfileCard from './StudentProfileCard';
import SignatureOverview from './SignatureOverview';
import FraudHistoryTable from './FraudHistoryTable';
import AdminActions from './AdminActions';
import apiService from '@/services/api';

export default function StudentDetailClient({ studentId }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        // Fetch student data from the backend
        const studentData = await apiService.request(`/student/${studentId}`);
        
        // Fetch signature data
        const signatureData = await apiService.getStudentSignature(studentId);
        
        // Combine the data
        setStudent({
          ...studentData,
          signature: signatureData
        });
      } catch (err) {
        console.error('Error loading student data:', err);
        setError(err.message || 'Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error || 'Student not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Student Profile Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-medium text-gray-900">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Student ID</p>
                  <p className="text-lg font-medium text-gray-900">{student.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Field</p>
                  <p className="text-lg font-medium text-gray-900">{student.field}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-medium text-gray-900">{student.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Overview Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cognitive Signature</h2>
              <SignatureOverview student={student} />
            </div>
          </div>

          {/* Fraud History Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Fraud History</h2>
              <FraudHistoryTable studentId={student.id} />
            </div>
          </div>

          {/* Admin Actions Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Actions</h2>
              <AdminActions student={student} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
