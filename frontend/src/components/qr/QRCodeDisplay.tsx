// src/components/QRCodeDisplay.tsx
import React, { useState } from 'react';

interface QRCodeDisplayProps {
  asset: {
    id_aset: number;
    kode_aset: string;
    file_qrcode?: string | null;
  };
  size?: number;
  className?: string;
  showDownloadButton?: boolean;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  asset, 
  size = 150, 
  className = "",
  showDownloadButton = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  
  const handleDownload = async () => {
    if (!asset.file_qrcode || isDownloading) return;
    
    setIsDownloading(true);
    const imageUrl = `${backendUrl}${asset.file_qrcode}`;
    
    try {
      // Pendekatan 1: Coba download langsung dengan link
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `qrcode-${asset.kode_aset}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Tunggu sebentar lalu hapus link
      setTimeout(() => {
        document.body.removeChild(link);
        setIsDownloading(false);
      }, 100);
      
    } catch (error) {
      console.error('Download method 1 failed:', error);
      
      try {
        // Pendekatan 2: Gunakan fetch API
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode-${asset.kode_aset}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setIsDownloading(false);
        }, 100);
        
      } catch (error2) {
        console.error('Download method 2 failed:', error2);
        setIsDownloading(false);
        
        // Pendekatan 3: Buka di tab baru
        try {
          const newWindow = window.open(imageUrl, '_blank');
          if (newWindow) {
            alert('QR code dibuka di tab baru. Silakan simpan secara manual dengan klik kanan > Simpan gambar.');
          } else {
            alert('Browser memblokir popup. Silakan izinkan popup untuk fitur ini.');
          }
        } catch (error3) {
          console.error('Fallback failed:', error3);
          alert('Gagal mengunduh QR code. Silakan coba lagi atau gunakan browser lain.');
        }
      }
    }
  };

  const handleImageError = () => {
    console.error('Failed to load QR code image');
    setImageError(true);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {asset.file_qrcode && !imageError ? (
        <>
          <img 
            src={`${backendUrl}${asset.file_qrcode}`} 
            alt={`QR Code untuk ${asset.kode_aset}`}
            className="rounded-lg shadow-md"
            style={{ 
              width: `${size}px`, 
              height: `${size}px`,
              objectFit: 'contain',
              backgroundColor: 'white'
            }}
            onError={handleImageError}
          />
          {showDownloadButton && (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`absolute bottom-2 right-2 p-1.5 rounded-full shadow-md transition-colors duration-200 ${
                isDownloading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title={isDownloading ? 'Mengunduh...' : 'Download QR Code'}
            >
              {isDownloading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
            </button>
          )}
        </>
      ) : (
        <div 
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg"
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            backgroundColor: '#f9fafb'
          }}
        >
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span className="text-xs text-gray-500 text-center px-2">
            {imageError ? 'Gagal memuat QR Code' : 'QR Code tidak tersedia'}
          </span>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;