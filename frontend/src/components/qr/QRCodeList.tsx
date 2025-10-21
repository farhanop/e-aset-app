// src/components/QRCodeList.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCode } from '../../types/qrCode';

const QRCodeList: React.FC = () => {
  const [qrcodes, setQrcodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const response = await axios.get<QRCode[]>(`${backendUrl}/assets/qrcodes`);
        setQrcodes(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching QR codes:', err);
        setError('Gagal memuat QR codes');
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, [backendUrl]);

  if (loading) return <div className="text-center py-8">Loading QR codes...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="qr-code-list container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Daftar QR Code</h2>
      {qrcodes.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Tidak ada QR code tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {qrcodes.map((qr, index) => (
            <div key={index} className="qr-item bg-white p-4 rounded-lg shadow-md">
              <img 
                src={`${backendUrl}${qr.url}`} 
                alt={`QR Code ${qr.filename}`}
                className="qr-code-image w-full h-auto"
              />
              <p className="text-sm text-gray-600 mt-2 truncate">{qr.filename}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QRCodeList;