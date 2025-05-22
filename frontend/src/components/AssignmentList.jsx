'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AssignmentList({ assignments, onRefresh }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    
    if (deadlineDate < now) {
      return 'bg-red-100 text-red-800';
    } else if (deadlineDate - now < 24 * 60 * 60 * 1000) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    
    if (deadlineDate < now) {
      return 'Terminé';
    } else if (deadlineDate - now < 24 * 60 * 60 * 1000) {
      return 'Urgent';
    } else {
      return 'Actif';
    }
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Aucun devoir ou examen créé</div>
        <p className="text-gray-400 mt-2">Utilisez l'onglet "Créer" pour commencer</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Mes Devoirs & Examens ({assignments.length})
        </h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Actualiser
        </button>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {assignment.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                    {assignment.module}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded">
                    {assignment.type}
                  </span>
                  <span className={`px-2 py-1 text-sm rounded ${getStatusColor(assignment.deadline)}`}>
                    {getStatusText(assignment.deadline)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {assignment.description || 'Pas de description'}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Deadline: {formatDate(assignment.deadline)}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {assignment.submissions_count || 0} soumission(s)
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                {assignment.questions?.length || 0} question(s) • 
                Créé le {formatDate(assignment.created_at)}
              </div>
              
              <Link
                href={`/teacher/assignments/${assignment.id}`}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                Voir détails & soumissions
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}