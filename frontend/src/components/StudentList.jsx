'use client';

import { useState } from 'react';

export default function StudentList({ students = [] }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const viewStudentProfile = async (studentId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/student/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentProfile(data);
        setSelectedStudent(studentId);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSignatureStatus = (student) => {
    if (student.signature_status === 'completed') {
      return { text: 'Complète', color: 'bg-green-100 text-green-800' };
    } else if (student.signature_status === 'partial') {
      return { text: 'Partielle', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'Manquante', color: 'bg-red-100 text-red-800' };
    }
  };

  const getFraudAlerts = (student) => {
    return student.fraud_alerts || 0;
  };

  if (!Array.isArray(students)) {
    console.error("students is not an array:", students);
    return (
      <div className="text-center py-12 text-red-600">
        Erreur : les données des étudiants sont invalides.
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Aucun étudiant trouvé</div>
        <p className="text-gray-400 mt-2">Les étudiants apparaîtront ici une fois inscrits à vos modules</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Mes Étudiants ({students.length})
      </h2>

      <div className="grid gap-4">
        {students.map((student) => {
          const signatureStatus = getSignatureStatus(student);
          const fraudAlerts = getFraudAlerts(student);

          return (
            <div key={student.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {student.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {student.email}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {student.modules?.map((module) => (
                      <span key={module} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {module}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="flex flex-col gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${signatureStatus.color}`}>
                      Signature: {signatureStatus.text}
                    </span>
                    {fraudAlerts > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        ⚠️ {fraudAlerts} alerte(s)
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => viewStudentProfile(student.id)}
                    disabled={loading && selectedStudent === student.id}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading && selectedStudent === student.id ? 'Chargement...' : 'Voir profil'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Profile Modal */}
      {studentProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Profil de {studentProfile.name}</h3>
              <button
                onClick={() => {setStudentProfile(null); setSelectedStudent(null);}}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <strong>Email:</strong> {studentProfile.email}
              </div>
              
              <div>
                <strong>Modules:</strong> {studentProfile.modules?.join(', ') || 'Aucun'}
              </div>

              <div>
                <strong>Statut signature:</strong>
                <span className={`ml-2 px-2 py-1 text-xs rounded ${getSignatureStatus(studentProfile).color}`}>
                  {getSignatureStatus(studentProfile).text}
                </span>
              </div>

              {studentProfile.signature_data && (
                <div>
                  <strong>Données de signature:</strong>
                  <div className="bg-gray-50 p-3 rounded mt-2 text-sm">
                    <p>Score de complexité: {studentProfile.signature_data.complexity_score || 'N/A'}</p>
                    <p>Style d'écriture: {studentProfile.signature_data.writing_style || 'N/A'}</p>
                    <p>Vocabulaire moyen: {studentProfile.signature_data.vocabulary_level || 'N/A'}</p>
                  </div>
                </div>
              )}

              {getFraudAlerts(studentProfile) > 0 && (
                <div>
                  <strong>Alertes de fraude:</strong>
                  <div className="bg-red-50 p-3 rounded mt-2">
                    <p className="text-red-800">{getFraudAlerts(studentProfile)} alerte(s) détectée(s)</p>
                    <p className="text-sm text-red-600 mt-1">
                      Vérification recommandée des dernières soumissions
                    </p>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Inscrit le: {new Date(studentProfile.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
