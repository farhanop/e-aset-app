// frontend\src\pages\MasterDataPage.tsx
import { useState, useEffect, Fragment, ReactNode } from "react";
import api from "../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Modal } from "../components/Modal";
import { Tab } from "@headlessui/react";
import { UnitUtamaForm } from "../components/forms/UnitUtamaForm";
import { UnitKerjaForm } from "../components/forms/UnitKerjaForm";
import { GedungForm } from "../components/forms/GedungForm";
import { KampusForm } from "../components/forms/KampusForm";
import { LokasiForm } from "../components/forms/LokasiForm";
import { KategoriItemForm } from "../components/forms/KategoriItemForm";
import { MasterItemForm } from "../components/forms/MasterItemForm";
import { useTheme } from "../contexts/ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- TIPE DATA ---
interface Kampus {
  id_kampus: number;
  kode_kampus: string;
  nama_kampus: string;
  alamat?: string | null;
}

interface UnitUtama {
  id_unit_utama: number;
  kode_unit_utama: string;
  nama_unit_utama: string;
}

interface UnitKerja {
  id_unit_kerja: number;
  kode_unit: string;
  nama_unit: string;
  unitUtama?: {
    id_unit_utama: number;
    kode_unit_utama: string;
    nama_unit_utama: string;
  };
}

interface Gedung {
  id_gedung: number;
  kode_gedung: string;
  nama_gedung: string;
  id_kampus?: number;
  kampus?: {
    id_kampus: number;
    kode_kampus: string;
    nama_kampus: string;
  };
}

interface Lokasi {
  id_lokasi: number;
  kode_ruangan: string;
  nama_ruangan: string;
  lantai: number;
  id_gedung: number;
  id_unit_kerja?: number;
  gedung?: {
    id_gedung: number;
    kode_gedung: string;
    nama_gedung: string;
  };
  unitKerja?: {
    id_unit_kerja: number;
    kode_unit: string;
    nama_unit: string;
  };
}

interface KategoriItem {
  id_kategori: number;
  nama_kategori: string;
}

