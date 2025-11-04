// components/development/DevAnnouncement.tsx
import React from 'react';
import { AlertTriangle, Clock, Code } from 'lucide-react';

interface DevAnnouncementProps {
  moduleName: string;
  releaseDate?: string;
  version?: string;
  issues?: string[];
}

const DevAnnouncement: React.FC<DevAnnouncementProps> = ({ 
  moduleName, 
  releaseDate = 'Soon',
  version = '0.1.0',
  issues = []
}) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">
              Modul {moduleName} dalam Pengembangan
            </h3>
          </div>
          <p className="text-yellow-700 text-sm mb-2">
            Fitur ini masih dalam tahap pengembangan aktif. Beberapa fungsi mungkin belum berjalan optimal.
          </p>
          
          {issues.length > 0 && (
            <div className="mt-3">
              <p className="text-yellow-700 text-sm font-medium mb-1">Known Issues:</p>
              <ul className="text-yellow-600 text-sm list-disc list-inside space-y-1">
                {issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-xs text-yellow-600 mt-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Estimasi rilis: {releaseDate}</span>
            </div>
            <span className="px-2 py-1 bg-yellow-100 rounded-full">v{version}</span>
            <span className="px-2 py-1 bg-yellow-100 rounded-full">Development Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevAnnouncement;