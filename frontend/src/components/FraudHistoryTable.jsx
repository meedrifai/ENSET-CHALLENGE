'use client';

export default function FraudHistoryTable({ student }) {
  // Generate mock fraud history based on student's fraud count
  const generateFraudHistory = (student) => {
    if (!student || student.fraudCount === 0) return [];

    const fraudTypes = [
      'Off-screen Activity',
      'Left Frame',
      'Multiple Browser Tabs',
      'Suspicious Keystroke Pattern',
      'Extended Idle Time',
      'Copy-Paste Detected',
      'Unusual Writing Speed',
      'Browser Extension Blocked'
    ];

    const resolutions = [
      'Warning Issued',
      'Exam Retake Required',
      'Reported to Faculty',
      'Academic Probation',
      'Case Under Review',
      'Dismissed - False Positive'
    ];

    const exams = [
      'Midterm Exam - CS101',
      'Final Project - ENG201',
      'Quiz 3 - MATH150',
      'Assignment 2 - HIST105',
      'Lab Report - CHEM110'
    ];

    const history = [];
    for (let i = 0; i < student.fraudCount; i++) {
      const daysAgo = Math.floor(Math.random() * 90) + 1;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      history.push({
        id: i + 1,
        attemptNumber: i + 1,
        timestamp: date.toISOString(),
        exam: exams[Math.floor(Math.random() * exams.length)],
        type: fraudTypes[Math.floor(Math.random() * fraudTypes.length)],
        resolution: resolutions[Math.floor(Math.random() * resolutions.length)],
        severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        details: 'Automated detection flagged unusual behavior pattern during examination period.'
      });
    }

    return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const fraudHistory = generateFraudHistory(student);

  const getSeverityBadge = (severity) => {
    const classes = {
      'Low': 'bg-yellow-100 text-yellow-800',
      'Medium': 'bg-orange-100 text-orange-800',
      'High': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[severity]}`}>
        {severity}
      </span>
    );
  };

  const getResolutionBadge = (resolution) => {
    if (resolution.includes('Warning')) {
      return <span className="text-yellow-600 text-xs font-medium">⚠️ {resolution}</span>;
    }
    if (resolution.includes('Retake')) {
      return <span className="text-orange-600 text-xs font-medium">🔄 {resolution}</span>;
    }
    if (resolution.includes('Reported')) {
      return <span className="text-red-600 text-xs font-medium">🚨 {resolution}</span>;
    }
    if (resolution.includes('Dismissed')) {
      return <span className="text-green-600 text-xs font-medium">✅ {resolution}</span>;
    }
    return <span className="text-blue-600 text-xs font-medium">📋 {resolution}</span>;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Fraud History</h3>
            <p className="text-sm text-gray-600">
              {fraudHistory.length} total incidents detected
            </p>
          </div>
          {fraudHistory.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm text-red-600 font-medium">Incidents Logged</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {fraudHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🛡️</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Fraud Incidents</h4>
            <p className="text-gray-600">This student has a clean academic integrity record.</p>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✅ Good Standing
              </span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">
                    Attempt #
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">
                    Exam/Assignment
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">
                    Violation Type
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">
                    Severity
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">
                    Resolution
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fraudHistory.map((incident) => {
                  const timeData = formatTimestamp(incident.timestamp);
                  return (
                    <tr key={incident.id} className="hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-medium text-sm">
                              {incident.attemptNumber}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{timeData.date}</div>
                          <div className="text-gray-500">{timeData.time}</div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="text-sm font-medium text-gray-900">
                          {incident.exam}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="text-sm text-gray-900">{incident.type}</div>
                      </td>
                      <td className="py-4 px-2">
                        {getSeverityBadge(incident.severity)}
                      </td>
                      <td className="py-4 px-2">
                        {getResolutionBadge(incident.resolution)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {fraudHistory.filter(f => f.severity === 'High').length}
                  </div>
                  <div className="text-sm text-red-700">High Severity</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {fraudHistory.filter(f => f.resolution.includes('Retake')).length}
                  </div>
                  <div className="text-sm text-orange-700">Retakes Required</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {fraudHistory.filter(f => f.resolution.includes('Warning')).length}
                  </div>
                  <div className="text-sm text-yellow-700">Warnings Issued</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}