interface MasterItem {
  id_item: number;
  kode_item: string;
  nama_item: string;
  metode_pelacakan: string;
  id_kategori?: number;
  kategori?: {
    id_kategori: number;
    nama_kategori: string;
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

// --- KOMPONEN INFO TAB ---
interface TabInfoProps {
  title: string;
  description: string;
  usage: string[];
  color: string;
  isVisible: boolean;
  onToggle: () => void;
}

const TabInfo = ({
  title,
  description,
  usage,
  color,
  isVisible,
  onToggle,
}: TabInfoProps) => {
  const { theme } = useTheme();

  const getColorClasses = (color: string, type: "bg" | "text" | "border") => {
    const colorMap: Record<string, Record<string, string>> = {
      blue: {
        bg: "bg-blue-500",
        text: "text-blue-500",
        border: "border-blue-500",
      },
      green: {
        bg: "bg-green-500",
        text: "text-green-500",
        border: "border-green-500",
      },
      purple: {
        bg: "bg-purple-500",
        text: "text-purple-500",
        border: "border-purple-500",
      },
      yellow: {
        bg: "bg-yellow-500",
        text: "text-yellow-500",
        border: "border-yellow-500",
      },
      indigo: {
        bg: "bg-indigo-500",
        text: "text-indigo-500",
        border: "border-indigo-500",
      },
      teal: {
        bg: "bg-teal-500",
        text: "text-teal-500",
        border: "border-teal-500",
      },
      orange: {
        bg: "bg-orange-500",
        text: "text-orange-500",
        border: "border-orange-500",
      },
    };

    return colorMap[color]?.[type] || colorMap.blue[type];
  };

  const colorClasses = {
    bg: getColorClasses(color, "bg"),
    text: getColorClasses(color, "text"),
    border: getColorClasses(color, "border"),
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3
          className={`text-lg font-semibold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Panduan Penggunaan {title}
        </h3>
        <button
          onClick={onToggle}
          className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors duration-200 ${
            theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {isVisible ? (
            <>
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              Sembunyikan
            </>
          ) : (
            <>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Tampilkan
            </>
          )}
        </button>
      </div>

      {isVisible && (
        <div
          className={`p-5 rounded-xl border-l-4 ${
            theme === "dark"
              ? `bg-gray-800 ${colorClasses.border}`
              : `bg-white ${colorClasses.border}`
          } shadow-sm`}
        >
          <div className="flex items-start">
            <div
              className={`flex-shrink-0 p-2 rounded-lg ${
                theme === "dark" ? `bg-${color}-900/30` : `bg-${color}-100`
              }`}
            >
              <svg
                className={`h-5 w-5 ${colorClasses.text}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p
                className={`mb-3 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {description}
              </p>
              <div>
                <h4
                  className={`font-medium mb-2 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Cara Penggunaan:
                </h4>
                <ul
                  className={`space-y-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {usage.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span
                        className={`inline-block mr-2 ${colorClasses.text}`}
                      >
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- KOMPONEN GENERIK UNTUK SETIAP TAB ---
interface CrudTabProps<T> {
  fetchUrl: string;
  deleteUrlPrefix: string;
  patchUrlPrefix: string;
  postUrl: string;
  columns: {
    header: string;
    accessor: keyof T | string;
    render?: (item: T) => ReactNode;
    className?: string;
  }[];
  FormComponent: React.ElementType<any>;
  modalTitle: string;
  idAccessor: keyof T;
  searchableColumns?: (keyof T)[];
  tabName: string;
  tabIcon?: ReactNode;
  tabColor?: string;
  tabInfo?: {
    description: string;
    usage: string[];
  };
}

function CrudTab<T extends { [key: string]: any }>({
  fetchUrl,
  deleteUrlPrefix,
  patchUrlPrefix,
  postUrl,
  columns,
  FormComponent,
  modalTitle,
  idAccessor,
  searchableColumns = [],
  tabName,
  tabIcon,
  tabColor = "blue",
  tabInfo,
}: CrudTabProps<T>) {
  const { theme } = useTheme();
  const [data, setData] = useState<T[]>([]);
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk visibilitas panduan - default false (tersembunyi)
  const [showTabInfo, setShowTabInfo] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ALUR 1: Ambil status visibilitas panduan dari localStorage saat komponen mount
  useEffect(() => {
    const savedTabInfoVisibility = localStorage.getItem(
      `tabInfoVisibility_${tabName}`
    );
    if (savedTabInfoVisibility !== null) {
      setShowTabInfo(savedTabInfoVisibility === "true");
    }
  }, [tabName]);

  // ALUR 2: Simpan status visibilitas panduan ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem(
      `tabInfoVisibility_${tabName}`,
      showTabInfo.toString()
    );
  }, [showTabInfo, tabName]);

  // ALUR 3: Fetch data saat komponen mount atau fetchUrl berubah
  useEffect(() => {
    fetchData();
  }, [fetchUrl]);

  // ALUR 4: Filter data berdasarkan pencarian
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) =>
        searchableColumns.some((column) => {
          const value = item[column];
          return value
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        })
      );
      setFilteredData(filtered);
    }
    // Reset ke halaman pertama saat mencari
    setCurrentPage(1);
  }, [data, searchTerm, searchableColumns]);

  // ALUR 5: Reset pagination saat items per page berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // ALUR 6: Fungsi untuk mengambil data dari API
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(fetchUrl);
      setData(response.data.data || response.data);
    } catch (err: any) {
      console.error(`Gagal mengambil data dari ${fetchUrl}`, err);

      if (err.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
      } else if (err.response?.status === 400) {
        setError(
          `Permintaan tidak valid: ${
            err.response?.data?.message || "Periksa kembali permintaan Anda"
          }`
        );
      } else {
        setError("Gagal mengambil data. Silakan coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ALUR 7: Fungsi untuk menangani pembukaan modal (create/edit)
  const handleOpenModal = (item: T | null = null) => {
    console.log(`CrudTab handleOpenModal called with:`, item);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // ALUR 8: Fungsi untuk menangani penutupan modal
  const handleCloseModal = () => {
    console.log(`CrudTab handleCloseModal called`);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // ALUR 9: Fungsi untuk menangani penyimpanan data (create/update)
  const handleSave = async (formData: any) => {
    console.log(`CrudTab handleSave called with:`, formData);

    if (typeof formData !== "object" || formData === null) {
      console.error("Invalid form data:", formData);
      toast.error("Data formulir tidak valid", {
        position: "top-right",
        autoClose: 3000,
        theme: theme === "dark" ? "dark" : "light",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        // Update data existing
        await api.patch(
          `${patchUrlPrefix}/${editingItem[idAccessor]}`,
          formData
        );
        setData((prevData) =>
          prevData.map((item) =>
            item[idAccessor] === editingItem[idAccessor]
              ? { ...item, ...formData }
              : item
          )
        );
        toast.success(`Berhasil mengupdate data ${tabName}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: theme === "dark" ? "dark" : "light",
        });
      } else {
        // Create data baru
        const response = await api.post(postUrl, formData);
        setData((prevData) => [
          ...prevData,
          response.data.data || response.data,
        ]);
        toast.success(`Berhasil menambah data ${tabName}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: theme === "dark" ? "dark" : "light",
        });
      }
      handleCloseModal();
    } catch (err: any) {
      console.error("Gagal menyimpan data", err);

      let errorMessage = "Gagal menyimpan data.";

      if (err.response?.status === 400) {
        errorMessage =
          err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).join(", ") ||
          "Data yang dikirim tidak valid.";
      } else if (err.response?.status === 401) {
        errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: theme === "dark" ? "dark" : "light",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ALUR 10: Fungsi untuk menangani penghapusan data
  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      try {
        await api.delete(`${deleteUrlPrefix}/${id}`);
        setData((prevData) =>
          prevData.filter((item) => item[idAccessor] !== id)
        );
        toast.success(`Berhasil menghapus data ${tabName}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: theme === "dark" ? "dark" : "light",
        });
      } catch (err: any) {
        console.error("Gagal menghapus data", err);

        let errorMessage = "Gagal menghapus data.";

        if (err.response?.status === 400) {
          errorMessage =
            err.response?.data?.message || "Tidak dapat menghapus item ini.";
        } else if (err.response?.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        }

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: theme === "dark" ? "dark" : "light",
        });
      }
    }
  };

  // ALUR 11: Fungsi untuk menangani perubahan pada input pencarian
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // ALUR 12: Kalkulasi pagination
  const displayData = searchTerm ? filteredData : data;
  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayData.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle items per page change
  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
  };

  // Toggle tab info visibility
  const toggleTabInfo = () => setShowTabInfo(!showTabInfo);

  // ALUR 13: Handle error state
  if (error)
    return (
      <div
        className={`text-center p-8 rounded-xl ${
          theme === "dark" ? "bg-red-900/20" : "bg-red-50"
        }`}
      >
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className={`mt-4 px-6 py-3 rounded-lg ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white transition-all duration-200 font-medium shadow-md hover:shadow-lg`}
        >
          Coba Lagi
        </button>
      </div>
    );

  // ALUR 14: Handle loading state
  if (loading) return <TableSkeleton />;

  // Fungsi untuk mendapatkan kelas warna berdasarkan tabColor
  const getColorClasses = (
    color: string,
    type: "bg" | "text" | "border" | "ring" | "hover"
  ) => {
    const colorMap: Record<string, Record<string, string>> = {
      blue: {
        bg: "bg-blue-500",
        text: "text-blue-500",
        border: "border-blue-500",
        ring: "ring-blue-500",
        hover: "hover:bg-blue-600",
      },
      green: {
        bg: "bg-green-500",
        text: "text-green-500",
        border: "border-green-500",
        ring: "ring-green-500",
        hover: "hover:bg-green-600",
      },
      purple: {
        bg: "bg-purple-500",
        text: "text-purple-500",
        border: "border-purple-500",
        ring: "ring-purple-500",
        hover: "hover:bg-purple-600",
      },
      yellow: {
        bg: "bg-yellow-500",
        text: "text-yellow-500",
        border: "border-yellow-500",
        ring: "ring-yellow-500",
        hover: "hover:bg-yellow-600",
      },
      indigo: {
        bg: "bg-indigo-500",
        text: "text-indigo-500",
        border: "border-indigo-500",
        ring: "ring-indigo-500",
        hover: "hover:bg-indigo-600",
      },
      teal: {
        bg: "bg-teal-500",
        text: "text-teal-500",
        border: "border-teal-500",
        ring: "ring-teal-500",
        hover: "hover:bg-teal-600",
      },
      orange: {
        bg: "bg-orange-500",
        text: "text-orange-500",
        border: "border-orange-500",
        ring: "ring-orange-500",
        hover: "hover:bg-orange-600",
      },
    };

    return colorMap[color]?.[type] || colorMap.blue[type];
  };

  const colorClasses = {
    bg: getColorClasses(tabColor, "bg"),
    text: getColorClasses(tabColor, "text"),
    border: getColorClasses(tabColor, "border"),
    ring: getColorClasses(tabColor, "ring"),
    hover: getColorClasses(tabColor, "hover"),
    bgLight: theme === "dark" ? `bg-${tabColor}-900/30` : `bg-${tabColor}-100`,
    textLight:
      theme === "dark" ? `text-${tabColor}-300` : `text-${tabColor}-600`,
    bgLighter: theme === "dark" ? `bg-${tabColor}-900/20` : `bg-${tabColor}-50`,
    textLighter:
      theme === "dark" ? `text-${tabColor}-300` : `text-${tabColor}-700`,
  };

  // ALUR 15: Render UI utama
  return (
    <div className="h-full flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === "dark" ? "dark" : "light"}
      />

      {/* Tab Info */}
      {tabInfo && (
        <TabInfo
          title={tabName}
          description={tabInfo.description}
          usage={tabInfo.usage}
          color={tabColor}
          isVisible={showTabInfo}
          onToggle={toggleTabInfo}
        />
      )}

      {/* Stats Card */}
      <div
        className={`rounded-xl shadow-lg p-6 mb-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses.bgLight}`}>
            <div className={`w-8 h-8 ${colorClasses.text}`}>{tabIcon}</div>
          </div>
          <div className="ml-4">
            <p
              className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Total {tabName}
            </p>
            <p
              className={`text-3xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {data.length}
            </p>
          </div>
        </div>
      </div>

      {/* Header dengan Search, Items Per Page, dan Add Button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {searchableColumns.length > 0 && (
            <div className="w-full sm:w-80 flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-${tabColor}-500 focus:border-${tabColor}-500 transition-all duration-200 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
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
          )}

          {/* Items Per Page Selector */}
          <div className="flex items-center gap-2">
            <span
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Tampilkan
            </span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className={`rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-${tabColor}-500 focus:border-${tabColor}-500 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              item per halaman
            </span>
          </div>
        </div>

        <div className="flex justify-end w-full lg:w-auto">
          <button
            onClick={() => handleOpenModal()}
            className={`${colorClasses.bg} text-white px-6 py-3 rounded-xl shadow ${colorClasses.hover} transition-all duration-200 flex items-center gap-2 font-medium hover:shadow-lg transform hover:-translate-y-0.5`}
          >
            <svg
              className="w-5 h-5"
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
            Tambah {tabName}
          </button>
        </div>
      </div>

      {/* Search Info */}
      {searchTerm && (
        <div className={`mb-4 p-4 rounded-lg ${colorClasses.bgLighter}`}>
          <p className={`text-sm ${colorClasses.textLighter}`}>
            Menampilkan {filteredData.length} dari {data.length} data
            {searchTerm && ` untuk pencarian "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Table Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {displayData.length === 0 ? (
          <div
            className={`flex-1 flex items-center justify-center p-12 rounded-xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <div className="text-center">
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
                className={`text-lg font-medium mb-2 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-900"
                }`}
              >
                {searchTerm ? "Data tidak ditemukan" : "Data kosong"}
              </h3>
              <p
                className={`text-sm mb-6 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {searchTerm
                  ? "Coba gunakan kata kunci lain"
                  : "Belum ada data yang tersedia."}
              </p>
              <button
                onClick={() => handleOpenModal()}
                className={`inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-xl text-white ${colorClasses.bg} ${colorClasses.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses.ring} transition-all duration-200 transform hover:-translate-y-0.5`}
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Tambah {tabName}
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`flex-1 rounded-xl shadow-lg overflow-hidden flex flex-col ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="overflow-x-auto flex-1">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead
                    className={theme === "dark" ? "bg-gray-750" : "bg-gray-50"}
                  >
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.header}
                          className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          } ${col.className || ""}`}
                        >
                          {col.header}
                        </th>
                      ))}
                      <th
                        className={`px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
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
                    {currentItems.map((item) => (
                      <tr
                        key={item[idAccessor]}
                        className={`transition-colors duration-150 ${
                          theme === "dark"
                            ? "hover:bg-gray-750"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {columns.map((col) => (
                          <td
                            key={`${item[idAccessor]}-${col.header}`}
                            className={`px-6 py-4 text-sm ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-700"
                            } ${col.className || ""}`}
                          >
                            {col.render
                              ? col.render(item)
                              : item[col.accessor as keyof T]}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                theme === "dark"
                                  ? `${colorClasses.bg} ${colorClasses.hover} text-white`
                                  : `${
                                      colorClasses.bgLight
                                    } hover:${colorClasses.bgLight.replace(
                                      "100",
                                      "200"
                                    )} ${colorClasses.text}`
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item[idAccessor])}
                              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                theme === "dark"
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-red-100 hover:bg-red-200 text-red-700"
                              }`}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            <div
              className={`px-6 py-4 border-t ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Menampilkan {indexOfFirstItem + 1} -{" "}
                    {Math.min(indexOfLastItem, displayData.length)} dari{" "}
                    {displayData.length} data
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? theme === "dark"
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-gray-400 cursor-not-allowed"
                        : theme === "dark"
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-10 h-10 rounded-md ${
                          currentPage === pageNum
                            ? `${colorClasses.bg} text-white`
                            : theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Ellipsis for large page counts */}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span
                      className={`px-2 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      ...
                    </span>
                  )}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <button
                      onClick={() => paginate(totalPages)}
                      className={`w-10 h-10 rounded-md ${
                        currentPage === totalPages
                          ? `${colorClasses.bg} text-white`
                          : theme === "dark"
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? theme === "dark"
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-gray-400 cursor-not-allowed"
                        : theme === "dark"
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? `Edit ${modalTitle}` : `Tambah ${modalTitle}`}
      >
        <FormComponent
          initialData={editingItem}
          onSave={handleSave}
          onCancel={handleCloseModal}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}

export function MasterDataPage() {
  const { theme } = useTheme();
  const tabs = [
    {
      name: "Lokasi",
      key: "lokasi",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "blue",
      info: {
        description:
          "Kelola data lokasi kampus yang digunakan dalam sistem inventaris. Lokasi kampus adalah unit terbesar dalam hierarki lokasi.",
        usage: [
          "Tambah lokasi kampus baru dengan mengklik tombol 'Tambah Lokasi'",
          "Edit data lokasi yang sudah ada dengan mengklik tombol 'Edit' pada baris data",
          "Hapus lokasi yang tidak digunakan dengan mengklik tombol 'Hapus'",
          "Gunakan fitur pencarian untuk menemukan lokasi tertentu dengan cepat",
          "Atur jumlah data yang ditampilkan per halaman sesuai kebutuhan",
        ],
      },
    },
    {
      name: "Gedung",
      key: "gedung",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      color: "green",
      info: {
        description:
          "Kelola data gedung yang ada di setiap lokasi kampus. Setiap gedung harus terasosiasi dengan satu lokasi kampus.",
        usage: [
          "Tambah gedung baru dengan mengklik tombol 'Tambah Gedung'",
          "Pilih lokasi kampus untuk gedung yang akan ditambahkan",
          "Edit data gedung dengan mengklik tombol 'Edit' pada baris data",
          "Hapus gedung yang tidak digunakan dengan mengklik tombol 'Hapus'",
          "Gunakan fitur pencarian untuk menemukan gedung tertentu",
        ],
      },
    },
    {
      name: "Departemen/Fakultas",
      key: "fakultas",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      ),
      color: "purple",
      info: {
        description:
          "Kelola data unit utama (departemen/fakultas) yang ada di institusi. Unit utama adalah tingkat organisasi tertinggi dalam hierarki unit kerja.",
        usage: [
          "Tambah unit utama baru dengan mengklik tombol 'Tambah Departemen/Fakultas'",
          "Isi kode unit dan nama unit secara lengkap",
          "Edit data unit utama dengan mengklik tombol 'Edit' pada baris data",
          "Hapus unit utama yang tidak digunakan dengan mengklik tombol 'Hapus'",
          "Unit utama ini akan menjadi induk dari unit kerja (prodi/bagian)",
        ],
      },
    },
    {
      name: "Prodi/Bagian",
      key: "prodi",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "yellow",
      info: {
        description:
          "Kelola data unit kerja (prodi/bagian) yang ada di setiap unit utama. Setiap unit kerja harus terasosiasi dengan satu unit utama.",
        usage: [
          "Tambah unit kerja baru dengan mengklik tombol 'Tambah Prodi/Bagian'",
          "Pilih unit utama (departemen/fakultas) untuk unit kerja yang akan ditambahkan",
          "Edit data unit kerja dengan mengklik tombol 'Edit' pada baris data",
          "Hapus unit kerja yang tidak digunakan dengan mengklik tombol 'Hapus'",
          "Unit kerja ini akan terasosiasi dengan ruangan/lokasi",
        ],
      },
    },
    {
      name: "Ruangan",
      key: "ruangan",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      color: "indigo",
      info: {
        description:
          "Kelola data ruangan yang ada di setiap gedung. Setiap ruangan harus terasosiasi dengan satu gedung dan dapat terasosiasi dengan unit kerja.",
        usage: [
          "Tambah ruangan baru dengan mengklik tombol 'Tambah Ruangan'",
          "Pilih gedung dan unit kerja untuk ruangan yang akan ditambahkan",
          "Tentukan lantai lokasi ruangan",
          "Edit data ruangan dengan mengklik tombol 'Edit' pada baris data",
          "Hapus ruangan yang tidak digunakan dengan mengklik tombol 'Hapus'",
        ],
      },
    },
    {
      name: "Kategori Item",
      key: "kategori",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M17 10a1 1 0 01-1 1H4a1 1 0 110-2h12a1 1 0 011 1zm-7 5a1 1 0 01-1 1H4a1 1 0 110 2h5a1 1 0 001-1zm3-7a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm-3 3a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1zm-3 3a1 1 0 011-1h10a1 1 0 110 2H7a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: "teal",
      info: {
        description:
          "Kelola data kategori item inventaris. Kategori item digunakan untuk mengelompokkan item-item yang memiliki karakteristik serupa.",
        usage: [
          "Tambah kategori item baru dengan mengklik tombol 'Tambah Kategori Item'",
          "Isi nama kategori item secara jelas dan deskriptif",
          "Edit data kategori item dengan mengklik tombol 'Edit' pada baris data",
          "Hapus kategori item yang tidak digunakan dengan mengklik tombol 'Hapus'",
          "Kategori item ini akan digunakan saat menambah master item",
        ],
      },
    },
    {
      name: "Master Item",
      key: "master-item",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      ),
      color: "orange",
      info: {
        description:
          "Kelola data master item inventaris. Master item adalah daftar semua item yang dapat diinventarisasi dalam sistem.",
        usage: [
          "Tambah master item baru dengan mengklik tombol 'Tambah Master Item'",
          "Pilih kategori item yang sesuai untuk master item",
          "Tentukan metode pelacakan yang digunakan untuk item tersebut",
          "Edit data master item dengan mengklik tombol 'Edit' pada baris data",
          "Hapus master item yang tidak digunakan dengan mengklik tombol 'Hapus'",
        ],
      },
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div
          className={`sticky top-0 z-40 border-b backdrop-blur-sm ${
            theme === "dark"
              ? "bg-gray-900/80 border-gray-700"
              : "bg-white/80 border-gray-200"
          }`}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1
                    className={`text-2xl font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Manajemen Data Master
                  </h1>
                  <p
                    className={`mt-1 text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Kelola data master sistem inventaris
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div
            className={`flex-1 m-4 flex flex-col min-h-0 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } rounded-2xl shadow-2xl border ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <Tab.Group>
              {/* Tab Headers */}
              <div
                className={`sticky top-0 z-30 border-b ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <Tab.List className="flex gap-2 overflow-x-auto px-6 py-4">
                  {tabs.map((tab) => (
                    <Tab key={tab.key} as={Fragment}>
                      {({ selected }) => (
                        <button
                          className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            selected
                              ? theme === "dark"
                                ? `bg-${tab.color}-900/30 text-${tab.color}-300 ring-${tab.color}-500 shadow-lg`
                                : `bg-white text-${tab.color}-600 ring-${tab.color}-200 shadow-lg border border-${tab.color}-200`
                              : theme === "dark"
                              ? "text-gray-300 hover:bg-gray-750 hover:text-white hover:shadow-md"
                              : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md"
                          }`}
                          aria-current={selected ? "true" : undefined}
                        >
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 transition-all duration-200 ${
                              selected ? "scale-110 opacity-100" : "opacity-80"
                            }`}
                          >
                            {tab.icon}
                          </span>
                          <span className="truncate max-w-[12rem] font-semibold">
                            {tab.name}
                          </span>
                        </button>
                      )}
                    </Tab>
                  ))}
                </Tab.List>
              </div>

              {/* Tab Content */}
              <Tab.Panels className="flex-1 flex flex-col min-h-0">
                {tabs.map((tab) => (
                  <Tab.Panel
                    key={tab.key}
                    className="flex-1 flex flex-col min-h-0 p-6"
                  >
                    {tab.key === "lokasi" && (
                      <CrudTab<Kampus>
                        fetchUrl="/master-data/kampus"
                        postUrl="/master-data/kampus"
                        patchUrlPrefix="/master-data/kampus"
                        deleteUrlPrefix="/master-data/kampus"
                        columns={[
                          {
                            header: "Kode Lokasi",
                            accessor: "kode_kampus",
                            className: "font-medium",
                          },
                          {
                            header: "Nama Lokasi",
                            accessor: "nama_kampus",
                            className: "font-medium",
                          },
                          {
                            header: "Alamat",
                            accessor: "alamat",
                            render: (item) => item.alamat || "-",
                            className: "max-w-md",
                          },
                        ]}
                        FormComponent={KampusForm}
                        modalTitle="Kampus"
                        idAccessor="id_kampus"
                        searchableColumns={["kode_kampus", "nama_kampus"]}
                        tabName="Lokasi"
                        tabIcon={tab.icon}
                        tabColor={tab.color}
                        tabInfo={tab.info}
                      />
                    )}

                    {tab.key === "gedung" && (
                      <CrudTab<Gedung>
                        fetchUrl="/master-data/gedung"
                        postUrl="/master-data/gedung"
                        patchUrlPrefix="/master-data/gedung"
                        deleteUrlPrefix="/master-data/gedung"
                        columns={[
                          {
                            header: "Kode",
                            accessor: "kode_gedung",
                            className: "font-medium",
                          },
                          {
                            header: "Nama Gedung",
                            accessor: "nama_gedung",
                            className: "font-medium",
                          },
                          {
                            header: "Lokasi",
                            accessor: "kampus",
                            render: (item) => item.kampus?.nama_kampus || "-",
                            className: "max-w-xs",
                          },
                        ]}
                        FormComponent={GedungForm}
                        modalTitle="Gedung"
                        idAccessor="id_gedung"
                        searchableColumns={["kode_gedung", "nama_gedung"]}
                        tabName="Gedung"
                        tabIcon={tab.icon}
                        tabColor={tab.color}
                        tabInfo={tab.info}
                      />
                    )}

                    {tab.key === "fakultas" && (
                      <CrudTab<UnitUtama>
                        fetchUrl="/master-data/unit-utama"
                        postUrl="/master-data/unit-utama"
                        patchUrlPrefix="/master-data/unit-utama"
                        deleteUrlPrefix="/master-data/unit-utama"
                        columns={[
                          {
                            header: "Kode",
                            accessor: "kode_unit_utama",
                            className: "font-medium",
                          },
                          {
                            header: "Nama Unit",
                            accessor: "nama_unit_utama",
                            className: "font-medium",
                          },
                        ]}
                        FormComponent={UnitUtamaForm}
                        modalTitle="Unit Utama"
                        idAccessor="id_unit_utama"
                        searchableColumns={[
                          "kode_unit_utama",
                          "nama_unit_utama",
                        ]}
                        tabName="Departemen/Fakultas"
                        tabIcon={tab.icon}
                        tabColor={tab.color}
                        tabInfo={tab.info}
                      />
                    )}

                    {tab.key === "prodi" && (
                      <CrudTab<UnitKerja>
                        fetchUrl="/master-data/unit-kerja"
                        postUrl="/master-data/unit-kerja"
                        patchUrlPrefix="/master-data/unit-kerja"
                        deleteUrlPrefix="/master-data/unit-kerja"
                        columns={[
                          {
                            header: "Kode",
                            accessor: "kode_unit",
                            className: "font-medium",
                          },
                          {
                            header: "Nama Unit",
                            accessor: "nama_unit",
                            className: "font-medium",
                          },
                          {
                            header: "Induk",
                            accessor: "unitUtama",
                            render: (item) =>
                              item.unitUtama?.nama_unit_utama || "-",
                            className: "max-w-xs",
                          },
                        ]}
                        FormComponent={UnitKerjaForm}
                        modalTitle="Unit Kerja"
                        idAccessor="id_unit_kerja"
                        searchableColumns={["kode_unit", "nama_unit"]}
                        tabName="Prodi/Bagian"
                        tabIcon={tab.icon}
                        tabColor={tab.color}
                        tabInfo={tab.info}
                      />
                    )}

                    {tab.key === "ruangan" && (
                      <CrudTab<Lokasi>
                        fetchUrl="/master-data/lokasi"
                        postUrl="/master-data/lokasi"
                        patchUrlPrefix="/master-data/lokasi"
                        deleteUrlPrefix="/master-data/lokasi"
                        columns={[
                          {
                            header: "Kode Ruangan",
                            accessor: "kode_ruangan",
                            className: "font-medium",
                          },
                          {
                            header: "Nama Ruangan",
                            accessor: "nama_ruangan",
                            className: "font-medium",
                          },
                          {
                            header: "Lantai",
                            accessor: "lantai",
                            className: "text-center",
                          },
                          {
                            header: "Gedung",
                            accessor: "gedung",
                            render: (item) => item.gedung?.nama_gedung || "-",
                            className: "max-w-xs",
                          },
                          {
                            header: "Unit Kerja",
                            accessor: "unitKerja",
                            render: (item) => item.unitKerja?.nama_unit || "-",
                            className: "max-w-xs",
                          },
                        ]}
                        FormComponent={LokasiForm}
                        modalTitle="Lokasi/Ruangan"
                        idAccessor="id_lokasi"
                        searchableColumns={["kode_ruangan", "nama_ruangan"]}
                        tabName="Ruangan"
                        tabIcon={tab.icon}
                        tabColor={tab.color}
                        tabInfo={tab.info}
                      />
                    )}

                    {tab.key === "kategori" && (
                      <CrudTab<KategoriItem>
                        fetchUrl="/master-data/kategori-item"
                        postUrl="/master-data/kategori-item"
                        patchUrlPrefix="/master-data/kategori-item"
                        deleteUrlPrefix="/master-data/kategori-item"
                        columns={[
                          {
                            header: "Nama Kategori",
                            accessor: "nama_kategori",
                            className: "font-medium",
                          },
                        ]}
                        FormComponent={KategoriItemForm}
                        modalTitle="Kategori Item"
                        idAccessor="id_kategori"
                        searchableColumns={["nama_kategori"]}
                        tabName="Kategori Item"
                        tabIcon={tab.icon}
                        tabColor={tab.color}
                        tabInfo={tab.info}
                      />
                    )}

                    {tab.key === "master-item" && (
                      <CrudTab<MasterItem>
                        fetchUrl="/master-data/master-item"
                        postUrl="/master-data/master-item"
                        patchUrlPrefix="/master-data/master-item"
                        deleteUrlPrefix="/master-data/master-item"
                        columns={[
                          {
                            header: "Kode Item",
                            accessor: "kode_item",
                            className: "font-medium",
                          },
                          {
                            header: "Nama Item",
                            accessor: "nama_item",
                            className: "font-medium",
                          },
                          {
                            header: "Kategori",
                            accessor: "kategori",
                            render: (item) =>
                              item.kategori?.nama_kategori || "-",
                            className: "max-w-xs",
                          },
                          {
                            header: "Metode Pelacakan",
                            accessor: "metode_pelacakan",
                            className: "max-w-xs",
                          },
                        ]}
                        FormComponent={MasterItemForm}
                        modalTitle="Master Item"
                        idAccessor="id_item"
                        searchableColumns={[
                          "kode_item",
                          "nama_item",
                          "metode_pelacakan",
                        ]}
                        tabName="Master Item"
                        tabIcon={tab.icon}
                        tabColor={tab.color}
                        tabInfo={tab.info}
                      />
                    )}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </div>
  );
}
