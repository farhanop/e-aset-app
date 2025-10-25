// frontend/src/components/forms/GedungForm.tsx
import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTheme } from '../../contexts/ThemeContext';

interface Kampus { 
  id_kampus: number; 
  nama_kampus: string; 
  kode_kampus: string;
}

interface GedungData {
  id_gedung?: number;
  kode_gedung: string;
  nama_gedung: string;
  id_kampus?: number | null;
}

interface GedungFormProps {
  initialData?: GedungData | null;
  onSave: (data: Omit<GedungData, 'id_gedung'>) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
}

// Tipe untuk error
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const GedungForm: React.FC<GedungFormProps> = ({
  initialData,
  onSave,
  isLoading,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<Omit<GedungData, 'id_gedung'>>({
    kode_gedung: '',
    nama_gedung: '',
    id_kampus: null,
  });
  const [kampusList, setKampusList] = useState<Kampus[]>([]);
  const [loadingKampus, setLoadingKampus] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchKampus = async () => {
      setLoadingKampus(true);
      try {
        console.log('Fetching kampus data...');
        const response = await api.get('/master-data/kampus');
        console.log('Kampus response:', response.data);
        
        // Pastikan response.data.data ada, jika tidak, gunakan response.data langsung
        const kampusData = response.data.data || response.data || [];
        console.log('Processed kampus data:', kampusData);
        
        setKampusList(kampusData);
      } catch (error) {
        console.error("Gagal mengambil data kampus:", error);
        // Tambahkan handling error yang lebih baik
        setErrors({
          id_kampus: 'Gagal memuat data kampus. Silakan coba lagi.'
        });
      } finally {
        setLoadingKampus(false);
      }
    };

    fetchKampus();
  }, []);

  useEffect(() => {
    if (initialData) {
      console.log('Setting initial data:', initialData);
      setFormData({
        kode_gedung: initialData.kode_gedung || '',
        nama_gedung: initialData.nama_gedung || '',
        id_kampus: initialData.id_kampus || null,
      });
    } else {
       setFormData({ kode_gedung: '', nama_gedung: '', id_kampus: null });
    }
    // Reset errors when initialData changes
    setErrors({});
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`handleChange: ${name} = ${value}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'id_kampus' ? (value ? parseInt(value, 10) : null) : value
    }));
    
    // Clear error when user changes selection
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.kode_gedung.trim()) {
      newErrors.kode_gedung = 'Kode gedung wajib diisi';
    }
    
    if (!formData.nama_gedung.trim()) {
      newErrors.nama_gedung = 'Nama gedung wajib diisi';
    }
    
    if (!formData.id_kampus) {
      newErrors.id_kampus = 'Kampus wajib dipilih';
    }
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (validateForm()) {
      try {
        await onSave(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
        
        // Tambahkan handling error yang lebih baik dengan tipe yang jelas
        const apiError = error as ApiError;
        
        if (apiError.response?.data?.message) {
          // Handle API errors
          setErrors({
            submit: apiError.response.data.message
          });
        } else if (apiError.message) {
          // Handle network errors
          setErrors({
            submit: apiError.message
          });
        } else {
          // Handle unknown errors
          setErrors({
            submit: 'Terjadi kesalahan jaringan. Silakan coba lagi.'
          });
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="kode_gedung" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Kode Gedung *
        </label>
        <input 
          type="text" 
          id="kode_gedung" 
          name="kode_gedung" 
          value={formData.kode_gedung} 
          onChange={handleChange} 
          maxLength={20} 
          disabled={isLoading} 
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.kode_gedung
              ? theme === 'dark'
                ? 'bg-red-900/20 border-red-500 text-red-200'
                : 'bg-red-50 border-red-300 text-red-900'
              : theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
          } border`}
        />
        {errors.kode_gedung && (
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            {errors.kode_gedung}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="nama_gedung" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Nama Gedung *
        </label>
        <input 
          type="text" 
          id="nama_gedung" 
          name="nama_gedung" 
          value={formData.nama_gedung} 
          onChange={handleChange} 
          maxLength={100} 
          disabled={isLoading} 
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.nama_gedung
              ? theme === 'dark'
                ? 'bg-red-900/20 border-red-500 text-red-200'
                : 'bg-red-50 border-red-300 text-red-900'
              : theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
          } border`}
        />
        {errors.nama_gedung && (
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            {errors.nama_gedung}
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="id_kampus" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Lokasi *
        </label>
        <select
          id="id_kampus"
          name="id_kampus"
          value={formData.id_kampus || ''}
          onChange={handleChange}
          disabled={isLoading || loadingKampus}
          className={`block w-full rounded-md shadow-sm sm:text-sm ${
            errors.id_kampus
              ? theme === 'dark'
                ? 'bg-red-900/20 border-red-500 text-red-200'
                : 'bg-red-50 border-red-300 text-red-900'
              : theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500'
          } border`}
        >
          <option value="">{loadingKampus ? 'Memuat kampus...' : '-- Pilih Kampus --'}</option>
          {kampusList.length > 0 ? (
            kampusList.map(kampus => (
              <option key={kampus.id_kampus} value={kampus.id_kampus}>
                {kampus.kode_kampus} - {kampus.nama_kampus}
              </option>
            ))
          ) : (
            <option value="" disabled>Tidak ada data kampus</option>
          )}
        </select>
        {errors.id_kampus && (
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            {errors.id_kampus}
          </p>
        )}
        {errors.submit && (
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            {errors.submit}
          </p>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isLoading} 
            className={`px-4 py-2 text-sm font-medium rounded-md border ${
              theme === 'dark' 
                ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border-gray-500' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
            }`}
          >
            Batal
          </button>
        )}
        <button 
          type="submit" 
          disabled={isLoading} 
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${
            isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Menyimpan...' : (initialData ? 'Update Gedung' : 'Tambah Gedung')}
        </button>
      </div>
    </form>
  );
};