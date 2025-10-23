// src/components/AssetDetailPage.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTheme } from '../contexts/ThemeContext';
import QRCodeDisplay from './qr/QRCodeDisplay';
import { generateQRPrintHTML } from './qr/QRPrintTemplate';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Modal } from '../components/Modal';

// Interface untuk data aset - diperbaiki sesuai dengan database
interface AssetDetail {
  id_aset: number;
  kode_aset: string;
  id_item: number;
  id_lokasi: number;
  id_unit_kerja: number;
  id_group: number | null;
  merk: string | null;
  foto_barang?: string | null;
  foto_barang_mime?: string | null;
  file_qrcode?: string | null;
  item?: any;
  lokasi?: any;
  unitKerja?: any;
  group?: any;
  tipe_model?: string | null;
  tgl_perolehan?: string | null;
  sumber_dana?: string | null;
  nomor_urut?: string | null;
  spesifikasi?: string | null;
  status_aset?: string;
  kondisi_terakhir?: string | null;
}

// Minimal AssetData shape used by QRCodeDisplay/print
interface AssetData {
  id_aset: number;
  kode_aset: string;
  merk?: string;
  tipe_model?: string;
  file_qrcode?: string | null;
}

// Custom hook to fetch asset detail
function useAssetDetail(id?: string | null) {
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssetDetail = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const resp = await api.get(`/assets/${id}`);
        const assetData: AssetDetail = resp.data;
        setAsset(assetData);
        setError(null);
      } catch (err: any) {
        console.error('Gagal mengambil detail aset:', err);
        if (err.response?.status === 404) {
          setError('Aset tidak ditemukan');
        } else if (err.response?.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
        } else {
          setError(`Gagal memuat data aset: ${err.message || 'Silakan coba lagi nanti.'}`);
        }
        setAsset(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetail();
  }, [id]);

  return { asset, loading, error };
}

// Helper function untuk format tanggal
const formatDate = (dateString?: string | null, locale = 'id-ID') => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (err) {
    console.error('Error formatting date:', err);
    return dateString;
  }
};

// Helper function untuk mendapatkan kelas tema
const getThemeClass = (theme: string, darkClass: string, lightClass: string) => {
  return theme === "dark" ? darkClass : lightClass;
};

// Helper function untuk mendapatkan warna status - diperbaiki sesuai enum di database
const getStatusColor = (status: string | undefined, theme: string) => {
  const statusColors: Record<string, { dark: string; light: string }> = {
    'Tersedia': {
      dark: "bg-green-800 text-green-100",
      light: "bg-green-100 text-green-800"
    },
    'Dipinjam': {
      dark: "bg-yellow-800 text-yellow-100",
      light: "bg-yellow-100 text-yellow-800"
    },
    'Dalam Perbaikan': {
      dark: "bg-blue-800 text-blue-100",
      light: "bg-blue-100 text-blue-800"
    },
    'Rusak': {
      dark: "bg-red-800 text-red-100",
      light: "bg-red-100 text-red-800"
    },
    'Hilang': {
      dark: "bg-purple-800 text-purple-100",
      light: "bg-purple-100 text-purple-800"
    },
    'Dihapuskan': {
      dark: "bg-gray-800 text-gray-100",
      light: "bg-gray-100 text-gray-800"
    }
    ,
    'Default': {
      dark: "bg-gray-700 text-gray-100",
      light: "bg-gray-100 text-gray-700"
    }
  };
  
  const key = status && statusColors[status] ? status : 'Default';
  return (statusColors[key])[theme === "dark" ? 'dark' : 'light'];
};

