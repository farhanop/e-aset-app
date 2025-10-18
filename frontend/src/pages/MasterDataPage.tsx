import { useState, useEffect, Fragment, ReactNode } from "react";
import api from "../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Modal } from "../components/Modal";
import { Tab } from "@headlessui/react";
import { UnitUtamaForm } from "../components/forms/UnitUtamaForm";
import { UnitKerjaForm } from "../components/forms/UnitKerjaForm";
import { GedungForm } from "../components/forms/GedungForm";
import { LokasiForm } from "../components/forms/LokasiForm";
import { KategoriItemForm } from "../components/forms/KategoriItemForm";
import { MasterItemForm } from "../components/forms/MasterItemForm";
import { useTheme } from "../contexts/ThemeContext";

// --- TIPE DATA ---
interface UnitUtama { id_unit_utama: number; kode_unit_utama: string; nama_unit_utama: string; }
interface UnitKerja { id_unit_kerja: number; kode_unit: string; nama_unit: string; unitUtama?: { nama_unit_utama: string }; }
interface Gedung { id_gedung: number; kode_gedung: string; nama_gedung: string; }
interface Lokasi { id_lokasi: number; kode_ruangan: string; nama_ruangan: string; lantai: number; gedung?: { nama_gedung: string }; unitKerja?: { nama_unit: string }; }
interface KategoriItem { id_kategori: number; nama_kategori: string; }
interface MasterItem { id_item: number; kode_item: string; nama_item: string; metode_pelacakan: string; kategori?: { nama_kategori: string }; }

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

// --- KOMPONEN GENERIK UNTUK SETIAP TAB ---
interface CrudTabProps<T> {
  fetchUrl: string;
  deleteUrlPrefix: string;
  patchUrlPrefix: string;
  postUrl: string;
  columns: { header: string; accessor: keyof T | string; render?: (item: T) => ReactNode }[];
  FormComponent: React.ElementType;
  modalTitle: string;
  idAccessor: keyof T;
  searchableColumns?: (keyof T)[];
}

