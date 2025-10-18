// src/components/layout/DashboardSkeleton.tsx

import React from 'react';

// Komponen untuk satu kartu statistik skeleton
const StatCardSkeleton: React.FC = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-3/4 mb-3"></div>
    <div className="h-8 bg-gray-400 dark:bg-gray-700 rounded-md w-1/2"></div>
  </div>
);

// Komponen utama untuk kerangka seluruh dashboard
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Skeleton untuk Header/Judul */}
      <div className="mb-6">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded-md w-1/3"></div>
      </div>

      {/* Skeleton untuk Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Skeleton untuk Konten Utama (misal: Grafik atau Tabel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom utama yang lebih besar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        </div>

        {/* Kolom samping yang lebih kecil */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-5/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-md w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};