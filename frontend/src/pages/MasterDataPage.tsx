// frontend/src/pages/MasterDataPage.tsx
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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    <div className={`p-6 rounded-lg shadow-md ${
      theme === "dark" ? "bg-gray-800" : "bg-white"
    }`}>
      <Skeleton 
        height={40} 
        className="mb-4" 
        baseColor={theme === "dark" ? "#374151" : "#f3f4f6"}
        highlightColor={theme === "dark" ? "#4b5563" : "#e5e7eb"}
      />
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <Skeleton 
            key={index} 
            height={35} 
            className="mb-2" 
            baseColor={theme === "dark" ? "#374151" : "#f3f4f6"}
            highlightColor={theme === "dark" ? "#4b5563" : "#e5e7eb"}
          />
        ))}
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
}

function CrudTab<T extends { [key: string]: any }>({
  fetchUrl, deleteUrlPrefix, patchUrlPrefix, postUrl,
  columns, FormComponent, modalTitle, idAccessor,
  searchableColumns = [], tabName
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

  useEffect(() => { 
    fetchData(); 
  }, [fetchUrl]);

  // Filter data berdasarkan pencarian
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item =>
        searchableColumns.some(column => {
          const value = item[column];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
      setFilteredData(filtered);
    }
  }, [data, searchTerm, searchableColumns]);

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
        setError(`Permintaan tidak valid: ${err.response?.data?.message || "Periksa kembali permintaan Anda"}`);
      } else {
        setError("Gagal mengambil data. Silakan coba lagi nanti.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item: T | null = null) => { 
    setEditingItem(item); 
    setIsModalOpen(true); 
  };
  
  const handleCloseModal = () => { 
    setIsModalOpen(false); 
    setEditingItem(null); 
  };
  
  const handleSave = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.patch(`${patchUrlPrefix}/${editingItem[idAccessor]}`, formData);
        setData(prevData => 
          prevData.map(item => 
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
        const response = await api.post(postUrl, formData);
        setData(prevData => [...prevData, response.data.data || response.data]);
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
        errorMessage = err.response?.data?.message || 
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

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      try {
        await api.delete(`${deleteUrlPrefix}/${id}`);
        setData(prevData => prevData.filter(item => item[idAccessor] !== id));
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
          errorMessage = err.response?.data?.message || "Tidak dapat menghapus item ini.";
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  if (error) return (
    <div className={`text-center p-6 rounded-lg ${
      theme === "dark" ? "bg-red-900/20" : "bg-red-50"
    }`}>
      <p className="text-red-500">{error}</p>
      <button 
        onClick={fetchData}
        className={`mt-4 px-4 py-2 rounded-md ${
          theme === "dark" 
            ? "bg-blue-600 hover:bg-blue-700" 
            : "bg-blue-500 hover:bg-blue-600"
        } text-white transition-colors duration-200`}
      >
        Coba Lagi
      </button>
    </div>
  );
  
  if (loading) return <TableSkeleton />;
  
  const displayData = searchTerm ? filteredData : data;
  
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
      
      {/* Header dengan Search dan Add Button */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 p-1">
        {searchableColumns.length > 0 && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari..."
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
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
        )}
        
        <div className="flex justify-end w-full lg:w-auto">
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-all duration-200 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 font-medium hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Baru
          </button>
        </div>
      </div>
      
      {/* Search Info */}
      {searchTerm && (
        <div className={`mb-4 p-4 rounded-lg ${
          theme === "dark" ? "bg-gray-700" : "bg-blue-50"
        }`}>
          <p className={`text-sm ${
            theme === "dark" ? "text-gray-300" : "text-blue-700"
          }`}>
            Menampilkan {filteredData.length} dari {data.length} data
            {searchTerm && ` untuk pencarian "${searchTerm}"`}
          </p>
        </div>
      )}
      
      {/* Table Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {displayData.length === 0 ? (
          <div className={`flex-1 flex items-center justify-center p-12 rounded-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } shadow`}>
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className={`text-lg font-medium mb-2 ${
                theme === "dark" ? "text-gray-200" : "text-gray-900"
              }`}>
                {searchTerm ? "Data tidak ditemukan" : "Data kosong"}
              </h3>
              <p className={`text-sm mb-6 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                {searchTerm ? "Coba gunakan kata kunci lain" : "Belum ada data yang tersedia."}
              </p>
              <button
                onClick={() => handleOpenModal()}
                className={`inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white ${
                  theme === "dark" 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-blue-500 hover:bg-blue-600"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Tambah Data
              </button>
            </div>
          </div>
        ) : (
          <div className={`flex-1 rounded-lg shadow-md overflow-hidden flex flex-col ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}>
            <div className="overflow-x-auto flex-1">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      {columns.map((col) => (
                        <th 
                          key={col.header} 
                          className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          } ${col.className || ''}`}
                        >
                          {col.header}
                        </th>
                      ))}
                      <th className={`px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-gray-200 ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}>
                    {displayData.map((item) => (
                      <tr 
                        key={item[idAccessor]} 
                        className={`transition-colors duration-150 ${
                          theme === "dark" ? "hover:bg-gray-750" : "hover:bg-gray-50"
                        }`}
                      >
                        {columns.map((col) => (
                          <td 
                            key={`${item[idAccessor]}-${col.header}`} 
                            className={`px-6 py-4 text-sm ${
                              theme === "dark" ? "text-gray-200" : "text-gray-700"
                            } ${col.className || ''}`}
                          >
                            {col.render ? col.render(item) : item[col.accessor as keyof T]}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                                theme === "dark" 
                                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                  : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item[idAccessor])}
                              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
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
          onSubmit={handleSave} 
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
    { name: "Lokasi", key: "lokasi" },
    { name: "Gedung", key: "gedung" },
    { name: "Fakultas", key: "fakultas" },
    { name: "Prodi/Bagian", key: "prodi" },
    { name: "Ruangan", key: "ruangan" },
    { name: "Kategori Item", key: "kategori" },
    { name: "Master Item", key: "master-item" }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === "dark" ? "bg-gray-900" : "bg-gray-50"
    }`}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className={`border-b ${
          theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        }`}>
          <div className="px-6 py-4">
            <h1 className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}>
              Manajemen Data Master
            </h1>
            <p className={`mt-1 text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}>
              Kelola data master sistem inventaris
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className={`flex-1 rounded-lg m-4 flex flex-col min-h-0 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } shadow-lg`}>
            <Tab.Group>
              {/* Tab Headers */}
              <div className={`border-b ${
                theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
              }`}>
                <Tab.List className="flex overflow-x-auto px-4">
                  {tabs.map((tab) => (
                    <Tab key={tab.key} as={Fragment}>
                      {({ selected }) => (
                        <button
                          className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                            selected
                              ? theme === "dark"
                                ? "text-blue-400 border-blue-400"
                                : "text-blue-600 border-blue-600"
                              : theme === "dark"
                                ? "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-400"
                                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {tab.name}
                        </button>
                      )}
                    </Tab>
                  ))}
                </Tab.List>
              </div>
              
              {/* Tab Content */}
              <Tab.Panels className="flex-1 flex flex-col min-h-0">
                {tabs.map((tab) => (
                  <Tab.Panel key={tab.key} className="flex-1 flex flex-col min-h-0 p-6">
                    {tab.key === "lokasi" && (
                      <CrudTab<Kampus>
                        fetchUrl="/master-data/kampus"
                        postUrl="/master-data/kampus"
                        patchUrlPrefix="/master-data/kampus"
                        deleteUrlPrefix="/master-data/kampus"
                        columns={[
                          { header: 'Kode Lokasi', accessor: 'kode_kampus', className: 'font-medium' },
                          { header: 'Nama Lokasi', accessor: 'nama_kampus', className: 'font-medium' },
                          { header: 'Alamat', accessor: 'alamat', render: (item) => item.alamat || '-', className: 'max-w-md' },
                        ]}
                        FormComponent={KampusForm}
                        modalTitle="Kampus"
                        idAccessor="id_kampus"
                        searchableColumns={['kode_kampus', 'nama_kampus']}
                        tabName="Kampus"
                      />
                    )}
                    
                    {tab.key === "gedung" && (
                      <CrudTab<Gedung>
                        fetchUrl="/master-data/gedung" 
                        postUrl="/master-data/gedung" 
                        patchUrlPrefix="/master-data/gedung" 
                        deleteUrlPrefix="/master-data/gedung"
                        columns={[
                          { header: 'Kode', accessor: 'kode_gedung', className: 'font-medium' }, 
                          { header: 'Nama Gedung', accessor: 'nama_gedung', className: 'font-medium' },
                          { header: 'Lokasi', accessor: 'kampus', render: (item) => item.kampus?.nama_kampus || '-', className: 'max-w-xs' }
                        ]}
                        FormComponent={GedungForm} 
                        modalTitle="Gedung" 
                        idAccessor="id_gedung"
                        searchableColumns={['kode_gedung', 'nama_gedung']}
                        tabName="Gedung"
                      />
                    )}
                    
                    {tab.key === "fakultas" && (
                      <CrudTab<UnitUtama>
                        fetchUrl="/master-data/unit-utama" 
                        postUrl="/master-data/unit-utama" 
                        patchUrlPrefix="/master-data/unit-utama" 
                        deleteUrlPrefix="/master-data/unit-utama"
                        columns={[
                          { header: 'Kode', accessor: 'kode_unit_utama', className: 'font-medium' }, 
                          { header: 'Nama Unit', accessor: 'nama_unit_utama', className: 'font-medium' }
                        ]}
                        FormComponent={UnitUtamaForm} 
                        modalTitle="Unit Utama" 
                        idAccessor="id_unit_utama"
                        searchableColumns={['kode_unit_utama', 'nama_unit_utama']}
                        tabName="Fakultas"
                      />
                    )}

                    {tab.key === "prodi" && (
                      <CrudTab<UnitKerja>
                        fetchUrl="/master-data/unit-kerja" 
                        postUrl="/master-data/unit-kerja" 
                        patchUrlPrefix="/master-data/unit-kerja" 
                        deleteUrlPrefix="/master-data/unit-kerja"
                        columns={[
                          { header: 'Kode', accessor: 'kode_unit', className: 'font-medium' }, 
                          { header: 'Nama Unit', accessor: 'nama_unit', className: 'font-medium' }, 
                          { header: 'Induk', accessor: 'unitUtama', render: (item) => item.unitUtama?.nama_unit_utama || '-', className: 'max-w-xs' }
                        ]}
                        FormComponent={UnitKerjaForm} 
                        modalTitle="Unit Kerja" 
                        idAccessor="id_unit_kerja"
                        searchableColumns={['kode_unit', 'nama_unit']}
                        tabName="Prodi/Bagian"
                      />
                    )}
                    
                    {tab.key === "ruangan" && (
                      <CrudTab<Lokasi>
                        fetchUrl="/master-data/lokasi" 
                        postUrl="/master-data/lokasi" 
                        patchUrlPrefix="/master-data/lokasi" 
                        deleteUrlPrefix="/master-data/lokasi"
                        columns={[
                          { header: 'Kode Ruangan', accessor: 'kode_ruangan', className: 'font-medium' }, 
                          { header: 'Nama Ruangan', accessor: 'nama_ruangan', className: 'font-medium' },
                          { header: 'Lantai', accessor: 'lantai', className: 'text-center' },
                          { header: 'Gedung', accessor: 'gedung', render: (item) => item.gedung?.nama_gedung || '-', className: 'max-w-xs' },
                          { header: 'Unit Kerja', accessor: 'unitKerja', render: (item) => item.unitKerja?.nama_unit || '-', className: 'max-w-xs' },
                        ]}
                        FormComponent={LokasiForm} 
                        modalTitle="Lokasi/Ruangan" 
                        idAccessor="id_lokasi"
                        searchableColumns={['kode_ruangan', 'nama_ruangan']}
                        tabName="Ruangan"
                      />
                    )}
                    
                    {tab.key === "kategori" && (
                      <CrudTab<KategoriItem>
                        fetchUrl="/master-data/kategori-item" 
                        postUrl="/master-data/kategori-item" 
                        patchUrlPrefix="/master-data/kategori-item" 
                        deleteUrlPrefix="/master-data/kategori-item"
                        columns={[
                          { header: 'Nama Kategori', accessor: 'nama_kategori', className: 'font-medium' }
                        ]}
                        FormComponent={KategoriItemForm} 
                        modalTitle="Kategori Item" 
                        idAccessor="id_kategori"
                        searchableColumns={['nama_kategori']}
                        tabName="Kategori Item"
                      />
                    )}
                    
                    {tab.key === "master-item" && (
                      <CrudTab<MasterItem>
                        fetchUrl="/master-data/master-item" 
                        postUrl="/master-data/master-item" 
                        patchUrlPrefix="/master-data/master-item" 
                        deleteUrlPrefix="/master-data/master-item"
                        columns={[
                          { header: 'Kode Item', accessor: 'kode_item', className: 'font-medium' },
                          { header: 'Nama Item', accessor: 'nama_item', className: 'font-medium' },
                          { header: 'Kategori', accessor: 'kategori', render: (item) => item.kategori?.nama_kategori || '-', className: 'max-w-xs' },
                          { header: 'Metode Pelacakan', accessor: 'metode_pelacakan', className: 'max-w-xs' },
                        ]}
                        FormComponent={MasterItemForm} 
                        modalTitle="Master Item" 
                        idAccessor="id_item"
                        searchableColumns={['kode_item', 'nama_item', 'metode_pelacakan']}
                        tabName="Master Item"
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