function CrudTab<T extends { [key: string]: any }>({
  fetchUrl, deleteUrlPrefix, patchUrlPrefix, postUrl,
  columns, FormComponent, modalTitle, idAccessor,
  searchableColumns = []
}: CrudTabProps<T>) {
  const { theme } = useTheme();
  const [data, setData] = useState<T[]>([]);
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      setData(response.data);
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
    try {
      if (editingItem) {
        // Untuk edit, langsung update state tanpa response
        await api.patch(`${patchUrlPrefix}/${editingItem[idAccessor]}`, formData);
        setData(prevData => 
          prevData.map(item => 
            item[idAccessor] === editingItem[idAccessor] 
              ? { ...item, ...formData }
              : item
          )
        );
      } else {
        // Untuk tambah baru, gunakan response untuk mendapatkan data dengan ID
        const response = await api.post(postUrl, formData);
        setData(prevData => [...prevData, response.data]);
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
      
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      try {
        await api.delete(`${deleteUrlPrefix}/${id}`);
        // Hapus data secara real-time
        setData(prevData => prevData.filter(item => item[idAccessor] !== id));
      } catch (err: any) {
        console.error("Gagal menghapus data", err);
        
        let errorMessage = "Gagal menghapus data.";
        
        if (err.response?.status === 400) {
          errorMessage = err.response?.data?.message || "Tidak dapat menghapus item ini.";
        } else if (err.response?.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        }
        
        alert(errorMessage);
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
        } text-white`}
      >
        Coba Lagi
      </button>
    </div>
  );
  
  if (loading) return <TableSkeleton />;
  
  const displayData = searchTerm ? filteredData : data;
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        {searchableColumns.length > 0 && (
          <div className="w-full sm:w-64">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari..."
                value={searchTerm}
                onChange={handleSearch}
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
        )}
        
        <div className="flex justify-end w-full sm:w-auto">
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Baru
          </button>
        </div>
      </div>
      
      {searchTerm && (
        <div className={`mb-4 p-3 rounded-lg ${
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
      
      {displayData.length === 0 ? (
        <div className={`text-center p-12 rounded-lg ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } shadow`}>
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className={`mt-2 text-sm font-medium ${
            theme === "dark" ? "text-gray-200" : "text-gray-900"
          }`}>
            {searchTerm ? "Data tidak ditemukan" : "Data kosong"}
          </h3>
          <p className={`mt-1 text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            {searchTerm ? "Coba gunakan kata kunci lain" : "Belum ada data yang tersedia."}
          </p>
          <div className="mt-6">
            <button
              onClick={() => handleOpenModal()}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                theme === "dark" 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-blue-500 hover:bg-blue-600"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tambah Data
            </button>
          </div>
        </div>
      ) : (
        <div className={`rounded-lg shadow-md overflow-hidden ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  {columns.map((col) => (
                    <th 
                      key={col.header} 
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {col.header}
                    </th>
                  ))}
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
                {displayData.map((item) => (
                  <tr 
                    key={item[idAccessor]} 
                    className={`transition-colors ${
                      theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    {columns.map((col) => (
                      <td 
                        key={`${item[idAccessor]}-${col.header}`} 
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {col.render ? col.render(item) : item[col.accessor as keyof T]}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className={`mr-4 ${
                          theme === "dark" ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-900"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item[idAccessor])}
                        className={`${
                          theme === "dark" ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"
                        }`}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? `Edit ${modalTitle}` : `Tambah ${modalTitle}`}>
        <FormComponent initialData={editingItem} onSave={handleSave} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
}

// --- KOMPONEN UTAMA HALAMAN ---
export function MasterDataPage() {
  const { theme } = useTheme();
  const tabs = ["Fakultas", "Prodi", "Gedung", "Ruangan", "Kategori Item", "Master Item"];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${
          theme === "dark" ? "text-white" : "text-gray-800"
        }`}>
          Manajemen Data Master
        </h1>
      </div>
      
      <div className={`rounded-lg shadow-md overflow-hidden ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <Tab.Group>
          <Tab.List className={`flex overflow-x-auto ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-50"
          }`}>
            {tabs.map((tab) => (
              <Tab key={tab} as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                      selected
                        ? theme === "dark"
                          ? "text-blue-400 border-b-2 border-blue-400"
                          : "text-blue-600 border-b-2 border-blue-600"
                        : theme === "dark"
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tab}
                  </button>
                )}
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels>
            {/* TAB 1: FAKULTAS */}
            <Tab.Panel className="p-4">
              <CrudTab<UnitUtama>
                fetchUrl="/master-data/unit-utama" 
                postUrl="/master-data/unit-utama" 
                patchUrlPrefix="/master-data/unit-utama" 
                deleteUrlPrefix="/master-data/unit-utama"
                columns={[
                  { header: 'Kode', accessor: 'kode_unit_utama' }, 
                  { header: 'Nama Unit', accessor: 'nama_unit_utama' }
                ]}
                FormComponent={UnitUtamaForm} 
                modalTitle="Unit Utama" 
                idAccessor="id_unit_utama"
                searchableColumns={['kode_unit_utama', 'nama_unit_utama']}
              />
            </Tab.Panel>
            
            {/* TAB 2: PRODI */}
            <Tab.Panel className="p-4">
              <CrudTab<UnitKerja>
                fetchUrl="/master-data/unit-kerja" 
                postUrl="/master-data/unit-kerja" 
                patchUrlPrefix="/master-data/unit-kerja" 
                deleteUrlPrefix="/master-data/unit-kerja"
                columns={[
                  { header: 'Kode', accessor: 'kode_unit' }, 
                  { header: 'Nama Unit', accessor: 'nama_unit' }, 
                  { header: 'Induk', accessor: 'unitUtama', render: (item) => item.unitUtama?.nama_unit_utama }
                ]}
                FormComponent={UnitKerjaForm} 
                modalTitle="Unit Kerja" 
                idAccessor="id_unit_kerja"
                searchableColumns={['kode_unit', 'nama_unit']}
              />
            </Tab.Panel>
            
            {/* TAB 3: GEDUNG */}
            <Tab.Panel className="p-4">
              <CrudTab<Gedung>
                fetchUrl="/master-data/gedung" 
                postUrl="/master-data/gedung" 
                patchUrlPrefix="/master-data/gedung" 
                deleteUrlPrefix="/master-data/gedung"
                columns={[
                  { header: 'Kode', accessor: 'kode_gedung' }, 
                  { header: 'Nama Gedung', accessor: 'nama_gedung' }
                ]}
                FormComponent={GedungForm} 
                modalTitle="Gedung" 
                idAccessor="id_gedung"
                searchableColumns={['kode_gedung', 'nama_gedung']}
              />
            </Tab.Panel>
            
            {/* TAB 4: RUANGAN */}
            <Tab.Panel className="p-4">
              <CrudTab<Lokasi>
                fetchUrl="/master-data/lokasi" 
                postUrl="/master-data/lokasi" 
                patchUrlPrefix="/master-data/lokasi" 
                deleteUrlPrefix="/master-data/lokasi"
                columns={[
                  { header: 'Kode Ruangan', accessor: 'kode_ruangan' }, 
                  { header: 'Nama Ruangan', accessor: 'nama_ruangan' },
                  { header: 'Lantai', accessor: 'lantai' },
                  { header: 'Gedung', accessor: 'gedung', render: (item) => item.gedung?.nama_gedung },
                  { header: 'Unit Kerja', accessor: 'unitKerja', render: (item) => item.unitKerja?.nama_unit || '-' },
                ]}
                FormComponent={LokasiForm} 
                modalTitle="Lokasi/Ruangan" 
                idAccessor="id_lokasi"
                searchableColumns={['kode_ruangan', 'nama_ruangan']}
              />
            </Tab.Panel>
            
            {/* TAB 5: KATEGORI ITEM */}
            <Tab.Panel className="p-4">
              <CrudTab<KategoriItem>
                fetchUrl="/master-data/kategori-item" 
                postUrl="/master-data/kategori-item" 
                patchUrlPrefix="/master-data/kategori-item" 
                deleteUrlPrefix="/master-data/kategori-item"
                columns={[
                  { header: 'Nama Kategori', accessor: 'nama_kategori' }
                ]}
                FormComponent={KategoriItemForm} 
                modalTitle="Kategori Item" 
                idAccessor="id_kategori"
                searchableColumns={['nama_kategori']}
              />
            </Tab.Panel>
            
            {/* TAB 6: MASTER ITEM */}
            <Tab.Panel className="p-4">
              <CrudTab<MasterItem>
                fetchUrl="/master-data/master-item" 
                postUrl="/master-data/master-item" 
                patchUrlPrefix="/master-data/master-item" 
                deleteUrlPrefix="/master-data/master-item"
                columns={[
                  { header: 'Kode Item', accessor: 'kode_item' },
                  { header: 'Nama Item', accessor: 'nama_item' },
                  { header: 'Kategori', accessor: 'kategori', render: (item) => item.kategori?.nama_kategori },
                  { header: 'Metode Pelacakan', accessor: 'metode_pelacakan' },
                ]}
                FormComponent={MasterItemForm} 
                modalTitle="Master Item" 
                idAccessor="id_item"
                searchableColumns={['kode_item', 'nama_item', 'metode_pelacakan']}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}