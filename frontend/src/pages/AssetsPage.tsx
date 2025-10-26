import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useTheme } from "../contexts/ThemeContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Modal } from "../components/Modal";
import {
  generateQRCardHTML,
  QR_CARD_STYLE,
} from "../components/qr/QRPrintTemplate";

// Tipe data untuk Aset sesuai dengan struktur backend
interface Asset {
  id_aset: number;
  kode_aset: string;
  nomor_urut: number;
  file_qrcode: string;
  foto_barang: string;
  file_dokumen: string;
  merk: string;
  tipe_model: string;
  spesifikasi: string;
  tgl_perolehan: string;
  sumber_dana: string;
  status_aset: string;
  kondisi_terakhir: string;
  item: {
    id_item: number;
    nama_item: string;
    kode_item: string;
    metode_pelacakan: string;
    umur_ekonomis: number;
    kategori?: {
      id_kategori: number;
      nama_kategori: string;
      kode_kategori: string;
    };
  };
  lokasi: {
    id_lokasi: number;
    nama_ruangan: string;
    kode_ruangan: string;
    lantai: number;
    gedung: {
      id_gedung: number;
      nama_gedung: string;
      kode_gedung: string;
      kampus: {
        id_kampus: number;
        nama_kampus: string;
        kode_kampus: string;
      };
    };
  };
  unitKerja: {
    id_unit_kerja: number;
    nama_unit: string;
    kode_unit: string;
    unitUtama: {
      id_unit_utama: number;
      nama_unit_utama: string;
      kode_unit_utama: string;
    };
  };
  group?: {
    id_group: number;
    nama_group: string;
    kode_group: string;
  };
}

