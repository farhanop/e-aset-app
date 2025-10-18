// src/pages/AssetCreatePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTheme } from '../contexts/ThemeContext';
import { QRCodeGenerator } from '../components/forms/QRCodeGenerator';
import { Modal } from '../components/Modal';

// Tipe data untuk dropdown
interface MasterItem { 
  id_item: number; 
  nama_item: string;
  kode_item: string;
  metode_pelacakan: string;
}
interface Lokasi { 
  id_lokasi: number; 
  nama_ruangan: string;
  kode_ruangan: string;
  lantai: number;
  gedung?: {
    id_gedung: number;
    kode_gedung: string;
    nama_gedung: string;
  };
}
interface UnitKerja { 
  id_unit_kerja: number; 
  nama_unit: string;
  kode_unit: string;
  unitUtama?: {
    id_unit_utama: number;
    kode_unit_utama: string;
    nama_unit_utama: string;
  };
}

export function AssetCreatePage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_item: '',
    id_lokasi: '',
    id_unit_kerja: '',
    id_group: '',
    merk: '',
    tipe_model: '',
    spesifikasi: '',
    tgl_perolehan: '',
    sumber_dana: '',
    jumlah: 1,
    status_aset: 'Tersedia',
    kondisi_terakhir: 'Baik',
  });

  // State untuk menyimpan data dropdown
  const [items, setItems] = useState<MasterItem[]>([]);
  const [lokasi, setLokasi] = useState<Lokasi[]>([]);
  const [unitKerja, setUnitKerja] = useState<UnitKerja[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<any>(null);

  // State untuk input manual
  const [itemInput, setItemInput] = useState('');
  const [lokasiInput, setLokasiInput] = useState('');
  const [unitKerjaInput, setUnitKerjaInput] = useState('');
  const [groupInput, setGroupInput] = useState('');

  // State untuk QR Code preview
  const [qrCodePreview, setQrCodePreview] = useState<string>('');
  
  // State untuk modal sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAssetId, setCreatedAssetId] = useState<number | null>(null);
  const [createdAssetCount, setCreatedAssetCount] = useState<number>(0);

  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      setError('');
      try {
        const [itemRes, lokasiRes, unitKerjaRes] = await Promise.all([
          api.get('/master-data/master-item'),
          api.get('/master-data/lokasi'),
          api.get('/master-data/unit-kerja'),
        ]);
        
        // Filter hanya item dengan metode pelacakan Individual
        const individualItems = itemRes.data.filter((item: MasterItem) => 
          item.metode_pelacakan === 'Individual'
        );
        
        setItems(individualItems);
        setLokasi(lokasiRes.data);
        setUnitKerja(unitKerjaRes.data);
        
        if (individualItems.length === 0) {
          setError('Tidak ada item dengan metode pelacakan Individual. Silakan buat master item terlebih dahulu.');
        }
      } catch (err) {
        console.error("Gagal memuat data master:", err);
        setError('Gagal memuat data master. Silakan refresh halaman.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMasterData();
  }, []);

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setItemInput(value);
    
    // Cari item yang cocok dengan input (case-insensitive and trimmed)
    const foundItem = items.find(item => 
      `${item.kode_item} - ${item.nama_item}`.trim().toLowerCase() === value.trim().toLowerCase()
    );
    
    if (foundItem) {
      setFormData(prev => ({ ...prev, id_item: foundItem.id_item.toString() }));
    } else {
      // Jika tidak ada yang cocok, cek apakah input hanya berupa kode item
      const foundByCode = items.find(item => 
        item.kode_item.toLowerCase() === value.trim().toLowerCase()
      );
      
      if (foundByCode) {
        setFormData(prev => ({ ...prev, id_item: foundByCode.id_item.toString() }));
        setItemInput(`${foundByCode.kode_item} - ${foundByCode.nama_item}`);
      } else {
        setFormData(prev => ({ ...prev, id_item: '' }));
      }
    }
    
    // Clear field error when user starts typing
    if (fieldErrors.id_item) {
      setFieldErrors(prev => ({ ...prev, id_item: '' }));
    }
  };

  const handleLokasiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLokasiInput(value);
    
    // Cari lokasi yang cocok dengan input (case-insensitive and trimmed)
    const foundLokasi = lokasi.find(l => 
      `${l.kode_ruangan} - ${l.nama_ruangan}`.trim().toLowerCase() === value.trim().toLowerCase()
    );
    
    if (foundLokasi) {
      setFormData(prev => ({ ...prev, id_lokasi: foundLokasi.id_lokasi.toString() }));
    } else {
      // Jika tidak ada yang cocok, cek apakah input hanya berupa kode lokasi
      const foundByCode = lokasi.find(l => 
        l.kode_ruangan.toLowerCase() === value.trim().toLowerCase()
      );
      
      if (foundByCode) {
        setFormData(prev => ({ ...prev, id_lokasi: foundByCode.id_lokasi.toString() }));
        setLokasiInput(`${foundByCode.kode_ruangan} - ${foundByCode.nama_ruangan}`);
      } else {
        setFormData(prev => ({ ...prev, id_lokasi: '' }));
      }
    }
    
    // Clear field error when user starts typing
    if (fieldErrors.id_lokasi) {
      setFieldErrors(prev => ({ ...prev, id_lokasi: '' }));
    }
  };

  const handleUnitKerjaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUnitKerjaInput(value);
    
    // Cari unit kerja yang cocok dengan input (case-insensitive and trimmed)
    const foundUnitKerja = unitKerja.find(u => 
      `${u.kode_unit} - ${u.nama_unit}`.trim().toLowerCase() === value.trim().toLowerCase()
    );
    
    if (foundUnitKerja) {
      setFormData(prev => ({ ...prev, id_unit_kerja: foundUnitKerja.id_unit_kerja.toString() }));
    } else {
      // Jika tidak ada yang cocok, cek apakah input hanya berupa kode unit
      const foundByCode = unitKerja.find(u => 
        u.kode_unit.toLowerCase() === value.trim().toLowerCase()
      );
      
      if (foundByCode) {
        setFormData(prev => ({ ...prev, id_unit_kerja: foundByCode.id_unit_kerja.toString() }));
        setUnitKerjaInput(`${foundByCode.kode_unit} - ${foundByCode.nama_unit}`);
      } else {
        setFormData(prev => ({ ...prev, id_unit_kerja: '' }));
      }
    }
    
    // Clear field error when user starts typing
    if (fieldErrors.id_unit_kerja) {
      setFieldErrors(prev => ({ ...prev, id_unit_kerja: '' }));
    }
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGroupInput(value);
    setFormData(prev => ({ ...prev, id_group: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'jumlah' ? Math.max(1, parseInt(value) || 1) : value 
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePreview = () => {
    // Validasi form client-side
    const validationErrors: Record<string, string> = {};
    
    if (!formData.id_item) validationErrors.id_item = 'Jenis item wajib dipilih';
    if (!formData.id_lokasi) validationErrors.id_lokasi = 'Lokasi penempatan wajib dipilih';
    if (!formData.id_unit_kerja) validationErrors.id_unit_kerja = 'Unit penanggung jawab wajib dipilih';
    if (!formData.tgl_perolehan) validationErrors.tgl_perolehan = 'Tanggal perolehan wajib diisi';
    if (!formData.jumlah || formData.jumlah < 1) validationErrors.jumlah = 'Jumlah harus lebih dari 0';

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    // Generate preview data
    const selectedItem = items.find(item => item.id_item === Number(formData.id_item));
    const selectedLokasi = lokasi.find(l => l.id_lokasi === Number(formData.id_lokasi));
    const selectedUnitKerja = unitKerja.find(u => u.id_unit_kerja === Number(formData.id_unit_kerja));

    if (selectedItem && selectedLokasi && selectedUnitKerja) {
      const preview = {
        item: selectedItem,
        lokasi: selectedLokasi,
        unitKerja: selectedUnitKerja,
        formData,
        jumlah: Number(formData.jumlah)
      };
      setPreviewData(preview);
      
      // Generate kode aset untuk preview QR Code
      const kodeAset = `${selectedLokasi.gedung?.kode_gedung}${selectedLokasi.lantai}${selectedLokasi.kode_ruangan}/${selectedUnitKerja.unitUtama?.kode_unit_utama}.${selectedUnitKerja.kode_unit}/${selectedItem.kode_item}.1/${new Date(formData.tgl_perolehan).getFullYear()}`;
      setQrCodePreview(kodeAset);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    // Validasi form client-side
    const validationErrors: Record<string, string> = {};
    
    if (!formData.id_item) validationErrors.id_item = 'Jenis item wajib dipilih';
    if (!formData.id_lokasi) validationErrors.id_lokasi = 'Lokasi penempatan wajib dipilih';
    if (!formData.id_unit_kerja) validationErrors.id_unit_kerja = 'Unit penanggung jawab wajib dipilih';
    if (!formData.tgl_perolehan) validationErrors.tgl_perolehan = 'Tanggal perolehan wajib diisi';
    if (!formData.jumlah || formData.jumlah < 1) validationErrors.jumlah = 'Jumlah harus lebih dari 0';

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Data yang dikirim:', {
        ...formData,
        id_item: Number(formData.id_item),
        id_lokasi: Number(formData.id_lokasi),
        id_unit_kerja: Number(formData.id_unit_kerja),
        id_group: formData.id_group ? Number(formData.id_group) : null,
        jumlah: Number(formData.jumlah),
      });

      const response = await api.post('/assets', {
        ...formData,
        id_item: Number(formData.id_item),
        id_lokasi: Number(formData.id_lokasi),
        id_unit_kerja: Number(formData.id_unit_kerja),
        id_group: formData.id_group ? Number(formData.id_group) : null,
        jumlah: Number(formData.jumlah),
      });

      console.log('Response dari server:', response.data);
      
      // Ambil ID aset pertama dari response
      const firstAssetId = response.data.data[0].id_aset;
      
      // Simpan ID aset dan jumlah untuk ditampilkan di modal sukses
      setCreatedAssetId(firstAssetId);
      setCreatedAssetCount(Number(formData.jumlah));
      
      // Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Gagal membuat aset:", error);
      
      // Handle validation errors from backend
      if (error.response?.status === 400) {
        const backendErrors = error.response.data;
        
        if (backendErrors.message && Array.isArray(backendErrors.message)) {
          // Jika error berupa array dari backend (biasanya validation errors)
          const errorMessages = backendErrors.message.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.constraints) {
              return Object.values(err.constraints).join(', ');
            }
            return JSON.stringify(err);
          });
          
          setError(`Validasi gagal: ${errorMessages.join('; ')}`);
        } else if (backendErrors.message) {
          setError(backendErrors.message);
        } else {
          // Coba extract field-specific errors
          const fieldErrorMessages: Record<string, string> = {};
          if (backendErrors.errors) {
            Object.keys(backendErrors.errors).forEach(field => {
              fieldErrorMessages[field] = backendErrors.errors[field].join(', ');
            });
            setFieldErrors(fieldErrorMessages);
          } else {
            setError('Terjadi kesalahan validasi. Periksa kembali data yang dimasukkan.');
          }
        }
      } else if (error.response?.status === 500) {
        setError('Terjadi kesalahan server. Silakan coba lagi.');
      } else {
        setError('Gagal membuat aset. Periksa koneksi internet dan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAsset = () => {
    if (createdAssetId) {
      navigate(`/assets/${createdAssetId}`);
    }
  };

  const handleCreateAnother = () => {
    // Reset form
    setFormData({
      id_item: '',
      id_lokasi: '',
      id_unit_kerja: '',
      id_group: '',
      merk: '',
      tipe_model: '',
      spesifikasi: '',
      tgl_perolehan: '',
      sumber_dana: '',
      jumlah: 1,
      status_aset: 'Tersedia',
      kondisi_terakhir: 'Baik',
    });
    setItemInput('');
    setLokasiInput('');
    setUnitKerjaInput('');
    setGroupInput('');
    setPreviewData(null);
    setQrCodePreview('');
    setShowSuccessModal(false);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className={`mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Memuat data master...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === "dark" ? "bg-gray-900" : "bg-white"
    }`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}>
                Pendaftaran Aset Baru
              </h1>
              <p className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Daftarkan aset baru ke dalam sistem inventaris. QR Code akan dibuat secara otomatis.
              </p>
            </div>
            <button
              onClick={() => navigate('/assets')}
              className={`px-4 py-2 rounded-lg shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 ${
                theme === "dark" 
                  ? "bg-gray-700 text-white hover:bg-gray-600" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Manajemen Aset
            </button>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-lg border flex items-start ${
              theme === "dark" 
                ? "bg-red-900/20 border-red-800" 
                : "bg-red-50 border-red-200"
            }`}>
              <svg className={`w-5 h-5 mt-0.5 mr-2 flex-shrink-0 ${
                theme === "dark" ? "text-red-400" : "text-red-500"
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className={`font-medium ${
                  theme === "dark" ? "text-red-400" : "text-red-700"
                }`}>
                  Gagal membuat aset
                </p>
                <p className={`text-sm mt-1 ${
                  theme === "dark" ? "text-red-300" : "text-red-600"
                }`}>
                  {error}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={`p-8 rounded-lg shadow-md border space-y-8 ${
            theme === "dark" 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-100"
          }`}>
            {/* --- Dropdowns --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Jenis Item <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={itemInput} 
                  onChange={handleItemChange}
                  list="itemOptions"
                  placeholder="Ketik kode atau nama item"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    fieldErrors.id_item 
                      ? theme === "dark"
                        ? "border-red-500 bg-red-900/20 text-red-200"
                        : "border-red-300 bg-red-50 text-red-900"
                      : theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
                <datalist id="itemOptions">
                  {items.map(item => (
                    <option key={item.id_item} value={`${item.kode_item} - ${item.nama_item}`} />
                  ))}
                </datalist>
                {fieldErrors.id_item && (
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    {fieldErrors.id_item}
                  </p>
                )}
                {items.length === 0 && !fieldErrors.id_item && (
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    Tidak ada item yang tersedia. Pastikan ada master item dengan metode pelacakan Individual.
                  </p>
                )}
                <p className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  Pilih dari daftar atau ketik manual
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Lokasi Penempatan <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={lokasiInput} 
                  onChange={handleLokasiChange}
                  list="lokasiOptions"
                  placeholder="Ketik kode atau nama lokasi"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    fieldErrors.id_lokasi 
                      ? theme === "dark"
                        ? "border-red-500 bg-red-900/20 text-red-200"
                        : "border-red-300 bg-red-50 text-red-900"
                      : theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
                <datalist id="lokasiOptions">
                  {lokasi.map(l => (
                    <option key={l.id_lokasi} value={`${l.kode_ruangan} - ${l.nama_ruangan}`} />
                  ))}
                </datalist>
                {fieldErrors.id_lokasi && (
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    {fieldErrors.id_lokasi}
                  </p>
                )}
                <p className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  Pilih dari daftar atau ketik manual
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Unit Penanggung Jawab <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={unitKerjaInput} 
                  onChange={handleUnitKerjaChange}
                  list="unitKerjaOptions"
                  placeholder="Ketik kode atau nama unit"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    fieldErrors.id_unit_kerja 
                      ? theme === "dark"
                        ? "border-red-500 bg-red-900/20 text-red-200"
                        : "border-red-300 bg-red-50 text-red-900"
                      : theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
                <datalist id="unitKerjaOptions">
                  {unitKerja.map(u => (
                    <option key={u.id_unit_kerja} value={`${u.kode_unit} - ${u.nama_unit}`} />
                  ))}
                </datalist>
                {fieldErrors.id_unit_kerja && (
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    {fieldErrors.id_unit_kerja}
                  </p>
                )}
                <p className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  Pilih dari daftar atau ketik manual
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Group (Opsional)
                </label>
                <input 
                  type="text" 
                  value={groupInput} 
                  onChange={handleGroupChange}
                  list="groupOptions"
                  placeholder="Ketik nama group"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                />
                <datalist id="groupOptions">
                  <option value="Group A" />
                  <option value="Group B" />
                  <option value="Group C" />
                  <option value="Group D" />
                  <option value="Group E" />
                </datalist>
                <p className={`mt-1 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  Pilih dari daftar atau ketik manual
                </p>
              </div>
            </div>

            {/* --- Detail Aset --- */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold border-b pb-2 ${
                theme === "dark" 
                  ? "text-gray-200 border-gray-700" 
                  : "text-gray-800 border-gray-200"
              }`}>
                Detail Spesifikasi Aset
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Merk
                  </label>
                  <input 
                    type="text" 
                    name="merk" 
                    value={formData.merk} 
                    onChange={handleChange} 
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                    placeholder="Contoh: Samsung, Dell, dll."
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Tipe / Model
                  </label>
                  <input 
                    type="text" 
                    name="tipe_model" 
                    value={formData.tipe_model} 
                    onChange={handleChange} 
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                    placeholder="Contoh: Galaxy S21, Inspiron 15, dll."
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Spesifikasi Lengkap
                </label>
                <textarea 
                  name="spesifikasi" 
                  value={formData.spesifikasi} 
                  onChange={handleChange} 
                  rows={3} 
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                  placeholder="Deskripsi detail spesifikasi aset..."
                ></textarea>
              </div>
            </div>

            {/* --- Informasi Pengadaan --- */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold border-b pb-2 ${
                theme === "dark" 
                  ? "text-gray-200 border-gray-700" 
                  : "text-gray-800 border-gray-200"
              }`}>
                Informasi Pengadaan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Tanggal Perolehan <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="tgl_perolehan" 
                    value={formData.tgl_perolehan} 
                    onChange={handleChange} 
                    required 
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      fieldErrors.tgl_perolehan 
                        ? theme === "dark"
                          ? "border-red-500 bg-red-900/20 text-red-200"
                          : "border-red-300 bg-red-50 text-red-900"
                        : theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                  {fieldErrors.tgl_perolehan && (
                    <p className={`mt-1 text-sm ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`}>
                      {fieldErrors.tgl_perolehan}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Sumber Dana
                  </label>
                  <input
                    type="text" 
                    name="sumber_dana" 
                    value={formData.sumber_dana} 
                    onChange={handleChange} 
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                    placeholder="Contoh: APBN, APBD, Mandiri, dll."
                  />
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Ketik manual sumber dana aset
                  </p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Jumlah (Input Massal) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    name="jumlah" 
                    value={formData.jumlah} 
                    onChange={handleChange} 
                    min="1" 
                    max="100"
                    required 
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      fieldErrors.jumlah 
                        ? theme === "dark"
                          ? "border-red-500 bg-red-900/20 text-red-200"
                          : "border-red-300 bg-red-50 text-red-900"
                        : theme === "dark"
                          ? "border-gray-600 bg-gray-700 text-white"
                          : "border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                  {fieldErrors.jumlah && (
                    <p className={`mt-1 text-sm ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`}>
                      {fieldErrors.jumlah}
                    </p>
                  )}
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}>
                    {formData.jumlah > 1 ? `Akan dibuat ${formData.jumlah} aset dengan kode berurutan` : 'Akan dibuat 1 aset'}
                  </p>
                </div>
              </div>
            </div>

            {/* --- Status dan Kondisi --- */}
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold border-b pb-2 ${
                theme === "dark" 
                  ? "text-gray-200 border-gray-700" 
                  : "text-gray-800 border-gray-200"
              }`}>
                Status dan Kondisi
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Status Aset
                  </label>
                  <select
                    name="status_aset" 
                    value={formData.status_aset} 
                    onChange={handleChange} 
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Dipinjam">Dipinjam</option>
                    <option value="Diperbaiki">Diperbaiki</option>
                    <option value="Dihapuskan">Dihapuskan</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Kondisi Terakhir
                  </label>
                  <select
                    name="kondisi_terakhir" 
                    value={formData.kondisi_terakhir} 
                    onChange={handleChange} 
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                    <option value="Tidak Dapat Digunakan">Tidak Dapat Digunakan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* --- Preview Kode Aset --- */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-lg font-semibold border-b pb-2 ${
                  theme === "dark" 
                    ? "text-gray-200 border-gray-700" 
                    : "text-gray-800 border-gray-200"
                }`}>
                  Preview Kode Aset
                </h3>
                <button
                  type="button"
                  onClick={handlePreview}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    theme === "dark"
                      ? "bg-blue-900/30 text-blue-300 hover:bg-blue-800/40"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  Preview Kode
                </button>
              </div>
              
              {previewData && (
                <div className={`p-4 rounded-lg border ${
                  theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-100"
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className={`text-sm mb-2 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Format kode aset yang akan dihasilkan:
                      </div>
                      <div className={`font-mono text-sm p-2 rounded ${
                        theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                      }`}>
                        {previewData.lokasi.gedung?.kode_gedung}{previewData.lokasi.lantai}{previewData.lokasi.kode_ruangan}/
                        {previewData.unitKerja.unitUtama?.kode_unit_utama}.{previewData.unitKerja.kode_unit}/
                        {previewData.item.kode_item}.{previewData.jumlah > 1 ? '[1-' + previewData.jumlah + ']' : '1'}/
                        {new Date(previewData.formData.tgl_perolehan).getFullYear()}
                      </div>
                      <div className={`mt-2 text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {previewData.jumlah > 1 
                          ? `Akan dibuat ${previewData.jumlah} aset dengan kode berurutan` 
                          : 'Akan dibuat 1 aset dengan kode di atas'}
                      </div>
                    </div>
                    
                    <div>
                      <div className={`text-sm mb-2 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        Preview QR Code:
                      </div>
                      <div className="flex justify-center">
                        {qrCodePreview && (
                          <QRCodeGenerator 
                            value={qrCodePreview} 
                            size={150}
                            className="p-2 bg-white rounded-lg shadow-sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* --- Tombol Aksi --- */}
            <div className={`flex justify-end pt-6 space-x-4 border-t ${
              theme === "dark" ? "border-gray-700" : "border-gray-100"
            }`}>
              <button
                type="button"
                onClick={() => navigate('/assets')}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || items.length === 0}
                className={`px-6 py-2 rounded-lg shadow transition-colors flex items-center ${
                  isSubmitting || items.length === 0
                    ? "bg-blue-400 cursor-not-allowed"
                    : theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  `Simpan Aset ${formData.jumlah > 1 ? `(${formData.jumlah})` : ''}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Aset Berhasil Dibuat">
          <div className="p-4">
            <div className="text-center mb-6">
              <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
                theme === "dark" ? "bg-green-900/30" : "bg-green-100"
              }`}>
                <svg className={`h-8 w-8 ${
                  theme === "dark" ? "text-green-400" : "text-green-600"
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium mt-4 ${
                theme === "dark" ? "text-gray-200" : "text-gray-900"
              }`}>
                Pendaftaran Aset Berhasil!
              </h3>
              <div className={`mt-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                <p>
                  {createdAssetCount > 1 
                    ? `${createdAssetCount} aset berhasil didaftarkan ke dalam sistem.` 
                    : '1 aset berhasil didaftarkan ke dalam sistem.'}
                </p>
                <p className="mt-1">
                  QR Code telah dibuat secara otomatis untuk setiap aset.
                </p>
              </div>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleCreateAnother}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Buat Aset Lain
              </button>
              <button
                onClick={handleViewAsset}
                className={`px-4 py-2 rounded-md transition-colors ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                Lihat Detail Aset
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}