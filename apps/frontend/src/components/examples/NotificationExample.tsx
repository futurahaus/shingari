import React from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';

export const NotificationExample: React.FC = () => {
  const { showSuccess, showError, showInfo, showWarning } = useNotificationContext();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Notification System Example</h2>
      <p className="text-gray-600">Click the buttons below to test different notification types:</p>
      
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => showSuccess('Success!', 'This is a success notification', 3000)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Show Success
        </button>
        
        <button
          onClick={() => showError('Error!', 'This is an error notification', 5000)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Show Error
        </button>
        
        <button
          onClick={() => showInfo('Info!', 'This is an info notification')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Show Info (No Auto-dismiss)
        </button>
        
        <button
          onClick={() => showWarning('Warning!', 'This is a warning notification', 4000)}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Show Warning
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Usage Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Import <code>useNotificationContext</code> from <code>@/contexts/NotificationContext</code></li>
          <li>Use <code>showSuccess</code>, <code>showError</code>, <code>showInfo</code>, or <code>showWarning</code></li>
          <li>Each method takes: <code>(title, message, duration?)</code></li>
          <li>If duration is not provided, notification won&apos;t auto-dismiss</li>
          <li>Notifications can be positioned: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center</li>
        </ul>
      </div>
    </div>
  );
}; 