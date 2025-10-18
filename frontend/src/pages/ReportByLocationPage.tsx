// src/pages/ReportByLocationPage.tsx
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useTheme } from "../contexts/ThemeContext";
import { useReactToPrint } from 'react-to-print';
import PrintInventoryReport from '../components/forms/PrintInventoryReport';

// Definisikan tipe data yang dibutuhkan
interface Gedung { 
  id_gedung: number; 
  nama_gedung: string; 
}
interface UnitKerja { 
  id_unit_kerja: number; 
  nama_unit: string; 
  kode_unit: string;
  id_unit_utama: number;
}
interface Lokasi { 
  id_lokasi: number; 
  nama_ruangan: string; 
}
interface Asset {
  id_aset: number;
  kode_aset: string;
  item: { nama_item: string };
  status_aset: string;
  kondisi_terakhir: string;
}

export function ReportByLocationPage() {
  const { theme } = useTheme();
  
  // State untuk menyimpan daftar pilihan dropdown
  const [gedungList, setGedungList] = useState<Gedung[]>([]);
  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);

  // State untuk menyimpan nilai yang dipilih pengguna
  const [selectedGedung, setSelectedGedung] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedLokasi, setSelectedLokasi] = useState<string>('');

  // State untuk nama yang dipilih (untuk cetak)
  const [selectedGedungName, setSelectedGedungName] = useState<string>('');
  const [selectedUnitName, setSelectedUnitName] = useState<string>('');
  const [selectedLokasiName, setSelectedLokasiName] = useState<string>('');

  // State untuk hasil akhir
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  // State untuk nomor laporan
  const [reportNumber, setReportNumber] = useState<string>('FM-PM-13.4/08.02');

  // Ref untuk komponen cetak
  const printRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk mencetak
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan_Inventaris_${selectedGedungName}_${selectedUnitName}_${selectedLokasiName}`,
    onAfterPrint: () => console.log('Cetak laporan selesai'),
  });

  // Fungsi untuk menghasilkan nomor laporan baru
  const generateNewReportNumber = () => {
    // Format: FM-PM-13.4/08.02
    // Angka terakhir bisa diincrement setiap kali cetak
    const parts = reportNumber.split('/');
    const prefix = parts[0];
    let lastNumber = parseInt(parts[1]);
    lastNumber++;
    setReportNumber(`${prefix}/${lastNumber.toString().padStart(2, '0')}`);
  };

  // 1. Ambil data Gedung saat halaman pertama kali dimuat
  useEffect(() => {
    api.get('/master-data/gedung').then(response => {
      setGedungList(response.data);
    });
  }, []);

  // 2. Ambil data Unit Kerja setelah Gedung dipilih
  useEffect(() => {
    if (!selectedGedung) {
      setUnitKerjaList([]);
      setSelectedUnit('');
      setSelectedGedungName('');
      return;
    }
    
    const fetchUnitKerja = async () => {
      try {
        // Menggunakan parameter path bukan query string
        const response = await api.get(`/master-data/unit-kerja/by-gedung/${selectedGedung}`);
        setUnitKerjaList(response.data.data);
        
        // Simpan nama gedung yang dipilih
        const gedung = gedungList.find(g => g.id_gedung.toString() === selectedGedung);
        if (gedung) {
          setSelectedGedungName(gedung.nama_gedung);
        }
      } catch (error) {
        console.error("Gagal mengambil data unit kerja", error);
      }
    };

    fetchUnitKerja();
  }, [selectedGedung, gedungList]);

  // 3. Ambil data Ruangan setelah Gedung dan Unit Kerja dipilih
  useEffect(() => {
    if (!selectedGedung || !selectedUnit) {
      setLokasiList([]);
      setSelectedLokasi('');
      setSelectedUnitName('');
      return;
    }
    
    const fetchLokasi = async () => {
      try {
        const response = await api.get('/master-data/lokasi/by-gedung-unit', {
          params: { 
            gedungId: selectedGedung,
            unitKerjaId: selectedUnit
          }
        });
        setLokasiList(response.data.data);
        
        // Simpan nama unit yang dipilih
        const unit = unitKerjaList.find(u => u.id_unit_kerja.toString() === selectedUnit);
        if (unit) {
          setSelectedUnitName(unit.nama_unit);
        }
      } catch (error) {
        console.error("Gagal mengambil data lokasi", error);
      }
    };

    fetchLokasi();
  }, [selectedGedung, selectedUnit, unitKerjaList]);

  // 4. Ambil data Aset setelah Ruangan dipilih
  useEffect(() => {
    if (selectedLokasi) {
      setLoading(true);
      api.get(`/assets/by-location/${selectedLokasi}`)
        .then(response => {
          // Perubahan di sini: mengakses response.data.data
          setAssets(response.data.data);
          
          // Simpan nama lokasi yang dipilih
          const lokasi = lokasiList.find(l => l.id_lokasi.toString() === selectedLokasi);
          if (lokasi) {
            setSelectedLokasiName(lokasi.nama_ruangan);
          }
        })
        .catch(error => {
          console.error("Gagal mengambil data aset untuk lokasi ini", error);
          setAssets([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setAssets([]); // Kosongkan data jika tidak ada ruangan yang dipilih
      setSelectedLokasiName('');
    }
  }, [selectedLokasi, lokasiList]);

  // Fungsi untuk mereset semua filter
  const resetFilters = () => {
    setSelectedGedung('');
    setSelectedUnit('');
    setSelectedLokasi('');
    setSelectedGedungName('');
    setSelectedUnitName('');
    setSelectedLokasiName('');
    setAssets([]);
  };

  // Fungsi untuk menangani pencetakan
  const handlePrintClick = () => {
    generateNewReportNumber();
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}>
          Laporan Inventaris per Ruangan
        </h1>
        {assets.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-2 rounded-md text-sm font-medium ${
              theme === "dark" 
                ? "bg-gray-700 text-gray-300" 
                : "bg-gray-200 text-gray-700"
            }`}>
              No. Laporan: {reportNumber}
            </div>
            <button
              onClick={handlePrintClick}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                theme === "dark" 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Cetak Laporan
            </button>
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div className={`mb-6 rounded-lg shadow-md p-4 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}>
            Filter Data
          </h2>
          <button
            onClick={resetFilters}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              theme === "dark" 
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Reset Filter
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter Gedung */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              1. Pilih Gedung
            </label>
            <div className="relative">
              <select
                value={selectedGedung}
                onChange={(e) => {
                  setSelectedGedung(e.target.value);
                  setSelectedUnit('');
                  setSelectedLokasi('');
                }}
                className={`block w-full pl-3 pr-10 py-2 text-base rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 text-white" 
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="">-- Pilih Gedung --</option>
                {gedungList.map(gedung => (
                  <option key={gedung.id_gedung} value={gedung.id_gedung}>
                    {gedung.nama_gedung}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className={`h-5 w-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Filter Fakultas/Unit */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              2. Pilih Fakultas/Unit
            </label>
            <div className="relative">
              <select
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value);
                  setSelectedLokasi('');
                }}
                disabled={!selectedGedung}
                className={`block w-full pl-3 pr-10 py-2 text-base rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !selectedGedung 
                    ? (theme === "dark" ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-gray-100 border-gray-300 text-gray-500")
                    : (theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900")
                }`}
              >
                <option value="">-- Pilih Unit --</option>
                {unitKerjaList.map(unit => (
                  <option key={unit.id_unit_kerja} value={unit.id_unit_kerja}>
                    {unit.nama_unit}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className={`h-5 w-5 ${!selectedGedung ? "text-gray-400" : (theme === "dark" ? "text-gray-400" : "text-gray-500")}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Pilih Ruangan */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}>
              3. Pilih Ruangan
            </label>
            <div className="relative">
              <select
                value={selectedLokasi}
                onChange={(e) => setSelectedLokasi(e.target.value)}
                disabled={!selectedGedung || !selectedUnit}
                className={`block w-full pl-3 pr-10 py-2 text-base rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !selectedGedung || !selectedUnit
                    ? (theme === "dark" ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-gray-100 border-gray-300 text-gray-500")
                    : (theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900")
                }`}
              >
                <option value="">-- Pilih Ruangan --</option>
                {lokasiList.map(lokasi => (
                  <option key={lokasi.id_lokasi} value={lokasi.id_lokasi}>
                    {lokasi.nama_ruangan}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className={`h-5 w-5 ${!selectedGedung || !selectedUnit ? "text-gray-400" : (theme === "dark" ? "text-gray-400" : "text-gray-500")}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel untuk menampilkan hasil */}
      <div className={`rounded-lg shadow-md overflow-hidden ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>Memuat data inventaris...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Kode Aset
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Nama Barang
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Status
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    theme === "dark" ? "text-gray-300" : "text-gray-500"
                  }`}>
                    Kondisi
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}>
                {assets.length > 0 ? (
                  assets.map((asset) => (
                    <tr 
                      key={asset.id_aset} 
                      className={`transition-colors ${
                        theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {asset.kode_aset}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}>
                        {asset.item.nama_item}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${asset.status_aset === 'Tersedia' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 
                            asset.status_aset === 'Dipinjam' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' : 
                            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                          {asset.status_aset}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}>
                        {asset.kondisi_terakhir || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <h3 className={`mt-2 text-sm font-medium ${
                        theme === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}>
                        Tidak ada data
                      </h3>
                      <p className={`mt-1 text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}>
                        {selectedLokasi ? "Tidak ada aset di ruangan ini." : 
                         selectedGedung && selectedUnit ? "Silakan pilih ruangan untuk melihat inventaris." :
                         selectedGedung ? "Silakan pilih fakultas/unit untuk melanjutkan." :
                         "Silakan pilih gedung untuk memulai filter."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Komponen untuk cetak (tersembunyi) */}
      <div className="hidden print:block">
        <PrintInventoryReport 
          ref={printRef}
          assets={assets}
          selectedGedungName={selectedGedungName}
          selectedUnitName={selectedUnitName}
          selectedLokasiName={selectedLokasiName}
          reportNumber={reportNumber}
        />
      </div>
    </div>
  );
}