// --- KOMPONEN SKELETON LOADING ---
const TableSkeleton = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`p-6 rounded-xl shadow-lg ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <Skeleton
          height={40}
          width={200}
          baseColor={theme === "dark" ? "#374151" : "#f3f4f6"}
          highlightColor={theme === "dark" ? "#4b5563" : "#e5e7eb"}
        />
        <Skeleton
          height={40}
          width={120}
          baseColor={theme === "dark" ? "#374151" : "#f3f4f6"}
          highlightColor={theme === "dark" ? "#4b5563" : "#e5e7eb"}
        />
      </div>
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="mb-3">
            <Skeleton
              height={60}
              className="rounded-lg"
              baseColor={theme === "dark" ? "#374151" : "#f3f4f6"}
              highlightColor={theme === "dark" ? "#4b5563" : "#e5e7eb"}
            />
          </div>
        ))}
    </div>
  );
};

export function AssetsPage() {
  const { theme } = useTheme();
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterNamaBarang, setFilterNamaBarang] = useState("");
  const [filterLokasi, setFilterLokasi] = useState("");
  const [filterKampus, setFilterKampus] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  // Fetch data untuk filter
  const [lokasiList, setLokasiList] = useState<string[]>([]);
  const [namaBarangList, setNamaBarangList] = useState<string[]>([]);
  const [kampusList, setKampusList] = useState<string[]>([]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/assets");
      console.log("Data aset yang diterima:", response.data);

      const assetsData = response.data as Asset[];
      setAllAssets(assetsData);

      // Extract unique values for filters
      const uniqueLokasi = [
        ...new Set(
          assetsData.map((asset: Asset) => asset.lokasi?.nama_ruangan || "")
        ),
      ].filter(Boolean) as string[];

      const uniqueNamaBarang = [
        ...new Set(
          assetsData.map((asset: Asset) => asset.item?.nama_item || "")
        ),
      ].filter(Boolean) as string[];

      const uniqueKampus = [
        ...new Set(
          assetsData.map(
            (asset: Asset) => asset.lokasi?.gedung?.kampus?.nama_kampus || ""
          )
        ),
      ].filter(Boolean) as string[];

      setLokasiList(uniqueLokasi);
      setNamaBarangList(uniqueNamaBarang);
      setKampusList(uniqueKampus);
    } catch (error) {
      console.error("Gagal mengambil data aset", error);
      alert("Gagal memuat data aset. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch assets on mount
  useEffect(() => {
    fetchAssets();
  }, []);

  // Efek untuk memfilter data
  useEffect(() => {
    let result = allAssets;

    // Filter berdasarkan search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (asset) =>
          (asset.kode_aset?.toLowerCase() || "").includes(lowerSearchTerm) ||
          (asset.item?.nama_item?.toLowerCase() || "").includes(
            lowerSearchTerm
          ) ||
          (asset.lokasi?.nama_ruangan?.toLowerCase() || "").includes(
            lowerSearchTerm
          ) ||
          (asset.lokasi?.gedung?.nama_gedung?.toLowerCase() || "").includes(
            lowerSearchTerm
          ) ||
          (
            asset.lokasi?.gedung?.kampus?.nama_kampus?.toLowerCase() || ""
          ).includes(lowerSearchTerm) ||
          (asset.unitKerja?.nama_unit?.toLowerCase() || "").includes(
            lowerSearchTerm
          ) ||
          (asset.merk?.toLowerCase() || "").includes(lowerSearchTerm)
      );
    }

    // Filter berdasarkan nama barang
    if (filterNamaBarang) {
      result = result.filter(
        (asset) => asset.item?.nama_item === filterNamaBarang
      );
    }

    // Filter berdasarkan lokasi (ruangan)
    if (filterLokasi) {
      result = result.filter(
        (asset) => asset.lokasi?.nama_ruangan === filterLokasi
      );
    }

    // Filter berdasarkan kampus
    if (filterKampus) {
      result = result.filter(
        (asset) => asset.lokasi?.gedung?.kampus?.nama_kampus === filterKampus
      );
    }

    setFilteredAssets(result);
    setCurrentPage(1);
  }, [searchTerm, allAssets, filterNamaBarang, filterLokasi, filterKampus]);

  const handleRefresh = () => {
    fetchAssets();
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;

    try {
      await api.delete(`/assets/${assetToDelete.id_aset}`);
      // Update the local state to remove the deleted asset
      setAllAssets((prevAssets) =>
        prevAssets.filter((asset) => asset.id_aset !== assetToDelete.id_aset)
      );
      setShowDeleteModal(false);
      setAssetToDelete(null);

      // Show success message
      alert(`Aset ${assetToDelete.kode_aset} berhasil dihapus`);
    } catch (error: any) {
      console.error("Gagal menghapus aset", error);

      let errorMessage = "Gagal menghapus aset.";

      if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message || "Tidak dapat menghapus aset ini.";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
      }

      alert(errorMessage);
    }
  };

  // Selection helpers
  const toggleItem = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const toggleAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
      return;
    }

    // Select all filtered assets (not just current page)
    const allIds = filteredAssets.map((a) => a.id_aset);
    setSelectedIds(allIds);
    setSelectAll(true);
  };

  const chunk = <T,>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  // Build simple printable HTML for a page of assets using a compact QR card layout
  const buildPrintWindowForPages = (pages: Asset[][]) => {
    const win = window.open("", "_blank");
    if (!win) return;

    const pageHtml = pages
      .map((page) => {
        const cards = page
          .map((asset) => {
            // prefer file_qrcode if present, otherwise card will render a placeholder
            const cardInner = generateQRCardHTML(
              asset as any,
              (asset as any).file_qrcode || null
            );
            return `<div class="asset-card">${cardInner}</div>`;
          })
          .join("\n");

        return `<div class="page">${cards}</div>`;
      })
      .join("\n");

    // Basic styles to arrange asset cards per page
    const doc = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Cetak QR</title>
        <style>
          ${QR_CARD_STYLE}
          /* layout helpers for multi-card pages */
          body{margin:6mm;background:white}
          .page{display:flex;flex-wrap:wrap;gap:6mm;page-break-after:always}
          .asset-card{width:90mm;height:50mm;box-sizing:border-box}
          @media print{ .page{page-break-after:always} .no-print{display:none} }
        </style>
        <!-- QR runtime: QRious to generate QR images for assets without file_qrcode -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>
      </head>
      <body>
        ${pageHtml}
        <div class="no-print" style="text-align:center;margin-top:8px">
          <button onclick="window.print()">Cetak</button>
          <button onclick="window.close()">Tutup</button>
        </div>
        <script>
          // For every placeholder QR element, generate QR from the nearby code text
          (function(){
            try {
              document.querySelectorAll('.qr-placeholder').forEach(function(el){
                // find nearby kode_aset text
                var parent = el.closest('.container');
                if (!parent) return;
                var codeEl = parent.querySelector('.qr-code-text');
                var code = codeEl ? codeEl.textContent.trim() : null;
                if (!code) return;

                var canvas = document.createElement('canvas');
                var qr = new QRious({
                  element: canvas,
                  value: code,
                  size: 180
                });
                var img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                el.replaceWith(img);
              });
            } catch (e) {
              console.warn('QR generation failed', e);
            }
          })();
        </script>
      </body>
      </html>
    `;

    win.document.write(doc);
    win.document.close();
  };

  // When in selectMode, print selected assets grouped by 5 per page
  const handlePrintSelected = () => {
    if (selectedIds.length === 0) {
      alert("Pilih minimal 1 aset untuk dicetak");
      return;
    }

    const selectedAssets = allAssets.filter((a) =>
      selectedIds.includes(a.id_aset)
    );
    const pages = chunk(selectedAssets, 5);
    buildPrintWindowForPages(pages);
  };

  if (loading) return <TableSkeleton />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1
          className={`text-3xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Manajemen Aset
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow hover:bg-blue-700 transition-all duration-200 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Data
          </button>

          {selectMode && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-blue-300" : "text-blue-700"
                }`}
              >
                {selectedIds.length} terpilih
              </span>
              <button
                onClick={() => {
                  setSelectedIds([]);
                  setSelectAll(false);
                }}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                title="Hapus Pilihan"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          <button
            onClick={() => setSelectMode((prev) => !prev)}
            className={`${
              selectMode
                ? "bg-yellow-500 dark:bg-yellow-600"
                : "bg-gray-200 dark:bg-gray-700"
            } text-white px-4 py-3 rounded-xl shadow hover:opacity-90 transition-all duration-200 flex items-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5`}
            title={
              selectMode
                ? "Matikan mode pilih"
                : "Aktifkan mode pilih untuk memilih beberapa aset"
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7 7h.01M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
              />
            </svg>
            {selectMode ? "Mode Pilih Aktif" : "Cetak"}
          </button>

          {/* Tombol Cetak QR Code hanya muncul saat mode pilihan diaktifkan */}
          {selectMode && (
            <button
              onClick={handlePrintSelected}
              disabled={selectedIds.length === 0}
              className={`${
                selectedIds.length > 0
                  ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                  : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
              } text-white px-4 py-3 rounded-xl shadow transition-all duration-200 flex items-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5`}
              title={
                selectedIds.length > 0
                  ? "Cetak QR Code untuk aset terpilih"
                  : "Pilih minimal 1 aset untuk mencetak"
              }
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Cetak QR Code
            </button>
          )}
          <Link
            to="/assets/assets-baru"
            className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow hover:bg-blue-700 transition-all duration-200 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Daftarkan Aset Baru
          </Link>
        </div>
      </div>

      {/* --- BAGIAN PENCARIAN & FILTER --- */}
      <div
        className={`mb-6 p-5 rounded-xl shadow-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan Kode Aset, Nama Barang, Lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className={`h-5 w-5 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <select
              value={filterNamaBarang}
              onChange={(e) => setFilterNamaBarang(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Semua Barang</option>
              {namaBarangList.map((nama, index) => (
                <option key={index} value={nama}>
                  {nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterLokasi}
              onChange={(e) => setFilterLokasi(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Semua Ruangan</option>
              {lokasiList.map((lokasi, index) => (
                <option key={index} value={lokasi}>
                  {lokasi}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterKampus}
              onChange={(e) => setFilterKampus(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Semua Kampus</option>
              {kampusList.map((kampus, index) => (
                <option key={index} value={kampus}>
                  {kampus}
                </option>
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
              className={`px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
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
          </div>
        </div>
        <div className="mt-3">
          <span
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Menampilkan {filteredAssets.length} dari {allAssets.length} aset
          </span>
        </div>
      </div>

      {searchTerm && (
        <div
          className={`mb-4 p-4 rounded-xl ${
            theme === "dark" ? "bg-gray-700" : "bg-blue-50"
          }`}
        >
          <p
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-blue-700"
            }`}
          >
            Menampilkan {filteredAssets.length} dari {allAssets.length} data
            {searchTerm && ` untuk pencarian "${searchTerm}"`}
          </p>
        </div>
      )}

      <div
        className={`rounded-xl shadow-lg overflow-hidden ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {filteredAssets.length === 0 ? (
          <div
            className={`text-center p-12 rounded-xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3
              className={`mt-2 text-lg font-medium ${
                theme === "dark" ? "text-gray-200" : "text-gray-900"
              }`}
            >
              {searchTerm || filterNamaBarang || filterLokasi || filterKampus
                ? "Aset tidak ditemukan"
                : "Belum ada aset terdaftar"}
            </h3>
            <p
              className={`mt-1 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {searchTerm || filterNamaBarang || filterLokasi || filterKampus
                ? "Coba gunakan filter lain"
                : "Mulai dengan mendaftarkan aset baru."}
            </p>
            <div className="mt-6">
              <Link
                to="/assets/new"
                className={`inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-xl text-white ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg`}
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Daftarkan Aset Baru
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead
                  className={theme === "dark" ? "bg-gray-750" : "bg-gray-50"}
                >
                  <tr>
                    {selectMode && (
                      <th
                        className={`px-4 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={() => toggleAll()}
                          className="rounded"
                        />
                      </th>
                    )}

                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Kode Aset
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Nama Barang
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Kampus
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Gedung
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Ruangan
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Lantai
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Unit Kerja
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Status
                    </th>
                    <th
                      className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y divide-gray-200 ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  {currentItems.map((asset) => (
                    <tr
                      key={asset.id_aset}
                      className={`transition-colors duration-150 ${
                        theme === "dark"
                          ? "hover:bg-gray-750"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {selectMode && (
                        <td
                          className={`px-4 py-4 whitespace-nowrap text-sm ${
                            theme === "dark" ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(asset.id_aset)}
                            onChange={() => toggleItem(asset.id_aset)}
                            className="rounded"
                          />
                        </td>
                      )}
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <span className="font-mono text-blue-600 dark:text-blue-400">
                          {asset.kode_aset}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <div>
                          <div className="font-medium">
                            {asset.item?.nama_item || "N/A"}
                          </div>
                          {asset.merk && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {asset.merk}{" "}
                              {asset.tipe_model && `- ${asset.tipe_model}`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {asset.lokasi?.gedung?.kampus?.nama_kampus || "N/A"}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {asset.lokasi?.gedung?.nama_gedung || "N/A"}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {asset.lokasi?.nama_ruangan || "N/A"}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {asset.lokasi?.lantai || "-"}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <div>
                          <div>{asset.unitKerja?.nama_unit || "N/A"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {asset.unitKerja?.unitUtama?.nama_unit_utama || ""}
                          </div>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            asset.status_aset === "Tersedia"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : asset.status_aset === "Dipinjam"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : asset.status_aset === "Dalam Perbaikan"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {asset.status_aset || "Tersedia"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/assets/${asset.id_aset}`}
                          className={`mr-3 px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                            theme === "dark"
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                          }`}
                        >
                          Detail
                        </Link>
                        <Link
                          to={`/assets/${asset.id_aset}/edit`}
                          className={`mr-3 px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                            theme === "dark"
                              ? "bg-yellow-600 text-white hover:bg-yellow-700"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          }`}
                          title="Edit Aset"
                        >
                          <svg
                            className="w-4 h-4 inline"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(asset)}
                          className={`px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                            theme === "dark"
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                          title="Hapus Aset"
                        >
                          <svg
                            className="w-4 h-4 inline"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
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
              <div
                className={`px-4 py-4 flex items-center justify-between border-t ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Menampilkan {indexOfFirstItem + 1} hingga{" "}
                  {Math.min(indexOfLastItem, filteredAssets.length)} dari{" "}
                  {filteredAssets.length} hasil
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
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
                          pageNumbers.push("...");
                          pageNumbers.push(totalPages);
                        }
                        // If current page is near the end
                        else if (currentPage >= totalPages - 2) {
                          pageNumbers.push("...");
                          for (let i = totalPages - 3; i <= totalPages; i++) {
                            pageNumbers.push(i);
                          }
                        }
                        // If current page is in the middle
                        else {
                          pageNumbers.push("...");
                          for (
                            let i = currentPage - 1;
                            i <= currentPage + 1;
                            i++
                          ) {
                            pageNumbers.push(i);
                          }
                          pageNumbers.push("...");
                          pageNumbers.push(totalPages);
                        }
                      }

                      return pageNumbers.map((pageNum, index) =>
                        pageNum === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className={`px-3 py-2 ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum as number)}
                            className={`w-10 h-10 rounded-lg transition-colors ${
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
                      );
                    })()}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && assetToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Konfirmasi Hapus"
        >
          <div className="p-6">
            <p
              className={`mb-6 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Apakah Anda yakin ingin menghapus aset{" "}
              <strong>{assetToDelete.kode_aset}</strong>? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-6 py-3 border rounded-xl transition-colors ${
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200"
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
