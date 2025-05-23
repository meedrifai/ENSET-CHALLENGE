"use client";
import { useState } from 'react';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { FiShield } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function AdminTeacherLoginPage() {
  const [activeTab, setActiveTab] = useState('teacher');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
      let response;
      if (activeTab === 'teacher') {
        response = await api.enseignantLogin(email, password);
      } else {
        response = await api.adminLogin(email, password);
      }

      if (response.token) {
        if (activeTab === 'teacher') {
          router.push('/enseignant/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
              activeTab === 'teacher'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('teacher')}
          >
            <div className="flex items-center justify-center gap-2">
              <FaChalkboardTeacher className="w-5 h-5" />
              <span>Teacher</span>
            </div>
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
              activeTab === 'admin'
                ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('admin')}
          >
            <div className="flex items-center justify-center gap-2">
              <FiShield className="w-5 h-5" />
              <span>Admin</span>
            </div>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${
              activeTab === 'teacher'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500'
                : 'bg-gradient-to-r from-pink-600 to-red-500'
            }`}
          >
            {activeTab === 'teacher' ? 'Teacher Login' : 'Admin Login'}
          </button>

          <div className="text-center">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
} 