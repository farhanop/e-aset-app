// frontend/src/components/AssetDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTheme } from '../contexts/ThemeContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Interface untuk data aset
interface AssetDetail {
  id_aset: number;
  kode_aset: string;
  id_item: number;
  id_lokasi: number;
  id_unit_kerja: number;
  id_group: number | null;
  merk: string;
  tipe_model: string;
  spesifikasi: string;
  tgl_perolehan: string;
  sumber_dana: string;
  nomor_urut: number;
  status_aset: string;
  kondisi_terakhir: string | null;
  file_qrcode: string | null;
  file_pengadaan: string | null;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by: string | null;
  // Data relasi
  item?: {
    id_item: number;
    nama_item: string;
    kategori?: {
      id_kategori: number;
      nama_kategori: string;
    };
  };
  lokasi?: {
    id_lokasi: number;
    kode_ruangan: string;
    nama_ruangan: string;
    lantai: number;
    gedung?: {
      id_gedung: number;
      kode_gedung: string;
      nama_gedung: string;
    };
  };
  unitKerja?: {
    id_unit_kerja: number;
    kode_unit: string;
    nama_unit: string;
    unitUtama?: {
      id_unit_utama: number;
      kode_unit_utama: string;
      nama_unit_utama: string;
    };
  };
}

