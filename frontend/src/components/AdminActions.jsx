'use client';

export default function AdminActions({ student }) {
  const handleResetSignature = () => {
    console.log('Reset Cognitive Signature for student:', student?.name || 'Unknown');
    console.log('Action: Resetting cognitive signature data...');
  };

  const handleRevokeAccess = () => {
    console.log('Revoke Exam Access for student:', student?.name || 'Unknown');
    console.log('Action: Revoking exam access permissions...');
  };

  const handleAddNote = () => {
    console.log('Add Note for student:', student?.name || 'Unknown');
    console.log('Action: Opening note dialog...');
  };

  const ActionButton = ({ onClick, icon, label, color = 'blue', variant = 'primary' }) => {
    const baseClasses = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const colorClasses = {
      blue: variant === 'primary' 
        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
        : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 focus:ring-blue-500',
      red: variant === 'primary'
        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
        : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus:ring-red-500',
      gray: variant === 'primary'
        ? 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 focus:ring-gray-500'
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${colorClasses[color]}`}
      >
        {icon && <span className="text-lg">{icon}</span>}
        {label}
      </button>
    );
  };

  if (!student) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Admin Actions</h3>
        <p className="text-sm text-gray-600">Manage student account and permissions</p>
      </div>

      {/* Actions */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Reset Cognitive Signature */}
          <div className="space-y-2">
            <ActionButton
              onClick={handleResetSignature}
              icon="🔄"
              label="Reset Signature"
              color="blue"
              variant="secondary"
            />
            <p className="text-xs text-gray-500">Clear and rebuild cognitive profile</p>
          </div>

          {/* Revoke Exam Access */}
          <div className="space-y-2">
            <ActionButton
              onClick={handleRevokeAccess}
              icon="🛑"
              label="Revoke Access"
              color="red"
              variant="secondary"
            />
            <p className="text-xs text-gray-500">Suspend exam taking privileges</p>
          </div>

          {/* Add Note */}
          <div className="space-y-2">
            <ActionButton
              onClick={handleAddNote}
              icon="🗒️"
              label="Add Note"
              color="gray"
              variant="secondary"
            />
            <p className="text-xs text-gray-500">Record administrative notes</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-red-400 text-xl">⚠️</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 mb-1">Danger Zone</h4>
                <p className="text-xs text-red-600 mb-3">
                  Irreversible actions that require careful consideration.
                </p>
                <ActionButton
                  onClick={() => {
                    console.log('Delete Student Account for:', student?.name || 'Unknown');
                    console.log('Action: Initiating account deletion process...');
                  }}
                  label="Delete Account"
                  color="red"
                  variant="primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action History */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Actions</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Last signature reset</span>
              <span className="text-gray-900">Never</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Access revoked</span>
              <span className="text-gray-900">Never</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Notes added</span>
              <span className="text-gray-900">2 total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}