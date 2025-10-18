// src/pages/AssetsPage.tsx
import { useState, useEffect,} from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useTheme } from "../contexts/ThemeContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Modal } from "../components/Modal";

// Tipe data untuk Aset
interface Asset {
  id_aset: number;
  kode_aset: string;
  item: { nama_item: string };
  lokasi: { nama_ruangan: string };
  status_aset: string;
  kondisi_terakhir: string;
}

// --- KOMPONEN SKELETON LOADING ---
const TableSkeleton = () => (
  <div className={`p-6 rounded-lg shadow-md ${
    document.documentElement.classList.contains('dark') ? 'bg-gray-800' : 'bg-white'
  }`}>
    <Skeleton height={40} className="mb-4" />
    {Array(5)
      .fill(0)
      .map((_, index) => (
        <Skeleton key={index} height={35} className="mb-2" />
      ))}
  </div>
);

export function AssetsPage() {
  const { theme } = useTheme();
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterNamaBarang, setFilterNamaBarang] = useState('');
  const [filterLokasi, setFilterLokasi] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  // Fetch data lokasi untuk filter
  const [lokasiList, setLokasiList] = useState<string[]>([]);
  const [namaBarangList, setNamaBarangList] = useState<string[]>([]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/assets');
      console.log('Data aset yang diterima:', response.data);
      // Berikan tipe eksplisit untuk response data
      const assetsData = response.data as Asset[];
      setAllAssets(assetsData);
      
      // Extract unique values for filters dengan tipe yang jelas
      const uniqueLokasi = [...new Set(assetsData.map((asset: Asset) => asset.lokasi?.nama_ruangan || ''))] as string[];
      const uniqueNamaBarang = [...new Set(assetsData.map((asset: Asset) => asset.item?.nama_item || ''))] as string[];
      
      setLokasiList(uniqueLokasi);
      setNamaBarangList(uniqueNamaBarang);
    } catch (error) {
      console.error("Gagal mengambil data aset", error);
      alert('Gagal memuat data aset. Silakan refresh halaman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);
  
  // Efek untuk memfilter data
  useEffect(() => {
    let result = allAssets;
    
    // Filter berdasarkan search term
    if (searchTerm) {
      result = result.filter(asset =>
        (asset.kode_aset?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (asset.item?.nama_item?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (asset.lokasi?.nama_ruangan?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter berdasarkan nama barang
    if (filterNamaBarang) {
      result = result.filter(asset =>
        asset.item?.nama_item === filterNamaBarang
      );
    }
    
    // Filter berdasarkan lokasi
    if (filterLokasi) {
      result = result.filter(asset =>
        asset.lokasi?.nama_ruangan === filterLokasi
      );
    }
    
    setFilteredAssets(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, allAssets, filterNamaBarang, filterLokasi]);

  const handleRefresh = () => {
    fetchAssets();
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handlePrintQRCodes = () => {
    // Filter assets by selected group
    const assetsToPrint = filterNamaBarang 
      ? filteredAssets.filter(asset => asset.item?.nama_item === filterNamaBarang)
      : filteredAssets;
    
    if (assetsToPrint.length === 0) {
      alert('Tidak ada aset untuk dicetak');
      return;
    }
    
    setSelectedGroup(filterNamaBarang || 'Semua Aset');
    setShowPrintModal(true);
  };

  const handlePrintSingleQR = (asset: Asset) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kode Aset - ${asset.kode_aset}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background-color: white; text-align: center; }
          h1 { color: #333; }
          .asset-info { margin: 20px 0; }
          .qr-placeholder { width: 200px; height: 200px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 20px auto; font-size: 14px; border: 1px solid #ddd; }
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
              <th>Lokasi</th>
              <td>${asset.lokasi?.nama_ruangan || 'N/A'}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td>${asset.status_aset}</td>
            </tr>
            <tr>
              <th>Kondisi</th>
              <td>${asset.kondisi_terakhir || '-'}</td>
            </tr>
          </table>
        </div>
        <div class="qr-placeholder">
          QR Code untuk ${asset.kode_aset}
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

  const generatePrintContent = () => {
    // Create HTML content for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const tableRows = filteredAssets
      .filter(asset => !filterNamaBarang || asset.item?.nama_item === filterNamaBarang)
      .map(asset => `
        <tr>
          <td>${asset.kode_aset}</td>
          <td>${asset.item?.nama_item || 'N/A'}</td>
          <td>${asset.lokasi?.nama_ruangan || 'N/A'}</td>
        </tr>
      `).join('');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cetak Kode Aset - ${selectedGroup}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background-color: white; }
          h1 { text-align: center; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; color: #333; }
          th { background-color: #f2f2f2; }
          .qr-placeholder { width: 50px; height: 50px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 10px; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Kode Aset - ${selectedGroup}</h1>
        <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        <table>
          <thead>
            <tr>
              <th>Kode Aset</th>
              <th>Nama Barang</th>
              <th>Lokasi</th>
              <th>QR Code</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()">Cetak</button>
          <button onclick="window.close()">Tutup</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    
    try {
      await api.delete(`/assets/${assetToDelete.id_aset}`);
      // Update the local state to remove the deleted asset
      setAllAssets(prevAssets => prevAssets.filter(asset => asset.id_aset !== assetToDelete.id_aset));
      setShowDeleteModal(false);
      setAssetToDelete(null);
      
      // Show success message
      alert(`Aset ${assetToDelete.kode_aset} berhasil dihapus`);
    } catch (error: any) {
      console.error("Gagal menghapus aset", error);
      
      let errorMessage = "Gagal menghapus aset.";
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Tidak dapat menghapus aset ini.";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
      }
      
      alert(errorMessage);
    }
  };

  if (loading) return <TableSkeleton />;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}>
          Manajemen Aset
        </h1>
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
          <button 
            onClick={handlePrintQRCodes}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors duration-200 dark:bg-green-700 dark:hover:bg-green-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak QR Code
          </button>
          <Link 
            to="/assets/new" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Daftarkan Aset Baru
          </Link>
        </div>
      </div>

      {/* --- BAGIAN PENCARIAN & FILTER --- */}
      <div className={`mb-6 p-4 rounded-lg shadow-md ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan Kode Aset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 text-white" 
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <select
              value={filterNamaBarang}
              onChange={(e) => setFilterNamaBarang(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                theme === "dark" 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Semua Nama Barang</option>
              {namaBarangList.map((nama, index) => (
                <option key={index} value={nama}>{nama}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterLokasi}
              onChange={(e) => setFilterLokasi(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                theme === "dark" 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Semua Lokasi</option>
              {lokasiList.map((lokasi, index) => (
                <option key={index} value={lokasi}>{lokasi}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                theme === "dark" 
                  ? "bg-gray-700 border-gray-600 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value={10}>10 per halaman</option>
              <option value={25}>25 per halaman</option>
              <option value={50}>50 per halaman</option>
              <option value={100}>100 per halaman</option>
            </select>
            <span className={`text-sm ml-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              Menampilkan {filteredAssets.length} dari {allAssets.length} aset
            </span>
          </div>
        </div>
      </div>

      {searchTerm && (
        <div className={`mb-4 p-3 rounded-lg ${
          theme === "dark" ? "bg-gray-700" : "bg-blue-50"
        }`}>
          <p className={`text-sm ${
            theme === "dark" ? "text-gray-300" : "text-blue-700"
          }`}>
            Menampilkan {filteredAssets.length} dari {allAssets.length} data
            {searchTerm && ` untuk pencarian "${searchTerm}"`}
          </p>
        </div>
      )}

      <div className={`rounded-lg shadow-md overflow-hidden ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        {filteredAssets.length === 0 ? (
          <div className={`text-center p-12 rounded-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } shadow`}>
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className={`mt-2 text-sm font-medium ${
              theme === "dark" ? "text-gray-200" : "text-gray-900"
            }`}>
              {searchTerm || filterNamaBarang || filterLokasi ? "Aset tidak ditemukan" : "Belum ada aset terdaftar"}
            </h3>
            <p className={`mt-1 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
              {searchTerm || filterNamaBarang || filterLokasi ? "Coba gunakan filter lain" : "Mulai dengan mendaftarkan aset baru."}
            </p>
            <div className="mt-6">
              <Link
                to="/assets/new"
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  theme === "dark" 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-blue-500 hover:bg-blue-600"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Daftarkan Aset Baru
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Kode Aset
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Nama Barang
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Lokasi
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Kondisi
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}>
                  {currentItems.map((asset) => (
                    <tr 
                      key={asset.id_aset} 
                      className={`transition-colors ${
                        theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        <span className="font-mono text-blue-600">
                          {asset.kode_aset}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {asset.item?.nama_item || 'N/A'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}>
                        {asset.lokasi?.nama_ruangan || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}>
                        {asset.kondisi_terakhir || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                            to={`/assets/${asset.id_aset}`} 
                            className={`mr-3 ${
                              theme === "dark" ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-900"
                            }`}
                          >
                            Detail
                        </Link>
                        <button
                          onClick={() => handlePrintSingleQR(asset)}
                          className={`mr-3 ${
                            theme === "dark" ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-900"
                          }`}
                          title="Cetak QR Code"
                        >
                          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(asset)}
                          className={`${
                            theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"
                          }`}
                          title="Hapus Aset"
                        >
                          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`px-4 py-3 flex items-center justify-between border-t ${
                theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}>
                <div className={`text-sm ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Menampilkan {indexOfFirstItem + 1} hingga {Math.min(indexOfLastItem, filteredAssets.length)} dari {filteredAssets.length} hasil
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md transition-colors flex items-center ${
                      currentPage === 1
                        ? theme === "dark" 
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : theme === "dark" 
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    ← Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {(() => {
                      const pageNumbers = [];
                      const maxVisiblePages = 5;
                      
                      if (totalPages <= maxVisiblePages) {
                        // If there are fewer pages than the max visible, show all
                        for (let i = 1; i <= totalPages; i++) {
                          pageNumbers.push(i);
                        }
                      } else {
                        // Always include first page
                        pageNumbers.push(1);
                        
                        // If current page is near the start
                        if (currentPage <= 3) {
                          for (let i = 2; i <= 4; i++) {
                            pageNumbers.push(i);
                          }
                          pageNumbers.push('...');
                          pageNumbers.push(totalPages);
                        } 
                        // If current page is near the end
                        else if (currentPage >= totalPages - 2) {
                          pageNumbers.push('...');
                          for (let i = totalPages - 3; i <= totalPages; i++) {
                            pageNumbers.push(i);
                          }
                        } 
                        // If current page is in the middle
                        else {
                          pageNumbers.push('...');
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pageNumbers.push(i);
                          }
                          pageNumbers.push('...');
                          pageNumbers.push(totalPages);
                        }
                      }
                      
                      return pageNumbers.map((pageNum, index) => (
                        pageNum === '...' ? (
                          <span key={`ellipsis-${index}`} className={`px-2 py-1 ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum as number)}
                            className={`w-8 h-8 rounded-md transition-colors ${
                              currentPage === pageNum
                                ? "bg-blue-600 text-white"
                                : theme === "dark" 
                                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      ));
                    })()}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md transition-colors flex items-center ${
                      currentPage === totalPages
                        ? theme === "dark" 
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : theme === "dark" 
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <Modal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} title="Cetak Kode Aset">
          <div className="p-4">
            <p className={`mb-6 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}>
              Anda akan mencetak kode QR untuk {selectedGroup}. Lanjutkan?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPrintModal(false)}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  theme === "dark" 
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowPrintModal(false);
                  generatePrintContent();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Cetak
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && assetToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Konfirmasi Hapus">
          <div className="p-4">
            <p className={`mb-6 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}>
              Apakah Anda yakin ingin menghapus aset <strong>{assetToDelete.kode_aset}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  theme === "dark" 
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}