export function AssetDetailPage() {
  const { theme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching asset with ID: ${id}`);
        const response = await api.get(`/assets/${id}`);
        console.log('Response data:', response.data);
        setAsset(response.data);
      } catch (err: any) {
        console.error('Gagal mengambil detail aset:', err);
        
        if (err.response?.status === 404) {
          setError('Aset tidak ditemukan');
        } else if (err.response?.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
        } else {
          setError(`Gagal memuat data aset: ${err.message || 'Silakan coba lagi nanti.'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAssetDetail();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!asset || !window.confirm('Apakah Anda yakin ingin menghapus aset ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      console.log(`Deleting asset with ID: ${asset.id_aset}`);
      await api.delete(`/assets/${asset.id_aset}`);
      alert('Aset berhasil dihapus');
      navigate('/assets');
    } catch (err: any) {
      console.error('Gagal menghapus aset:', err);
      
      let errorMessage = 'Gagal menghapus aset.';
      
      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Tidak dapat menghapus aset ini.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Aset tidak ditemukan.';
      }
      
      alert(errorMessage);
    }
  };

  const handlePrintQR = () => {
    if (!asset) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Tentukan URL untuk QR Code - ambil dari database jika ada
    const qrCodeUrl = asset.file_qrcode 
      ? `${window.location.origin}${asset.file_qrcode}` 
      : null;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kode Aset - ${asset.kode_aset}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background-color: white; text-align: center; }
          h1 { color: #333; }
          .asset-info { margin: 20px 0; }
          .qr-container { width: 200px; height: 200px; margin: 20px auto; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; }
          .qr-placeholder { width: 100%; height: 100%; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 14px; }
          .qr-image { max-width: 100%; max-height: 100%; }
          table { width: 100%; max-width: 400px; margin: 20px auto; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Kode Aset</h1>
        <div class="asset-info">
          <table>
            <tr>
              <th>Kode Aset</th>
              <td>${asset.kode_aset}</td>
            </tr>
            <tr>
              <th>Nama Barang</th>
              <td>${asset.item?.nama_item || 'N/A'}</td>
            </tr>
            <tr>
              <th>Merk</th>
              <td>${asset.merk}</td>
            </tr>
            <tr>
              <th>Tipe/Model</th>
              <td>${asset.tipe_model}</td>
            </tr>
            <tr>
              <th>Lokasi</th>
              <td>${asset.lokasi?.nama_ruangan || 'N/A'}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>${asset.status_aset}</td>
            </tr>
          </table>
        </div>
        <div class="qr-container">
          ${qrCodeUrl 
            ? `<img src="${qrCodeUrl}" alt="QR Code untuk ${asset.kode_aset}" class="qr-image" />` 
            : `<div class="qr-placeholder">QR Code untuk ${asset.kode_aset}</div>`
          }
        </div>
        <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        <div style="margin-top: 20px;">
          <button onclick="window.print()">Cetak</button>
          <button onclick="window.close()">Tutup</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg shadow-md ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="mb-6">
          <Skeleton height={30} width={200} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Skeleton height={20} width={100} className="mb-2" />
            <Skeleton height={30} className="mb-4" />
            
            <Skeleton height={20} width={100} className="mb-2" />
            <Skeleton height={30} className="mb-4" />
            
            <Skeleton height={20} width={100} className="mb-2" />
            <Skeleton height={30} className="mb-4" />
          </div>
          <div>
            <Skeleton height={20} width={100} className="mb-2" />
            <Skeleton height={30} className="mb-4" />
            
            <Skeleton height={20} width={100} className="mb-2" />
            <Skeleton height={30} className="mb-4" />
            
            <Skeleton height={20} width={100} className="mb-2" />
            <Skeleton height={30} className="mb-4" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-lg shadow-md ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <div className={`p-4 mb-4 rounded-md ${
          theme === "dark" ? "bg-red-900/20" : "bg-red-50"
        }`}>
          <p className="text-red-500">{error}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 rounded-md ${
              theme === "dark" 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            Coba Lagi
          </button>
          <Link
            to="/assets"
            className={`px-4 py-2 rounded-md ${
              theme === "dark" 
                ? "bg-gray-700 hover:bg-gray-600" 
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Kembali ke Daftar Aset
          </Link>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className={`p-6 rounded-lg shadow-md ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <p>Data aset tidak tersedia</p>
        <Link
          to="/assets"
          className={`mt-4 inline-block px-4 py-2 rounded-md ${
            theme === "dark" 
              ? "bg-blue-600 hover:bg-blue-700" 
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          Kembali ke Daftar Aset
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}>
          Detail Aset
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handlePrintQR}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors duration-200 dark:bg-green-700 dark:hover:bg-green-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak QR Code
          </button>
          <Link
            to={`/assets/${asset.id_aset}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors duration-200 dark:bg-red-700 dark:hover:bg-red-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${
        theme === "dark" ? "text-gray-300" : "text-gray-700"
      }`}>
        {/* Card Informasi Utama */}
        <div className={`lg:col-span-2 rounded-lg shadow-md p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}>
            Informasi Aset
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Kode Aset
              </p>
              <p className={`text-lg font-semibold ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`}>
                {asset.kode_aset}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Nama Barang
              </p>
              <p className="text-base">
                {asset.item?.nama_item || 'N/A'}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Merk
              </p>
              <p className="text-base">
                {asset.merk}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Tipe/Model
              </p>
              <p className="text-base">
                {asset.tipe_model}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Kategori
              </p>
              <p className="text-base">
                {asset.item?.kategori?.nama_kategori || 'N/A'}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Tanggal Perolehan
              </p>
              <p className="text-base">
                {new Date(asset.tgl_perolehan).toLocaleDateString('id-ID')}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Sumber Dana
              </p>
              <p className="text-base">
                {asset.sumber_dana}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Nomor Urut
              </p>
              <p className="text-base">
                {asset.nomor_urut}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              Spesifikasi
            </p>
            <p className="text-base">
              {asset.spesifikasi || '-'}
            </p>
          </div>
        </div>

        {/* Card Status dan Kondisi */}
        <div className={`rounded-lg shadow-md p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}>
            Status & Kondisi
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Status Aset
              </p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                asset.status_aset === 'Tersedia' 
                  ? theme === "dark" 
                    ? "bg-green-800 text-green-100" 
                    : "bg-green-100 text-green-800"
                  : asset.status_aset === 'Dipinjam'
                  ? theme === "dark" 
                    ? "bg-yellow-800 text-yellow-100" 
                    : "bg-yellow-100 text-yellow-800"
                  : theme === "dark" 
                    ? "bg-red-800 text-red-100" 
                    : "bg-red-100 text-red-800"
              }`}>
                {asset.status_aset}
              </span>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Kondisi Terakhir
              </p>
              <p className="text-base">
                {asset.kondisi_terakhir || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Card Lokasi */}
        <div className={`lg:col-span-2 rounded-lg shadow-md p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}>
            Lokasi Aset
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Ruangan
              </p>
              <p className="text-base">
                {asset.lokasi?.nama_ruangan || 'N/A'}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Kode Ruangan
              </p>
              <p className="text-base">
                {asset.lokasi?.kode_ruangan || 'N/A'}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Lantai
              </p>
              <p className="text-base">
                {asset.lokasi?.lantai || '-'}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Gedung
              </p>
              <p className="text-base">
                {asset.lokasi?.gedung?.nama_gedung || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Card Unit Kerja */}
        <div className={`rounded-lg shadow-md p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}>
            Unit Kerja
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Unit Kerja
              </p>
              <p className="text-base">
                {asset.unitKerja?.nama_unit || 'N/A'}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Kode Unit
              </p>
              <p className="text-base">
                {asset.unitKerja?.kode_unit || 'N/A'}
              </p>
            </div>
            
            <div>
              <p className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Unit Utama
              </p>
              <p className="text-base">
                {asset.unitKerja?.unitUtama?.nama_unit_utama || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Card Dokumen */}
        <div className={`lg:col-span-3 rounded-lg shadow-md p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}>
            Dokumen Terkait
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className={`text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                QR Code
              </p>
              {asset.file_qrcode ? (
                <div className="flex items-center">
                  <button
                    onClick={handlePrintQR}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      theme === "dark" 
                        ? "bg-blue-700 hover:bg-blue-600" 
                        : "bg-blue-100 hover:bg-blue-200"
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Lihat QR Code
                  </button>
                </div>
              ) : (
                <p className="text-sm italic">Belum ada QR Code</p>
              )}
            </div>
            
            <div>
              <p className={`text-sm font-medium mb-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                Dokumen Pengadaan
              </p>
              {asset.file_pengadaan ? (
                <a
                  href={asset.file_pengadaan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-md inline-flex items-center ${
                    theme === "dark" 
                      ? "bg-blue-700 hover:bg-blue-600" 
                      : "bg-blue-100 hover:bg-blue-200"
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Lihat Dokumen
                </a>
              ) : (
                <p className="text-sm italic">Belum ada dokumen pengadaan</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          to="/assets"
          className={`px-4 py-2 rounded-md inline-flex items-center ${
            theme === "dark" 
              ? "bg-gray-700 hover:bg-gray-600" 
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Daftar Aset
        </Link>
      </div>
    </div>
  );
}