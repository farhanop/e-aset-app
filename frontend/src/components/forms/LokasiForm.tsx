// frontend/src/components/forms/LokasiForm.tsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTheme } from '../../contexts/ThemeContext';

// --- TIPE DATA ---
interface Gedung { 
  id_gedung: number; 
  nama_gedung: string; 
  kode_gedung?: string;
}
interface UnitKerja { 
  id_unit_kerja: number; 
  nama_unit: string; 
  kode_unit?: string;
}
interface LokasiData {
  id_lokasi?: number;
  kode_ruangan: string;
  nama_ruangan: string;
  lantai: number;
  id_gedung: number | null;
  id_unit_kerja: number | null;
}

// --- PROPS ---
// PERBAIKAN: Menggunakan onSave sebagai nama prop
interface LokasiFormProps {
  initialData?: LokasiData | null;
  onSave: (data: Omit<LokasiData, 'id_lokasi'>) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
}

export const LokasiForm: React.FC<LokasiFormProps> = ({
  initialData,
  onSave, // Menggunakan onSave
  isLoading,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Omit<LokasiData, 'id_lokasi'>>({
    kode_ruangan: '',
    nama_ruangan: '',
    lantai: 1,
    id_gedung: null,
    id_unit_kerja: null,
  });
  
  // State untuk data dropdown
  const [gedungList, setGedungList] = useState<Gedung[]>([]);
  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Ambil data untuk dropdown
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
        const [gedungRes, unitRes] = await Promise.all([
          api.get('/master-data/gedung'),
          api.get('/master-data/unit-kerja')
        ]);
        setGedungList(gedungRes.data.data || gedungRes.data || []);
        setUnitKerjaList(unitRes.data.data || unitRes.data || []);
      } catch (error) {
        console.error("Gagal memuat data dropdown", error);
        // Tampilkan toast error jika perlu
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDropdownData();
  }, []);

  // Isi form jika ada initialData (mode edit)
  useEffect(() => {
    if (initialData) {
      setFormData({
        kode_ruangan: initialData.kode_ruangan || '',
        nama_ruangan: initialData.nama_ruangan || '',
        lantai: initialData.lantai || 1,
        id_gedung: initialData.id_gedung || null,
        id_unit_kerja: initialData.id_unit_kerja || null,
      });
    } else {
      // Reset form jika mode create
      setFormData({ kode_ruangan: '', nama_ruangan: '', lantai: 1, id_gedung: null, id_unit_kerja: null });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: string | number | null = value;

    if (name === 'id_gedung' || name === 'id_unit_kerja') {
      finalValue = value ? parseInt(value, 10) : null;
    } else if (name === 'lantai') {
      finalValue = parseInt(value, 10) || 1;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validasi dasar
    if (!formData.id_gedung) {
      alert("Gedung wajib dipilih.");
      return;
    }
    onSave(formData); // Menggunakan onSave
  };

  // Kelas CSS yang akan digunakan berulang kali
  const labelClass = `block text-sm font-medium mb-1 ${
    theme === "dark" ? "text-gray-300" : "text-gray-700"
  }`;
  
  const inputClass = `w-full px-3 py-2 rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
    theme === "dark" 
      ? "bg-gray-700 border-gray-600 text-white" 
      : "bg-white border-gray-300 text-gray-900"
  }`;
  
  const buttonClass = `px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
    theme === "dark" 
      ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
  }`;
  
  const submitButtonClass = `px-4 py-2 rounded-md font-medium text-white transition-colors duration-200 ${
    theme === "dark" 
      ? "bg-blue-600 hover:bg-blue-700" 
      : "bg-blue-500 hover:bg-blue-600"
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Input Kode Ruangan */}
      <div>
        <label htmlFor="kode_ruangan" className={labelClass}>
          Kode Ruangan *
        </label>
        <input
          type="text"
          id="kode_ruangan"
          name="kode_ruangan"
          value={formData.kode_ruangan}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={inputClass}
          placeholder="Masukkan kode ruangan"
        />
      </div>

      {/* Input Nama Ruangan */}
      <div>
        <label htmlFor="nama_ruangan" className={labelClass}>
          Nama Ruangan *
        </label>
        <input
          type="text"
          id="nama_ruangan"
          name="nama_ruangan"
          value={formData.nama_ruangan}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={inputClass}
          placeholder="Masukkan nama ruangan"
        />
      </div>

      {/* Input Lantai */}
      <div>
        <label htmlFor="lantai" className={labelClass}>
          Lantai *
        </label>
        <input
          type="number"
          id="lantai"
          name="lantai"
          value={formData.lantai}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={inputClass}
          min="1"
        />
      </div>

      {/* Dropdown Gedung */}
      <div>
        <label htmlFor="id_gedung" className={labelClass}>
          Gedung *
        </label>
        <select
          id="id_gedung"
          name="id_gedung"
          value={formData.id_gedung || ''}
          onChange={handleChange}
          disabled={isLoading || loadingDropdowns}
          required
          className={inputClass}
        >
          <option value="">{loadingDropdowns ? 'Memuat...' : '-- Pilih Gedung --'}</option>
          {gedungList.map(gedung => (
            <option key={gedung.id_gedung} value={gedung.id_gedung}>
              {gedung.nama_gedung} {gedung.kode_gedung ? `(${gedung.kode_gedung})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown Unit Kerja (Opsional) */}
      <div>
        <label htmlFor="id_unit_kerja" className={labelClass}>
          Unit Kerja (Penanggung Jawab)
        </label>
        <select
          id="id_unit_kerja"
          name="id_unit_kerja"
          value={formData.id_unit_kerja || ''}
          onChange={handleChange}
          disabled={isLoading || loadingDropdowns}
          className={inputClass}
        >
          <option value="">{loadingDropdowns ? 'Memuat...' : '-- Pilih Unit Kerja (Opsional) --'}</option>
          {unitKerjaList.map(unit => (
            <option key={unit.id_unit_kerja} value={unit.id_unit_kerja}>
              {unit.nama_unit} {unit.kode_unit ? `(${unit.kode_unit})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Tombol Aksi */}
      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={buttonClass}
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || loadingDropdowns}
          className={submitButtonClass}
        >
          {isLoading ? 'Menyimpan...' : (initialData ? 'Update Ruangan' : 'Tambah Ruangan')}
        </button>
      </div>
    </form>
  );
};