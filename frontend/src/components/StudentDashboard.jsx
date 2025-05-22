 "use client"
import { useState } from 'react';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('cours');
  
  return (
    <div className="p-4">
      <nav className="flex space-x-4 mb-4">
        {['cours', 'notes', 'profil'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{tab}</button>
        ))}
      </nav>
      <div className="p-4 border rounded">{activeTab === 'cours' ? 'Liste des cours' : activeTab === 'notes' ? 'Mes notes' : 'Mon profil'}</div>
    </div>
  );
}