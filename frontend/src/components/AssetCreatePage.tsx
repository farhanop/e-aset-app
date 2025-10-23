// src/pages/AssetCreatePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, { StylesConfig } from 'react-select';
import api from '../api/axios';
import { useTheme } from '../contexts/ThemeContext';
import { QRCodeGenerator } from './qr/QRCodeGenerator';
import { Modal } from '../components/Modal';

// Tipe data untuk dropdown
interface MasterItem { 
  id_item: number; 
  nama_item: string;
  kode_item: string;
  metode_pelacakan: string;
  id_kategori?: number; // some responses include this
  kategori?: { id_kategori: number; nama_kategori: string };
}
interface Kampus { 
  id_kampus: number; 
  nama_kampus: string;
  kode_kampus: string;
}
interface Gedung { 
  id_gedung: number; 
  nama_gedung: string;
  kode_gedung: string;
  id_kampus: number;
}
interface Lokasi { 
  id_lokasi: number; 
  nama_ruangan: string;
  kode_ruangan: string;
  lantai: number;
  id_gedung: number;
  id_unit_kerja?: number;
}
interface UnitKerja { 
  id_unit_kerja: number; 
  nama_unit: string;
  kode_unit: string;
  id_unit_utama: number;
  unitUtama?: {
    id_unit_utama: number;
    kode_unit_utama: string;
    nama_unit_utama: string;
  };
}

// Tipe untuk opsi react-select
interface SelectOption {
  value: string;
  label: string;
  data?: any;
}

