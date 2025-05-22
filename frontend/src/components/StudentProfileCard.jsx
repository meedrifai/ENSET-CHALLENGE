'use client';

export default function StudentProfileCard({ student }) {
  if (!student) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status) => {
    return status === 'Signature Complete' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {getInitials(student.fullName)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold">{student.fullName}</h2>
            <p className="text-blue-100">{student.email}</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(student.status)}`}>
              {student.status}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Student ID
              </label>
              <p className="text-sm font-mono bg-gray-50 px-3 py-2 rounded-md">
                {student.studentId}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Department
              </label>
              <p className="text-sm text-gray-900">{student.department}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Year of Entry
              </label>
              <p className="text-sm text-gray-900">{student.yearOfEntry}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Program
              </label>
              <p className="text-sm text-gray-900">{student.program}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Account Created
              </label>
              <p className="text-sm text-gray-900">
                {new Date(student.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Fraud Incidents
              </label>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  student.fraudCount === 0 
                    ? 'bg-green-100 text-green-800'
                    : student.fraudCount <= 2
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.fraudCount} incidents
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Profile completed on {student.createdAt}</span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Active</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}