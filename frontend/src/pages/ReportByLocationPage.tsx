import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useTheme } from "../contexts/ThemeContext";
import { useReactToPrint } from "react-to-print";
import PrintInventoryReport from "../components/forms/PrintInventoryReport";
import { toast } from "react-toastify";

// Definisikan tipe data yang dibutuhkan
interface Gedung {
  id_gedung: number;
  nama_gedung: string;
  kode_gedung?: string;
  id_kampus?: number;
  kampus?: any;
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
  kode_ruangan?: string;
  lantai?: number;
  id_gedung: number;
  id_unit_kerja?: number;
}
interface Asset {
  id_aset: number;
  kode_aset: string;
  item: { nama_item: string };
  status_aset: string;
  kondisi_terakhir: string;
  // Tambahkan properti untuk debugging
  id_lokasi?: number;
  lokasi?: any;
}

export function ReportByLocationPage() {
  const { theme } = useTheme();

  // State untuk menyimpan daftar pilihan dropdown
  const [gedungList, setGedungList] = useState<Gedung[]>([]);
  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
  const [lokasiList, setLokasiList] = useState<Lokasi[]>([]);

  // State untuk menyimpan nilai yang dipilih pengguna
  const [selectedGedung, setSelectedGedung] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedLokasi, setSelectedLokasi] = useState<string>("");

  // State untuk nama yang dipilih (untuk cetak)
  const [selectedGedungName, setSelectedGedungName] = useState<string>("");
  const [selectedUnitName, setSelectedUnitName] = useState<string>("");
  const [selectedLokasiName, setSelectedLokasiName] = useState<string>("");

  // State untuk hasil akhir
  const [assets, setAssets] = useState<Asset[]>([]);

  // Loading states
  const [loadingGedung, setLoadingGedung] = useState(false);
  const [loadingUnit, setLoadingUnit] = useState(false);
  const [loadingLokasi, setLoadingLokasi] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // State untuk nomor laporan
  const [reportNumber, setReportNumber] = useState<string>("FM-PM-13.4/08.02");

  // Ref untuk komponen cetak
  const printRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk mencetak
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Laporan_Inventaris_${selectedGedungName}_${selectedUnitName}_${selectedLokasiName}`,
    onAfterPrint: () => {
      console.log("Cetak laporan selesai");
      toast.success("Laporan berhasil dicetak!");
    },
    onPrintError: (error) => {
      console.error("Gagal mencetak laporan:", error);
      toast.error("Gagal mencetak laporan. Silakan coba lagi.");
    },
  });

  // Fungsi untuk menghasilkan nomor laporan baru
  const generateNewReportNumber = () => {
    const parts = reportNumber.split("/");
    if (parts.length === 2) {
      const prefix = parts[0];
      const lastNumber = parseInt(parts[1]);
      if (!isNaN(lastNumber)) {
        setReportNumber(
          `${prefix}/${(lastNumber + 1).toString().padStart(2, "0")}`
        );
      }
    }
  };

  // 1. Ambil data Gedung saat halaman pertama kali dimuat
  useEffect(() => {
    const fetchGedung = async () => {
      setLoadingGedung(true);
      setError(null);
      try {
        console.log("Mengambil data gedung...");
        const response = await api.get("/master-data/gedung");
        console.log("Response gedung:", response.data);

        if (Array.isArray(response.data)) {
          setGedungList(response.data);
          console.log("Daftar gedung:", response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setGedungList(response.data.data);
          console.log(
            "Daftar gedung (dari response.data.data):",
            response.data.data
          );
        } else {
          console.error("Response bukan array:", response.data);
          setGedungList([]);
          toast.error("Format data gedung tidak valid");
        }
      } catch (error: any) {
        console.error("Gagal mengambil data gedung", error);
        setGedungList([]);
        const errorMessage =
          error.response?.data?.message ||
          "Gagal memuat data gedung. Silakan coba lagi.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoadingGedung(false);
      }
    };

    fetchGedung();
  }, []);

  // 2. Ambil data Unit Kerja setelah Gedung dipilih
  useEffect(() => {
    if (!selectedGedung) {
      setUnitKerjaList([]);
      setSelectedUnit("");
      setSelectedGedungName("");
      return;
    }

    const fetchUnitKerja = async () => {
      setLoadingUnit(true);
      try {
        console.log(
          `Mengambil data unit kerja untuk gedung ID: ${selectedGedung}`
        );
        const response = await api.get(
          `/master-data/unit-kerja/by-gedung/${selectedGedung}`
        );
        console.log("Response unit kerja:", response.data);

        // Periksa apakah response.data adalah array
        let units: UnitKerja[] = [];
        if (Array.isArray(response.data)) {
          units = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          // Jika response.data adalah objek dengan properti data yang merupakan array
          units = response.data.data;
        } else {
          console.error("Response bukan array:", response.data);
          toast.error("Format data unit kerja tidak valid");
        }

        console.log("Daftar unit kerja setelah processing:", units);
        setUnitKerjaList(units);

        // Simpan nama gedung yang dipilih
        const gedung = gedungList.find(
          (g) => g.id_gedung.toString() === selectedGedung
        );
        if (gedung) {
          setSelectedGedungName(gedung.nama_gedung);
        }
      } catch (error: any) {
        console.error("Gagal mengambil data unit kerja", error);
        setUnitKerjaList([]);
        const errorMessage =
          error.response?.data?.message ||
          "Gagal memuat data unit kerja. Silakan coba lagi.";
        toast.error(errorMessage);
      } finally {
        setLoadingUnit(false);
      }
    };

    fetchUnitKerja();
  }, [selectedGedung, gedungList]);

  // 3. Ambil data Ruangan setelah Gedung dan Unit Kerja dipilih
  useEffect(() => {
    if (!selectedGedung || !selectedUnit) {
      setLokasiList([]);
      setSelectedLokasi("");
      setSelectedUnitName("");
      return;
    }

    const fetchLokasi = async () => {
      setLoadingLokasi(true);
      try {
        console.log(
          `Mengambil data lokasi untuk gedung ID: ${selectedGedung} dan unit ID: ${selectedUnit}`
        );
        const response = await api.get("/master-data/lokasi/by-gedung-unit", {
          params: {
            gedungId: selectedGedung,
            unitKerjaId: selectedUnit,
          },
        });
        console.log("Response lokasi:", response.data);

        // Periksa apakah response.data adalah array
        let locations: Lokasi[] = [];
        if (Array.isArray(response.data)) {
          locations = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          // Jika response.data adalah objek dengan properti data yang merupakan array
          locations = response.data.data;
        } else {
          console.error("Response bukan array:", response.data);
          toast.error("Format data lokasi tidak valid");
        }

        console.log("Daftar lokasi setelah processing:", locations);
        setLokasiList(locations);

        // Simpan nama unit yang dipilih
        const unit = unitKerjaList.find(
          (u) => u.id_unit_kerja.toString() === selectedUnit
        );
        if (unit) {
          setSelectedUnitName(unit.nama_unit);
        }
      } catch (error: any) {
        console.error("Gagal mengambil data lokasi", error);
        setLokasiList([]);
        const errorMessage =
          error.response?.data?.message ||
          "Gagal memuat data lokasi. Silakan coba lagi.";
        toast.error(errorMessage);
      } finally {
        setLoadingLokasi(false);
      }
    };

    fetchLokasi();
  }, [selectedGedung, selectedUnit, unitKerjaList]);

  // 4. Ambil data Aset setelah Ruangan dipilih
  useEffect(() => {
    if (selectedLokasi) {
      setLoadingAssets(true);
      const fetchAssets = async () => {
        try {
          console.log(`Mengambil data aset untuk lokasi ID: ${selectedLokasi}`);

          // PERUBAHAN: Coba beberapa endpoint alternatif
          let response;
          try {
            // Coba endpoint pertama
            response = await api.get(`/assets/by-location/${selectedLokasi}`);
            console.log("Response aset (endpoint 1):", response.data);
          } catch (error1) {
            console.log("Endpoint 1 gagal, mencoba endpoint 2...");
            try {
              // Coba endpoint alternatif
              response = await api.get("/assets", {
                params: {
                  lokasiId: selectedLokasi,
                },
              });
              console.log("Response aset (endpoint 2):", response.data);
            } catch (error2) {
              console.log("Endpoint 2 gagal, mencoba endpoint 3...");
              // Coba endpoint alternatif lain
              response = await api.get("/assets");
              console.log("Response aset (endpoint 3):", response.data);
            }
          }

          // Periksa apakah response.data adalah array
          let assetsData: Asset[] = [];
          if (Array.isArray(response.data)) {
            // Jika endpoint sudah mengembalikan data yang terfilter
            assetsData = response.data;
          } else if (response.data && Array.isArray(response.data.data)) {
            // Jika response.data adalah objek dengan properti data yang merupakan array
            assetsData = response.data.data;
          } else {
            console.error("Response bukan array:", response.data);
            toast.error("Format data aset tidak valid");
          }

          // Jika data belum terfilter, lakukan filter di frontend
          if (
            assetsData.length > 0 &&
            !assetsData.some(
              (asset) =>
                (asset as any).id_lokasi?.toString() === selectedLokasi ||
                (asset.lokasi &&
                  (asset.lokasi as any).id_lokasi?.toString() ===
                    selectedLokasi)
            )
          ) {
            console.log(
              "Data belum terfilter, melakukan filter di frontend..."
            );
            const filteredAssets = assetsData.filter((asset: Asset) => {
              // Cek berbagai kemungkinan lokasi asset
              const assetLokasiId = (asset as any).id_lokasi;
              const assetLokasi = asset.lokasi;

              return (
                assetLokasiId?.toString() === selectedLokasi ||
                (assetLokasi &&
                  (assetLokasi as any).id_lokasi?.toString() === selectedLokasi)
              );
            });

            console.log("Data aset setelah filter:", filteredAssets);
            setAssets(filteredAssets);
          } else {
            console.log("Data aset sudah terfilter atau tidak ada data:");
            setAssets(assetsData);
          }

          // Simpan nama lokasi yang dipilih
          const lokasi = lokasiList.find(
            (l) => l.id_lokasi.toString() === selectedLokasi
          );
          if (lokasi) {
            setSelectedLokasiName(lokasi.nama_ruangan);
          }
        } catch (error: any) {
          console.error("Gagal mengambil data aset untuk lokasi ini", error);
          setAssets([]);
          const errorMessage =
            error.response?.data?.message ||
            "Gagal memuat data aset. Silakan coba lagi.";
          toast.error(errorMessage);
        } finally {
          setLoadingAssets(false);
        }
      };

      fetchAssets();
    } else {
      setAssets([]); // Kosongkan data jika tidak ada ruangan yang dipilih
      setSelectedLokasiName("");
    }
  }, [selectedLokasi, lokasiList]);

  // Fungsi untuk mereset semua filter
  const resetFilters = () => {
    setSelectedGedung("");
    setSelectedUnit("");
    setSelectedLokasi("");
    setSelectedGedungName("");
    setSelectedUnitName("");
    setSelectedLokasiName("");
    setAssets([]);
    setError(null);
  };

  // Fungsi untuk menangani pencetakan
  const handlePrintClick = () => {
    if (assets.length === 0) {
      toast.warning("Tidak ada data aset untuk dicetak");
      return;
    }

    generateNewReportNumber();
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  // Fungsi untuk debugging - tampilkan data di console
  useEffect(() => {
    console.log("Data gedung saat ini:", gedungList);
    console.log("Data unit kerja saat ini:", unitKerjaList);
    console.log("Data lokasi saat ini:", lokasiList);
    console.log("Data aset saat ini:", assets);
  }, [gedungList, unitKerjaList, lokasiList, assets]);

  return (
    <div
      className={`h-screen flex flex-col ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header Section */}
      <div
        className={`sticky top-0 z-10 border-b backdrop-blur-sm ${
          theme === "dark"
            ? "bg-gray-900/80 border-gray-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h1
                className={`text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Laporan Inventaris per Ruangan
              </h1>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Filter data inventaris berdasarkan lokasi ruangan
              </p>
            </div>

            {assets && assets.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div
                  className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${
                    theme === "dark"
                      ? "bg-gray-800 text-gray-300 border border-gray-700"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  <span className="font-semibold">No. Laporan:</span>{" "}
                  {reportNumber}
                </div>
                <button
                  onClick={handlePrintClick}
                  disabled={loadingAssets}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 ${
                    theme === "dark"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } ${loadingAssets ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Cetak Laporan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4">
            {/* Error Message */}
            {error && (
              <div
                className={`mb-6 rounded-xl p-4 shadow-md border-l-4 border-red-500 ${
                  theme === "dark" ? "bg-gray-800" : "bg-red-50"
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-red-300" : "text-red-800"
                      }`}
                    >
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Section */}
            <div
              className={`mb-6 rounded-xl shadow-lg overflow-hidden ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div
                className={`px-4 py-3 border-b ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h2
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Filter Data
                  </h2>
                  <button
                    onClick={resetFilters}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center ${
                      theme === "dark"
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filter Gedung */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mr-2">
                          1
                        </span>
                        Gedung
                      </div>
                    </label>
                    <div className="relative">
                      {loadingGedung ? (
                        <div
                          className={`block w-full pl-3 pr-10 py-3 text-base rounded-lg border shadow-sm ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Memuat...
                          </span>
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedGedung}
                            onChange={(e) => {
                              setSelectedGedung(e.target.value);
                              setSelectedUnit("");
                              setSelectedLokasi("");
                            }}
                            className={`block w-full pl-3 pr-10 py-3 text-base rounded-lg border shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none ${
                              theme === "dark"
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">-- Pilih Gedung --</option>
                            {gedungList.map((gedung) => (
                              <option
                                key={gedung.id_gedung}
                                value={gedung.id_gedung}
                              >
                                {gedung.nama_gedung}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                              className={`h-5 w-5 ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Filter Fakultas/Unit */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mr-2">
                          2
                        </span>
                        Fakultas/Unit
                      </div>
                    </label>
                    <div className="relative">
                      {loadingUnit ? (
                        <div
                          className={`block w-full pl-3 pr-10 py-3 text-base rounded-lg border shadow-sm ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Memuat...
                          </span>
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedUnit}
                            onChange={(e) => {
                              setSelectedUnit(e.target.value);
                              setSelectedLokasi("");
                            }}
                            disabled={!selectedGedung}
                            className={`block w-full pl-3 pr-10 py-3 text-base rounded-lg border shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none ${
                              !selectedGedung
                                ? theme === "dark"
                                  ? "bg-gray-700 border-gray-600 text-gray-400"
                                  : "bg-gray-100 border-gray-300 text-gray-500"
                                : theme === "dark"
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">-- Pilih Unit --</option>
                            {unitKerjaList.map((unit) => (
                              <option
                                key={unit.id_unit_kerja}
                                value={unit.id_unit_kerja}
                              >
                                {unit.nama_unit}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                              className={`h-5 w-5 ${
                                !selectedGedung
                                  ? "text-gray-400"
                                  : theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Pilih Ruangan */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mr-2">
                          3
                        </span>
                        Ruangan
                      </div>
                    </label>
                    <div className="relative">
                      {loadingLokasi ? (
                        <div
                          className={`block w-full pl-3 pr-10 py-3 text-base rounded-lg border shadow-sm ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Memuat...
                          </span>
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedLokasi}
                            onChange={(e) => setSelectedLokasi(e.target.value)}
                            disabled={!selectedGedung || !selectedUnit}
                            className={`block w-full pl-3 pr-10 py-3 text-base rounded-lg border shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none ${
                              !selectedGedung || !selectedUnit
                                ? theme === "dark"
                                  ? "bg-gray-700 border-gray-600 text-gray-400"
                                  : "bg-gray-100 border-gray-300 text-gray-500"
                                : theme === "dark"
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            }`}
                          >
                            <option value="">-- Pilih Ruangan --</option>
                            {lokasiList.map((lokasi) => (
                              <option
                                key={lokasi.id_lokasi}
                                value={lokasi.id_lokasi}
                              >
                                {lokasi.nama_ruangan}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                              className={`h-5 w-5 ${
                                !selectedGedung || !selectedUnit
                                  ? "text-gray-400"
                                  : theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Location Info */}
            {(selectedGedungName || selectedUnitName || selectedLokasiName) && (
              <div
                className={`mb-6 rounded-xl shadow-lg p-4 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h3
                  className={`text-base font-semibold mb-3 ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  Lokasi Terpilih
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedGedungName && (
                    <div
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                        theme === "dark"
                          ? "bg-blue-900/30 text-blue-300"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Gedung: {selectedGedungName}
                    </div>
                  )}
                  {selectedUnitName && (
                    <div
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                        theme === "dark"
                          ? "bg-purple-900/30 text-purple-300"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Unit: {selectedUnitName}
                    </div>
                  )}
                  {selectedLokasiName && (
                    <div
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                        theme === "dark"
                          ? "bg-green-900/30 text-green-300"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Ruangan: {selectedLokasiName}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tabel untuk menampilkan hasil */}
            <div
              className={`rounded-xl shadow-lg overflow-hidden flex flex-col ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              {loadingAssets ? (
                <div className="flex flex-col justify-center items-center p-12 flex-1">
                  <svg
                    className="animate-spin h-10 w-10 text-blue-600 mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span
                    className={`text-lg font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Memuat data inventaris...
                  </span>
                  <p
                    className={`mt-2 text-center max-w-md ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Mohon tunggu sebentar, sistem sedang mengambil data aset
                    berdasarkan filter yang Anda pilih.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead
                      className={
                        theme === "dark" ? "bg-gray-750" : "bg-gray-50"
                      }
                    >
                      <tr>
                        <th
                          scope="col"
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                            theme === "dark" ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          Kode Aset
                        </th>
                        <th
                          scope="col"
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                            theme === "dark" ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          Nama Barang
                        </th>
                        <th
                          scope="col"
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                            theme === "dark" ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                            theme === "dark" ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          Kondisi
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y divide-gray-200 ${
                        theme === "dark" ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      {assets && assets.length > 0 ? (
                        assets.map((asset) => (
                          <tr
                            key={asset.id_aset}
                            className={`transition-colors duration-150 ${
                              theme === "dark"
                                ? "hover:bg-gray-750"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <td
                              className={`px-4 py-3 whitespace-nowrap text-sm font-mono font-medium ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {asset.kode_aset}
                            </td>
                            <td
                              className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {asset.item && asset.item.nama_item
                                ? asset.item.nama_item
                                : "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  asset.status_aset === "Tersedia"
                                    ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                                    : asset.status_aset === "Dipinjam"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300"
                                }`}
                              >
                                {asset.status_aset || "-"}
                              </span>
                            </td>
                            <td
                              className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-500"
                              }`}
                            >
                              {asset.kondisi_terakhir || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-12">
                            <div className="flex flex-col items-center justify-center">
                              <svg
                                className="h-16 w-16 text-gray-400 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                              </svg>
                              <h3
                                className={`text-lg font-medium mb-2 ${
                                  theme === "dark"
                                    ? "text-gray-200"
                                    : "text-gray-900"
                                }`}
                              >
                                Tidak ada data
                              </h3>
                              <p
                                className={`text-center max-w-md ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                {selectedLokasi
                                  ? "Tidak ada aset di ruangan ini."
                                  : selectedGedung && selectedUnit
                                  ? "Silakan pilih ruangan untuk melihat inventaris."
                                  : selectedGedung
                                  ? "Silakan pilih fakultas/unit untuk melanjutkan."
                                  : "Silakan pilih gedung untuk memulai filter."}
                              </p>
                              {selectedLokasi && (
                                <button
                                  onClick={resetFilters}
                                  className={`mt-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                    theme === "dark"
                                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  Ganti Filter
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Komponen untuk cetak (tersembunyi) */}
      <div className="hidden print:block">
        <PrintInventoryReport
          ref={printRef}
          assets={assets || []}
          selectedGedungName={selectedGedungName}
          selectedUnitName={selectedUnitName}
          selectedLokasiName={selectedLokasiName}
          reportNumber={reportNumber}
        />
      </div>
    </div>
  );
}