export function AssetCreatePage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_item: '',
    id_kampus: '',
    id_gedung: '',
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
  const [kampus, setKampus] = useState<Kampus[]>([]);
  const [gedung, setGedung] = useState<Gedung[]>([]);
  const [lokasi, setLokasi] = useState<Lokasi[]>([]);
  const [unitKerja, setUnitKerja] = useState<UnitKerja[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<any>(null);
  // State untuk foto barang
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>('');

  // State untuk QR Code preview
  const [qrCodePreview, setQrCodePreview] = useState<string>('');
  
  // State untuk modal sukses
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAssetId, setCreatedAssetId] = useState<number | null>(null);
  const [createdAssetCount, setCreatedAssetCount] = useState<number>(0);
  const [createdAssetPhotoUrl, setCreatedAssetPhotoUrl] = useState<string>('');

  // Opsi untuk react-select
  const [itemOptions, setItemOptions] = useState<SelectOption[]>([]);
  const [kampusOptions, setKampusOptions] = useState<SelectOption[]>([]);
  const [gedungOptions, setGedungOptions] = useState<SelectOption[]>([]);
  const [lokasiOptions, setLokasiOptions] = useState<SelectOption[]>([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState<SelectOption[]>([]);
  const [groupOptions] = useState<SelectOption[]>([
    { value: 'Group A', label: 'Group A' },
    { value: 'Group B', label: 'Group B' },
    { value: 'Group C', label: 'Group C' },
    { value: 'Group D', label: 'Group D' },
    { value: 'Group E', label: 'Group E' },
  ]);

  // Custom styles untuk react-select berdasarkan tema
  const selectStyles: StylesConfig<SelectOption, false> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
      borderColor: fieldErrors.id_item ? '#ef4444' : theme === 'dark' ? '#4b5563' : '#d1d5db',
      color: theme === 'dark' ? '#fff' : '#1f2937',
      '&:hover': {
        borderColor: '#3b82f6',
      },
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : provided.boxShadow,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
        ? theme === 'dark' ? '#374151' : '#f3f4f6'
        : 'transparent',
      color: state.isSelected
        ? '#fff'
        : theme === 'dark' ? '#fff' : '#1f2937',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#fff' : '#1f2937',
    }),
    input: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#fff' : '#1f2937',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    }),
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      setError('');
      try {
        // Menggunakan endpoint yang benar
        // Fetch items, kampus and kategori in parallel
        const [itemRes, kampusRes, kategoriRes] = await Promise.all([
          api.get('/master-data/master-item'),
          api.get('/master-data/kampus'), // Menggunakan endpoint /master-data/kampus
          api.get('/master-data/kategori-item'),
        ]);

        // Normalize responses (some endpoints return { data: [...] })
        const itemsData: any[] = itemRes.data?.data ?? itemRes.data ?? [];
        const kampusData: any[] = kampusRes.data?.data ?? kampusRes.data ?? [];
        const kategoriList: any[] = kategoriRes.data?.data ?? kategoriRes.data ?? [];

        // Filter hanya item dengan metode pelacakan Individual
        const individualItems = itemsData.filter((item: MasterItem) => 
          item.metode_pelacakan === 'Individual'
        ).map((it: any) => {
          // Attach kategori object if available. Support multiple possible id field names.
          const itemCategoryId = it.id_kategori ?? it.id_kategori_item ?? it.idKategori ?? null;
          const kat = itemCategoryId != null ? kategoriList.find((k: any) => Number(k.id_kategori) === Number(itemCategoryId)) : undefined;
          return { ...it, id_kategori: itemCategoryId, kategori: kat };
        });
        setItems(individualItems);
        setKampus(kampusData);
        
        // Format options untuk react-select
        setItemOptions(individualItems.map(item => ({
          value: item.id_item.toString(),
          label: `${item.kode_item} - ${item.nama_item}${item.kategori ? ` (${item.kategori.nama_kategori})` : ''}`,
          data: item
        })));
        
        setKampusOptions(kampusData.map((k: Kampus) => ({
          value: k.id_kampus.toString(),
          label: `${k.kode_kampus} - ${k.nama_kampus}`,
          data: k
        })));
        
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

  // Fetch gedung berdasarkan kampus yang dipilih
  useEffect(() => {
    if (!formData.id_kampus) {
      setGedung([]);
      setGedungOptions([]);
      return;
    }
    
    const fetchGedung = async () => {
      try {
        // Menggunakan endpoint yang benar
        const response = await api.get<Gedung[]>(`/master-data/gedung/by-kampus/${formData.id_kampus}`);
        setGedung(response.data);
        setGedungOptions(response.data.map(g => ({
          value: g.id_gedung.toString(),
          label: `${g.kode_gedung} - ${g.nama_gedung}`,
          data: g
        })));
      } catch (err) {
        console.error("Gagal memuat data gedung:", err);
        setGedung([]);
        setGedungOptions([]);
      }
    };
    
    fetchGedung();
  }, [formData.id_kampus]);

  // Fetch lokasi berdasarkan gedung yang dipilih
  useEffect(() => {
    if (!formData.id_gedung) {
      setLokasi([]);
      setLokasiOptions([]);
      return;
    }
    
    const fetchLokasi = async () => {
      try {
        // Menggunakan endpoint yang benar
        const response = await api.get<Lokasi[]>(`/master-data/lokasi/by-gedung/${formData.id_gedung}`);
        setLokasi(response.data);
        setLokasiOptions(response.data.map(l => ({
          value: l.id_lokasi.toString(),
          label: `Lantai ${l.lantai} - ${l.kode_ruangan} - ${l.nama_ruangan}`,
          data: l
        })));
      } catch (err) {
        console.error("Gagal memuat data lokasi:", err);
        setLokasi([]);
        setLokasiOptions([]);
      }
    };
    
    fetchLokasi();
  }, [formData.id_gedung]);

  // Fetch unit kerja
  useEffect(() => {
    const fetchUnitKerja = async () => {
      try {
        const response = await api.get<UnitKerja[]>('/master-data/unit-kerja');
        setUnitKerja(response.data);
        setUnitKerjaOptions(response.data.map(u => ({
          value: u.id_unit_kerja.toString(),
          label: `${u.kode_unit} - ${u.nama_unit}`,
          data: u
        })));
      } catch (err) {
        console.error("Gagal memuat data unit kerja:", err);
        setUnitKerja([]);
        setUnitKerjaOptions([]);
      }
    };
    
    fetchUnitKerja();
  }, []);

  const handleItemChange = (selected: SelectOption | null) => {
    setFormData(prev => ({ ...prev, id_item: selected?.value || '' }));
    
    // Clear field error when user selects an item
    if (fieldErrors.id_item) {
      setFieldErrors(prev => ({ ...prev, id_item: '' }));
    }
  };

  const handleKampusChange = (selected: SelectOption | null) => {
    setFormData(prev => ({ 
      ...prev, 
      id_kampus: selected?.value || '',
      id_gedung: '',
      id_lokasi: ''
    }));
    
    // Clear field error when user selects a kampus
    if (fieldErrors.id_kampus) {
      setFieldErrors(prev => ({ ...prev, id_kampus: '' }));
    }
  };

  const handleGedungChange = (selected: SelectOption | null) => {
    setFormData(prev => ({ 
      ...prev, 
      id_gedung: selected?.value || '',
      id_lokasi: ''
    }));
    
    // Clear field error when user selects a gedung
    if (fieldErrors.id_gedung) {
      setFieldErrors(prev => ({ ...prev, id_gedung: '' }));
    }
  };

  const handleLokasiChange = (selected: SelectOption | null) => {
    setFormData(prev => ({ ...prev, id_lokasi: selected?.value || '' }));
    
    // Clear field error when user selects a location
    if (fieldErrors.id_lokasi) {
      setFieldErrors(prev => ({ ...prev, id_lokasi: '' }));
    }
  };

  const handleUnitKerjaChange = (selected: SelectOption | null) => {
    setFormData(prev => ({ ...prev, id_unit_kerja: selected?.value || '' }));
    
    // Clear field error when user selects a unit
    if (fieldErrors.id_unit_kerja) {
      setFieldErrors(prev => ({ ...prev, id_unit_kerja: '' }));
    }
  };

  const handleGroupChange = (selected: SelectOption | null) => {
    setFormData(prev => ({ ...prev, id_group: selected?.value || '' }));
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
    if (!formData.id_kampus) validationErrors.id_kampus = 'Kampus wajib dipilih';
    if (!formData.id_gedung) validationErrors.id_gedung = 'Gedung wajib dipilih';
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
    const selectedKampus = kampus.find(k => k.id_kampus === Number(formData.id_kampus));
    const selectedGedung = gedung.find(g => g.id_gedung === Number(formData.id_gedung));
    const selectedLokasi = lokasi.find(l => l.id_lokasi === Number(formData.id_lokasi));
    const selectedUnitKerja = unitKerja.find(u => u.id_unit_kerja === Number(formData.id_unit_kerja));

    if (selectedItem && selectedKampus && selectedGedung && selectedLokasi && selectedUnitKerja) {
      const preview = {
        item: selectedItem,
        kampus: selectedKampus,
        gedung: selectedGedung,
        lokasi: selectedLokasi,
        unitKerja: selectedUnitKerja,
        formData,
        jumlah: Number(formData.jumlah)
      };
      setPreviewData(preview);
      
      // Generate kode aset untuk preview QR Code
      const kodeAset = `${selectedKampus.kode_kampus}${selectedGedung.kode_gedung}${selectedLokasi.lantai}${selectedLokasi.kode_ruangan}/${selectedUnitKerja.unitUtama?.kode_unit_utama}.${selectedUnitKerja.kode_unit}/${selectedItem.kode_item}.1/${new Date(formData.tgl_perolehan).getFullYear()}`;
      setQrCodePreview(kodeAset);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    // Revoke previous preview URL if any
    if (photoPreviewUrl) {
      try { URL.revokeObjectURL(photoPreviewUrl); } catch (err) {}
    }

    if (!file) {
      setSelectedPhoto(null);
      setPhotoPreviewUrl('');
      return;
    }

  // Client-side validation: only images, max 50MB
  const maxSize = 50 * 1024 * 1024; // 50MB
    if (!file.type.startsWith('image/')) {
      setSelectedPhoto(null);
      setPhotoPreviewUrl('');
      setError('Format file tidak didukung. Pilih file gambar (jpg/png/gif).');
      return;
    }
    if (file.size > maxSize) {
      setSelectedPhoto(null);
      setPhotoPreviewUrl('');
      setError('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setError('');
    setSelectedPhoto(file);
    const url = URL.createObjectURL(file);
    setPhotoPreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    // Validasi form client-side
    const validationErrors: Record<string, string> = {};
    
    if (!formData.id_item) validationErrors.id_item = 'Jenis item wajib dipilih';
    if (!formData.id_kampus) validationErrors.id_kampus = 'Kampus wajib dipilih';
    if (!formData.id_gedung) validationErrors.id_gedung = 'Gedung wajib dipilih';
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
        id_kampus: Number(formData.id_kampus),
        id_gedung: Number(formData.id_gedung),
        id_lokasi: Number(formData.id_lokasi),
        id_unit_kerja: Number(formData.id_unit_kerja),
        id_group: formData.id_group ? Number(formData.id_group) : null,
        jumlah: Number(formData.jumlah),
      });

      // If a photo is selected, upload it first to get path
      let fotoPath: string | undefined = undefined;
      if (selectedPhoto) {
        const form = new FormData();
        form.append('file', selectedPhoto);
        try {
          const uploadRes = await api.post('/assets/upload', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          // backend returns { message, url, filename }
          // Prefer explicit url, fallback to filename
          const returnedUrl = uploadRes.data?.url;
          const returnedFilename = uploadRes.data?.filename;
          if (returnedUrl && typeof returnedUrl === 'string') {
            fotoPath = returnedUrl;
          } else if (returnedFilename && typeof returnedFilename === 'string') {
            fotoPath = `/uploads/foto-barang/${returnedFilename}`;
          } else {
            fotoPath = undefined;
          }
          // Convert to absolute URL for frontend image rendering
          if (fotoPath && fotoPath.startsWith('/')) {
            const base = api.defaults.baseURL || '';
            fotoPath = `${base}${fotoPath}`;
          }
        } catch (err) {
          console.error('Gagal upload foto:', err);
          setError('Gagal mengunggah foto. Silakan coba lagi.');
          setIsSubmitting(false);
          return;
        }
      }

      const response = await api.post('/assets', {
        ...formData,
        id_item: Number(formData.id_item),
        id_kampus: Number(formData.id_kampus),
        id_gedung: Number(formData.id_gedung),
        id_lokasi: Number(formData.id_lokasi),
        id_unit_kerja: Number(formData.id_unit_kerja),
        id_group: formData.id_group ? Number(formData.id_group) : null,
        jumlah: Number(formData.jumlah),
        foto_barang: fotoPath,
      });

      console.log('Response dari server:', response.data);
      
  // Ambil ID aset pertama dari response
  const firstAsset = response.data.data && response.data.data[0] ? response.data.data[0] : null;
  const firstAssetId = firstAsset ? firstAsset.id_aset : null;
      let fotoPathFromResponse = firstAsset?.foto_barang || '';
      // Convert response foto path to absolute URL if it's relative
      if (fotoPathFromResponse && fotoPathFromResponse.startsWith('/')) {
        const base = api.defaults.baseURL || '';
        fotoPathFromResponse = `${base}${fotoPathFromResponse}`;
      }
      
  // Simpan ID aset, jumlah, and foto untuk ditampilkan di modal sukses
  if (firstAssetId) setCreatedAssetId(firstAssetId);
  setCreatedAssetCount(Number(formData.jumlah));
  setCreatedAssetPhotoUrl(fotoPathFromResponse || '');
      
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
      id_kampus: '',
      id_gedung: '',
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
    setPreviewData(null);
    setQrCodePreview('');
    if (photoPreviewUrl) {
      try { URL.revokeObjectURL(photoPreviewUrl); } catch (err) {}
    }
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
                Daftarkan aset baru ke dalam sistem inventaris
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
                <Select
                  options={itemOptions}
                  value={itemOptions.find(opt => opt.value === formData.id_item)}
                  onChange={handleItemChange}
                  placeholder="Pilih jenis item"
                  isClearable
                  isSearchable
                  styles={selectStyles}
                  className={fieldErrors.id_item ? 'react-select-error' : ''}
                />
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
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <Select
                  options={kampusOptions}
                  value={kampusOptions.find(opt => opt.value === formData.id_kampus)}
                  onChange={handleKampusChange}
                  placeholder="Pilih Lokasi"
                  isClearable
                  isSearchable
                  styles={selectStyles}
                  className={fieldErrors.id_kampus ? 'react-select-error' : ''}
                />
                {fieldErrors.id_kampus && (
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    {fieldErrors.id_kampus}
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Gedung <span className="text-red-500">*</span>
                </label>
                <Select
                  options={gedungOptions}
                  value={gedungOptions.find(opt => opt.value === formData.id_gedung)}
                  onChange={handleGedungChange}
                  placeholder="Pilih gedung"
                  isClearable
                  isSearchable
                  isDisabled={!formData.id_kampus}
                  styles={selectStyles}
                  className={fieldErrors.id_gedung ? 'react-select-error' : ''}
                />
                {fieldErrors.id_gedung && (
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    {fieldErrors.id_gedung}
                  </p>
                )}
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Lantai/Ruangan <span className="text-red-500">*</span>
                </label>
                <Select
                  options={lokasiOptions}
                  value={lokasiOptions.find(opt => opt.value === formData.id_lokasi)}
                  onChange={handleLokasiChange}
                  placeholder="Pilih ruangan"
                  isClearable
                  isSearchable
                  isDisabled={!formData.id_gedung}
                  styles={selectStyles}
                  className={fieldErrors.id_lokasi ? 'react-select-error' : ''}
                />
                {fieldErrors.id_lokasi && (
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    {fieldErrors.id_lokasi}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Unit Kerja <span className="text-red-500">*</span>
                </label>
                <Select
                  options={unitKerjaOptions}
                  value={unitKerjaOptions.find(opt => opt.value === formData.id_unit_kerja)}
                  onChange={handleUnitKerjaChange}
                  placeholder="Pilih unit kerja"
                  isClearable
                  isSearchable
                  styles={selectStyles}
                  className={fieldErrors.id_unit_kerja ? 'react-select-error' : ''}
                />
                {fieldErrors.id_unit_kerja && (
                  <p className={`mt-1 text-sm ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    {fieldErrors.id_unit_kerja}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Group (Opsional)
                </label>
                <Select
                  options={groupOptions}
                  value={groupOptions.find(opt => opt.value === formData.id_group)}
                  onChange={handleGroupChange}
                  placeholder="Pilih group"
                  isClearable
                  isSearchable
                  styles={selectStyles}
                />
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

              {/* Photo upload */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Foto Barang (opsional)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block"
                  />
                  {photoPreviewUrl && (
                    <img src={photoPreviewUrl} alt="Preview foto" className="h-20 w-20 object-cover rounded border" />
                  )}
                </div>
                <p className={`mt-1 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Maks 50MB. Format: jpg, jpeg, png, gif.
                </p>
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
                        {previewData.kampus.kode_kampus}{previewData.gedung.kode_gedung}{previewData.lokasi.lantai}{previewData.lokasi.kode_ruangan}/
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
                          <div className="space-y-2">
                            {photoPreviewUrl && (
                              <img src={photoPreviewUrl} alt="Preview foto" className="h-28 w-28 object-cover rounded shadow-sm mx-auto" />
                            )}
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
                {createdAssetPhotoUrl && (
                  <div className="mt-4">
                    <div className="text-sm mb-1">Foto Barang:</div>
                    <img src={createdAssetPhotoUrl} alt="Foto aset" className="mx-auto h-28 w-28 object-cover rounded" />
                  </div>
                )}
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