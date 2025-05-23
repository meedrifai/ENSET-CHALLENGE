'use client';

import { useState, useEffect } from 'react';
import AdminNavbar from '@/components/AdminNavbar';
import CreateStudentForm from '@/components/CreateStudentForm';
import StudentListTable from '@/components/StudentListTable';
import Navbar from '@/components/NavbarAuth';

const API_BASE_URL = "";

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeSignatures: 0,
    totalFraudIncidents: 0,
    averageFraudRate: 0
  });

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/students`);
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchStudents();
  }, []);

  // Update stats whenever students change
  useEffect(() => {
    const totalStudents = students.length;
    const activeSignatures = students.filter(s => s.status === 'Signature Complete').length;
    const totalFraudIncidents = students.reduce((sum, s) => sum + (s.fraudCount || 0), 0);
    const averageFraudRate = totalStudents > 0 ? (totalFraudIncidents / totalStudents).toFixed(1) : 0;

    setStats({
      totalStudents,
      activeSignatures,
      totalFraudIncidents,
      averageFraudRate
    });
  }, [students]);

  const handleStudentCreated = async (newStudent) => {
    try {
      const response = await fetch(`http://localhost:8000/students/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      });
      
      if (response.ok) {
        fetchStudents(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  const StatCard = ({ title, value, description, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-800 border-blue-200',
      green: 'bg-green-50 text-green-800 border-green-200',
      red: 'bg-red-50 text-red-800 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200'
    };

    return (
      <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className="text-xs opacity-70 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar location="admin"/>
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage student accounts and monitor academic integrity across your institution.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            description="Registered accounts"
            color="blue"
          />
          <StatCard
            title="Active Signatures"
            value={stats.activeSignatures}
            description="Completed cognitive profiles"
            color="green"
          />
          <StatCard
            title="Fraud Incidents"
            value={stats.totalFraudIncidents}
            description="Total flagged activities"
            color="red"
          />
          <StatCard
            title="Average Fraud Rate"
            value={`${stats.averageFraudRate}%`}
            description="Per student average"
            color="yellow"
          />
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Student Management</h2>
          <CreateStudentForm onStudentCreated={handleStudentCreated} />
        </div>

        {/* Students Table */}
        <StudentListTable students={students} />

        {/* Quick Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {students.slice(0, 3).map(student => (
                <div key={student.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {student.fullName ? student.fullName.split(' ').map(n => n[0]).join('') : '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.fullName || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">Created {student.createdAt || 'Recently'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{student.status || 'Pending'}</span>
                </div>
              ))}
            </div>
            {students.length === 0 && (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Detection System</span>
                <span className="text-sm text-green-600 font-medium">✅ Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Connection</span>
                <span className="text-sm text-green-600 font-medium">✅ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Firebase Database</span>
                <span className="text-sm text-green-600 font-medium">✅ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Real-time Monitoring</span>
                <span className="text-sm text-green-600 font-medium">✅ Running</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}