// Komponen untuk informasi utama aset
function AssetMainInfo({ asset, theme }: { asset: AssetDetail; theme: string }) {
  return (
    <div className={`rounded-lg shadow-md p-6 ${getThemeClass(theme, "bg-gray-800", "bg-white")}`}>
      <h2 className={`text-xl font-semibold mb-4 ${getThemeClass(theme, "text-white", "text-gray-800")}`}>
        Informasi Aset
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Kode Aset
          </p>
          <p className={`text-lg font-semibold ${getThemeClass(theme, "text-blue-400", "text-blue-600")}`}>
            {asset.kode_aset}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Nama Barang
          </p>
          <p className="text-base">
            {asset.item?.nama_item || 'N/A'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Merk
          </p>
          <p className="text-base">
            {asset.merk || '-'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Tipe/Model
          </p>
          <p className="text-base">
            {asset.tipe_model || '-'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Kategori
          </p>
          <p className="text-base">
            {asset.item?.kategori?.nama_kategori || 'N/A'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Tanggal Perolehan
          </p>
          <p className="text-base">
            {formatDate(asset.tgl_perolehan)}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Sumber Dana
          </p>
          <p className="text-base">
            {asset.sumber_dana || '-'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Nomor Urut
          </p>
          <p className="text-base">
            {asset.nomor_urut}
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
          Spesifikasi
        </p>
        <p className="text-base">
          {asset.spesifikasi || '-'}
        </p>
      </div>
    </div>
  );
}

// Komponen untuk status dan kondisi aset
function AssetStatus({ asset, theme }: { asset: AssetDetail; theme: string }) {
  const statusColor = useMemo(() => getStatusColor(asset.status_aset, theme), [asset.status_aset, theme]);
  
  return (
    <div className={`rounded-lg shadow-md p-6 ${getThemeClass(theme, "bg-gray-800", "bg-white")}`}>
      <h2 className={`text-xl font-semibold mb-4 ${getThemeClass(theme, "text-white", "text-gray-800")}`}>
        Status & Kondisi
      </h2>
      
      <div className="space-y-4">
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Status Aset
          </p>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColor}`}>
            {asset.status_aset}
          </span>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Kondisi Terakhir
          </p>
          <p className="text-base">
            {asset.kondisi_terakhir || '-'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Komponen untuk lokasi aset
function AssetLocation({ asset, theme }: { asset: AssetDetail; theme: string }) {
  return (
    <div className={`rounded-lg shadow-md p-6 ${getThemeClass(theme, "bg-gray-800", "bg-white")}`}>
      <h2 className={`text-xl font-semibold mb-4 ${getThemeClass(theme, "text-white", "text-gray-800")}`}>
        Lokasi Aset
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Ruangan
          </p>
          <p className="text-base">
            {asset.lokasi?.nama_ruangan || 'N/A'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Kode Ruangan
          </p>
          <p className="text-base">
            {asset.lokasi?.kode_ruangan || 'N/A'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Lantai
          </p>
          <p className="text-base">
            {asset.lokasi?.lantai || '-'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Gedung
          </p>
          <p className="text-base">
            {asset.lokasi?.gedung?.nama_gedung || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Komponen untuk unit kerja
function AssetUnitKerja({ asset, theme }: { asset: AssetDetail; theme: string }) {
  return (
    <div className={`rounded-lg shadow-md p-6 ${getThemeClass(theme, "bg-gray-800", "bg-white")}`}>
      <h2 className={`text-xl font-semibold mb-4 ${getThemeClass(theme, "text-white", "text-gray-800")}`}>
        Unit Kerja
      </h2>
      
      <div className="space-y-4">
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Unit Kerja
          </p>
          <p className="text-base">
            {asset.unitKerja?.nama_unit || 'N/A'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Kode Unit
          </p>
          <p className="text-base">
            {asset.unitKerja?.kode_unit || 'N/A'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Unit Utama
          </p>
          <p className="text-base">
            {asset.unitKerja?.unitUtama?.nama_unit_utama || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Komponen untuk informasi group aset (ditambahkan)
function AssetGroup({ asset, theme }: { asset: AssetDetail; theme: string }) {
  if (!asset.group) return null;
  
  return (
    <div className={`rounded-lg shadow-md p-6 ${getThemeClass(theme, "bg-gray-800", "bg-white")}`}>
      <h2 className={`text-xl font-semibold mb-4 ${getThemeClass(theme, "text-white", "text-gray-800")}`}>
        Group Aset
      </h2>
      
      <div className="space-y-4">
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Nama Group
          </p>
          <p className="text-base">
            {asset.group.nama_group || 'N/A'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Kode Group
          </p>
          <p className="text-base">
            {asset.group.kode_group || 'N/A'}
          </p>
        </div>
        
        <div>
          <p className={`text-sm font-medium ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Deskripsi
          </p>
          <p className="text-base">
            {asset.group.deskripsi || '-'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Komponen untuk dokumen dan media terkait - diperbaiki sesuai database
function AssetDocuments({ 
  asset, 
  theme, 
  onPrintQR,
  documentLoading,
  documentError,
  onViewDocument
}: { 
  asset: AssetDetail; 
  theme: string;
  onPrintQR: () => void;
  documentLoading: boolean;
  documentError: string | null;
  onViewDocument: (e: React.MouseEvent) => void;
}) {
  // Konversi AssetDetail ke AssetData untuk QRCodeDisplay
  const assetData: AssetData = {
    id_aset: asset.id_aset,
    kode_aset: asset.kode_aset,
    merk: asset.merk || '',
    tipe_model: asset.tipe_model || '',
    file_qrcode: asset.file_qrcode || ''
  };

  return (
    <div className={`rounded-lg shadow-md p-6 ${getThemeClass(theme, "bg-gray-800", "bg-white")}`}>
      <h2 className={`text-xl font-semibold mb-4 ${getThemeClass(theme, "text-white", "text-gray-800")}`}>
        Dokumen & Media Terkait
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className={`text-sm font-medium mb-2 ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            QR Code
          </p>
          {asset.file_qrcode ? (
            <div className="flex flex-col items-start">
              <QRCodeDisplay 
                asset={assetData} // Gunakan assetData yang sudah dikonversi
                size={120} 
                className="mb-3"
              />
              <button
                onClick={onPrintQR}
                className={`px-4 py-2 rounded-md flex items-center ${getThemeClass(theme, "bg-blue-700 hover:bg-blue-600", "bg-blue-100 hover:bg-blue-200")}`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak QR Code
              </button>
            </div>
          ) : (
            <p className="text-sm italic">Belum ada QR Code</p>
          )}
        </div>
        
        <div>
          <p className={`text-sm font-medium mb-2 ${getThemeClass(theme, "text-gray-400", "text-gray-500")}`}>
            Foto Barang
          </p>
          {asset.foto_barang ? (
            <>
              <button
                onClick={onViewDocument}
                disabled={documentLoading}
                className={`px-4 py-2 rounded-md inline-flex items-center ${
                  documentLoading 
                    ? "opacity-70 cursor-not-allowed" 
                    : getThemeClass(theme, "bg-blue-700 hover:bg-blue-600", "bg-blue-100 hover:bg-blue-200")
                }`}
              >
                {documentLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memuat...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Lihat Foto
                  </>
                )}
              </button>
              {documentError && (
                <p className="text-sm text-red-500 mt-2">{documentError}</p>
              )}
            </>
          ) : (
            <p className="text-sm italic">Belum ada foto barang</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen utama
export function AssetDetailPage() {
  const { theme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { asset, loading, error } = useAssetDetail(id);
  
  // State untuk print error
  const [printError, setPrintError] = useState<string | null>(null);
  
  // State untuk dokumen
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  
  // State untuk modal konfirmasi hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handler untuk print QR Code
  const handlePrintQR = useCallback(async () => {
    if (!asset) return;
    
    try {
      // Check if asset has QR code
      if (!asset.file_qrcode) {
        setPrintError('QR Code tidak tersedia untuk aset ini.');
        return;
      }
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setPrintError('Browser memblokir jendela popup. Silakan izinkan popup untuk fitur ini.');
        return;
      }
      
      // Check if backend URL is available
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (!backendUrl) {
        setPrintError('Konfigurasi backend tidak tersedia.');
        return;
      }
      
      const qrCodeUrl = `${backendUrl}${asset.file_qrcode}`;
      
      // Build object matching QRPrintTemplate's expected fields
      const assetForPrint = {
        kode_aset: asset.kode_aset,
        item: asset.item ? { nama_item: asset.item.nama_item } : undefined,
        merk: asset.merk || '',
        tipe_model: asset.tipe_model || '',
        lokasi: asset.lokasi ? { nama_ruangan: asset.lokasi.nama_ruangan } : undefined,
        status_aset: asset.status_aset,
        file_qrcode: asset.file_qrcode ?? null,
      };

      const printHTML = generateQRPrintHTML(assetForPrint as any, qrCodeUrl);
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      setPrintError(null);
    } catch (err) {
      console.error('Error opening print window:', err);
      setPrintError('Gagal membuka jendela cetak. Silakan coba lagi.');
    }
  }, [asset]);

  // Handler untuk melihat foto
  const handleViewDocument = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!asset?.foto_barang) return;
    
    setDocumentLoading(true);
    setDocumentError(null);
    
    try {
      const response = await fetch(asset.foto_barang);
      if (!response.ok) {
        throw new Error('Foto tidak dapat diakses');
      }
      
      // Buka foto di tab baru
      window.open(asset.foto_barang, '_blank');
    } catch (err) {
      console.error('Error accessing document:', err);
      setDocumentError('Gagal mengakses foto. Silakan coba lagi nanti.');
    } finally {
      setDocumentLoading(false);
    }
  }, [asset?.foto_barang]);

  // Handler untuk hapus aset
  const handleDelete = useCallback(async () => {
    if (!asset) return;
    
    setIsDeleting(true);
    
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
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }, [asset, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className={`p-6 rounded-lg shadow-md ${getThemeClass(theme, "bg-gray-800", "bg-white")}`}>
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

  // Error state
  if (error) {
    return (
      <div className={`p-6 rounded-lg shadow-md ${getThemeClass(theme, "bg-gray-800", "bg-white")}`}>
        <div className={`p-4 mb-4 rounded-md ${getThemeClass(theme, "bg-red-900/20", "bg-red-50")}`}>
          <p className="text-red-500">{error}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 rounded-md ${getThemeClass(theme, "bg-blue-600 hover:bg-blue-700", "bg-blue-500 hover:bg-blue-600")} text-white`}
          >
            Coba Lagi
          </button>
          <Link
            to="/assets"
            className={`px-4 py-2 rounded-md ${getThemeClass(theme, "bg-gray-700 hover:bg-gray-600", "bg-gray-200 hover:bg-gray-300")}`}
          >
            Kembali ke Daftar Aset
          </Link>
        </div>
      </div>
    );
  }

  // Asset not found
  if (!asset) {
    return (
      <div className={`p-6 rounded-lg shadow-md ${getThemeClass(theme, "bg-gray-800", "bg-white")}`}>
        <p>Data aset tidak tersedia</p>
        <Link
          to="/assets"
          className={`mt-4 inline-block px-4 py-2 rounded-md ${getThemeClass(theme, "bg-blue-600 hover:bg-blue-700", "bg-blue-500 hover:bg-blue-600")} text-white`}
        >
          Kembali ke Daftar Aset
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${getThemeClass(theme, "text-white", "text-gray-800")}`}>
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
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors duration-200 dark:bg-red-700 dark:hover:bg-red-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus
          </button>
        </div>
      </div>

      {printError && (
        <div className={`mb-6 p-4 rounded-md ${getThemeClass(theme, "bg-yellow-900/20", "bg-yellow-50")}`}>
          <div className="flex">
            <svg className={`w-5 h-5 mr-2 mt-0.5 ${getThemeClass(theme, "text-yellow-400", "text-yellow-500")}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className={`text-sm ${getThemeClass(theme, "text-yellow-400", "text-yellow-700")}`}>
              {printError}
            </p>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${getThemeClass(theme, "text-gray-300", "text-gray-700")}`}>
        <div className="lg:col-span-2">
          <AssetMainInfo asset={asset} theme={theme} />
        </div>
        
        <div>
          <AssetStatus asset={asset} theme={theme} />
        </div>
        
        <div className="lg:col-span-2">
          <AssetLocation asset={asset} theme={theme} />
        </div>
        
        <div>
          <AssetUnitKerja asset={asset} theme={theme} />
        </div>
        
        {asset.group && (
          <div className="lg:col-span-3">
            <AssetGroup asset={asset} theme={theme} />
          </div>
        )}
        
        <div className="lg:col-span-3">
          <AssetDocuments 
            asset={asset} 
            theme={theme}
            onPrintQR={handlePrintQR}
            documentLoading={documentLoading}
            documentError={documentError}
            onViewDocument={handleViewDocument}
          />
        </div>
      </div>

      <div className="mt-6">
        <Link
          to="/assets"
          className={`px-4 py-2 rounded-md inline-flex items-center ${getThemeClass(theme, "bg-gray-700 hover:bg-gray-600", "bg-gray-200 hover:bg-gray-300")}`}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Daftar Aset
        </Link>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Konfirmasi Hapus Aset"
        >
          <div className="p-4">
            <p className={`mb-6 ${getThemeClass(theme, "text-gray-300", "text-gray-700")}`}>
              Apakah Anda yakin ingin menghapus aset ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-md ${getThemeClass(theme, "bg-gray-700 hover:bg-gray-600", "bg-gray-200 hover:bg-gray-300")}`}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-md flex items-center ${
                  isDeleting 
                    ? "bg-red-400 cursor-not-allowed" 
                    : "bg-red-600 hover:bg-red-700"
                } text-white`}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menghapus...
                  </>
                ) : (
                  'Hapus Aset'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}