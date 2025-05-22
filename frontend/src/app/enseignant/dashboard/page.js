'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CreateAssignmentForm from '@/components/CreateAssignmentForm';
import AssignmentList from '@/components/AssignmentList';
import StudentList from '@/components/StudentList';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('assignments');
  const [teacher, setTeacher] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]); // In real app, get from auth/params

  useEffect(() => {
    fetchTeacherData();
    fetchAssignments();
    fetchStudents();
  }, []);

  const fetchTeacherData = async () => {
    const savedData = localStorage.getItem("enseignantData");
  
    if (!savedData) {
      console.error("enseignantData not found in localStorage");
      return;
    }
  
    const parsedTeacher = JSON.parse(savedData);
    setTeacher(parsedTeacher);
  
    console.log("teacher", parsedTeacher.id);
    console.log("teacher", parsedTeacher);
  
    try {
      const response = await fetch(`http://localhost:8000/teacher/${parsedTeacher.id}`);
      if (response.ok) {
        const data = await response.json();
        setTeacher(data);
      }
    } catch (error) {
      console.error("Error fetching teacher:", error);
    }
  };
  

  const fetchAssignments = async () => {
    const savedData = localStorage.getItem("enseignantData");
  
    if (!savedData) {
      console.error("enseignantData not found in localStorage");
      return;
    }
  
    const parsedTeacher = JSON.parse(savedData);
    setTeacher(parsedTeacher);
  
    console.log("teacher", parsedTeacher.id);
    console.log("teacher", parsedTeacher);
  
    try {
      const response = await fetch(`http://localhost:8000/teacher/${parsedTeacher.id}/assignments`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchStudents = async () => {
    const savedData = localStorage.getItem("enseignantData");
  
    if (!savedData) {
      console.error("enseignantData not found in localStorage");
      return;
    }
  
    const parsedTeacher = JSON.parse(savedData);
    setTeacher(parsedTeacher);
  
    console.log("teacher", parsedTeacher.id);
    console.log("teacher", parsedTeacher);
  
    try {
      const response = await fetch(`http://localhost:8000/teacher/${parsedTeacher.id}/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAssignmentCreated = () => {
    fetchAssignments();
    setActiveTab('assignments');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">EDGUARD - Enseignant</h1>
          {teacher && (
            <p className="text-gray-600 mt-2">
              Bienvenue, {teacher.name} • Modules: {teacher.modules?.join(', ')}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('assignments')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'assignments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Mes Devoirs & Examens
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Créer Devoir/Examen
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Mes Étudiants
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'assignments' && (
              <AssignmentList assignments={assignments.assignments} onRefresh={fetchAssignments} />
            )}
            {activeTab === 'create' && teacher && (
              <CreateAssignmentForm
                teacherId={teacher.id}
                modules={teacher.modules || []}
                onSuccess={handleAssignmentCreated}
              />
            )}
            {activeTab === 'students' && (
              <StudentList students={students.students} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}