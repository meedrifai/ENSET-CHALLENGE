'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AssignmentDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignmentDetails();
    fetchSubmissions();
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/assignments/${id}`);
      if (response.ok) {
        const data = await response.json();
        setAssignment(data);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`http://localhost:8000/assignments/${id}/submissions`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Devoir/Examen non trouvé</div>
          <Link href="/teacher/dashboard" className="text-blue-600 hover:text-blue-800">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/teacher/dashboard" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← Retour au tableau de bord
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                  {assignment.module}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">
                  {assignment.type}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Deadline</div>
              <div className="text-lg font-semibold">{formatDate(assignment.deadline)}</div>
              <div className="text-sm text-gray-500 mt-1">
                {submissions.length} soumission(s)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assignment Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Détails</h2>
              
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Description</div>
                  <div className="text-gray-600">
                    {assignment.description || 'Pas de description'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Questions</div>
                  <div className="text-gray-600">{assignment.questions?.length || 0} question(s)</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-700">Créé le</div>
                  <div className="text-gray-600">{formatDate(assignment.created_at)}</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Questions</h3>
                <div className="space-y-3">
                  {assignment.questions?.map((question, index) => (
                    <div key={index} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">Question {index + 1}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {question.type === 'open' ? 'Ouverte' : 'QCM'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">{question.question}</div>
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          Options: {question.options.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submissions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Soumissions ({submissions.length})</h2>
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Aucune soumission pour le moment
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {submission.student_name}
                          </h3>
                          <p className="text-sm text-gray-600">{submission.student_email}</p>
                          <p className="text-sm text-gray-500">
                            Soumis le {formatDate(submission.submitted_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          {submission.score !== null && (
                            <div className={`text-lg font-semibold ${getScoreColor(submission.score)}`}>
                              {submission.score}/100
                            </div>
                          )}
                          <button
                            onClick={() => window.open(`/student/${submission.student_id}`, '_blank')}
                            className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                          >
                            Voir profil étudiant
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Réponses:</h4>
                        <div className="space-y-2">
                          {submission.answers?.map((answer, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded">
                              <div className="text-xs text-gray-500 mb-1">
                                Question {index + 1}
                              </div>
                              <div className="text-sm text-gray-800">{answer}</div>
                            </div>
                          )) || (
                            <div className="text-sm text-gray-500">Pas de réponses enregistrées</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}