// 
import React, { useState, useEffect } from 'react';
import Select, { StylesConfig, GroupBase } from 'react-select';
import api from '../../api/axios';
import { useTheme } from '../../contexts/ThemeContext';

// --- Tipe Data ---
interface SelectOption { value: string; label: string; }
interface Kampus { id_kampus: number; nama_kampus: string; }
interface Gedung { id_gedung: number; nama_gedung: string; }
interface UnitKerja { id_unit_kerja: number; nama_unit: string; }
interface Lokasi { id_lokasi: number; nama_ruangan: string; }

// --- Props ---
interface LocationFilterProps {
  selectedKampus: string;
  selectedGedung: string;
  selectedUnitKerja: string;
  selectedLokasi: string;
  onKampusChange: (id: string) => void;
  onGedungChange: (id: string) => void;
  onUnitKerjaChange: (id: string) => void;
  onLokasiChange: (id: string) => void;
  error?: string;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  selectedKampus, selectedGedung, selectedUnitKerja, selectedLokasi,
  onKampusChange, onGedungChange, onUnitKerjaChange, onLokasiChange,
  error
}) => {
  const { theme } = useTheme();

  const [kampusOptions, setKampusOptions] = useState<SelectOption[]>([]);
  const [gedungOptions, setGedungOptions] = useState<SelectOption[]>([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState<SelectOption[]>([]);
  const [lokasiOptions, setLokasiOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState({ kampus: false, gedung: false, unitKerja: false, lokasi: false });

  const selectStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '42px',
      backgroundColor: theme === 'dark' ? '#374151' : '#fff',
      borderColor: error ? '#ef4444' : (state.isFocused ? '#3b82f6' : (theme === 'dark' ? '#4b5563' : '#d1d5db')),
      '&:hover': { borderColor: error ? '#ef4444' : '#3b82f6' },
      boxShadow: state.isFocused ? `0 0 0 1px ${error ? '#ef4444' : '#3b82f6'}` : provided.boxShadow,
    }),
    menu: (provided) => ({ ...provided, backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', zIndex: 20 }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? (theme === 'dark' ? '#4b5563' : '#e5e7eb') : 'transparent', color: state.isSelected ? '#fff' : (theme === 'dark' ? '#e5e7eb' : '#1f2937') }),
    singleValue: (provided) => ({ ...provided, color: theme === 'dark' ? '#e5e7eb' : '#1f2937' }),
    input: (provided) => ({ ...provided, color: theme === 'dark' ? '#e5e7eb' : '#1f2937' }),
    placeholder: (provided) => ({ ...provided, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }),
  };

  // 1. Ambil data Kampus
  useEffect(() => {
    setLoading(prev => ({ ...prev, kampus: true }));
    api.get('/master-data/kampus')
      .then(res => setKampusOptions((res.data.data || []).map((k: Kampus) => ({ value: k.id_kampus.toString(), label: k.nama_kampus }))))
      .catch(err => console.error("Gagal ambil kampus", err))
      .finally(() => setLoading(prev => ({ ...prev, kampus: false })));
  }, []);

  // 2. Ambil data Gedung
  useEffect(() => {
    setGedungOptions([]);
    if (!selectedKampus) return;
    setLoading(prev => ({ ...prev, gedung: true }));
    api.get(`/master-data/gedung/by-kampus/${selectedKampus}`)
      .then(res => setGedungOptions((res.data.data || []).map((g: Gedung) => ({ value: g.id_gedung.toString(), label: g.nama_gedung }))))
      .catch(err => { console.error("Gagal ambil gedung", err); setGedungOptions([]); })
      .finally(() => setLoading(prev => ({ ...prev, gedung: false })));
  }, [selectedKampus]);

  // 3. Ambil data Unit Kerja (ALUR BENAR)
  useEffect(() => {
    setUnitKerjaOptions([]);
    if (!selectedGedung) return;
    setLoading(prev => ({ ...prev, unitKerja: true }));
    api.get(`/master-data/unit-kerja/by-gedung/${selectedGedung}`)
      .then(res => setUnitKerjaOptions((res.data.data || []).map((u: UnitKerja) => ({ value: u.id_unit_kerja.toString(), label: u.nama_unit }))))
      .catch(err => { console.error("Gagal ambil unit kerja", err); setUnitKerjaOptions([]); })
      .finally(() => setLoading(prev => ({ ...prev, unitKerja: false })));
  }, [selectedGedung]);

  // 4. Ambil data Lokasi/Ruangan (ALUR BENAR)
  useEffect(() => {
    setLokasiOptions([]);
    if (!selectedGedung || !selectedUnitKerja) return;
    setLoading(prev => ({ ...prev, lokasi: true }));
    api.get('/master-data/lokasi/by-gedung-unit', { params: { gedungId: selectedGedung, unitKerjaId: selectedUnitKerja }})
      .then(res => setLokasiOptions((res.data.data || []).map((l: Lokasi) => ({ value: l.id_lokasi.toString(), label: l.nama_ruangan }))))
      .catch(err => { console.error("Gagal ambil lokasi", err); setLokasiOptions([]); })
      .finally(() => setLoading(prev => ({ ...prev, lokasi: false })));
  }, [selectedGedung, selectedUnitKerja]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KAMPUS */}
      <div>
        <label className="block text-sm font-medium mb-2">Kampus <span className="text-red-500">*</span></label>
        <Select<SelectOption> options={kampusOptions} value={kampusOptions.find(o => o.value === selectedKampus) || null} onChange={opt => onKampusChange(opt?.value || '')} isDisabled={loading.kampus} placeholder={loading.kampus ? "Memuat..." : "Pilih Kampus"} styles={selectStyles} isClearable />
      </div>
      {/* GEDUNG */}
      <div>
        <label className="block text-sm font-medium mb-2">Gedung <span className="text-red-500">*</span></label>
        <Select<SelectOption> options={gedungOptions} value={gedungOptions.find(o => o.value === selectedGedung) || null} onChange={opt => onGedungChange(opt?.value || '')} isDisabled={!selectedKampus || loading.gedung} placeholder={loading.gedung ? "Memuat..." : "Pilih Gedung"} styles={selectStyles} isClearable />
      </div>
      {/* UNIT KERJA (BUKAN LANTAI) */}
      <div>
        <label className="block text-sm font-medium mb-2">Unit Kerja <span className="text-red-500">*</span></label>
        <Select<SelectOption> options={unitKerjaOptions} value={unitKerjaOptions.find(o => o.value === selectedUnitKerja) || null} onChange={opt => onUnitKerjaChange(opt?.value || '')} isDisabled={!selectedGedung || loading.unitKerja} placeholder={loading.unitKerja ? "Memuat..." : "Pilih Unit"} styles={selectStyles} isClearable />
      </div>
      {/* LOKASI/RUANGAN */}
      <div>
        <label className="block text-sm font-medium mb-2">Ruangan <span className="text-red-500">*</span></label>
        <Select<SelectOption> options={lokasiOptions} value={lokasiOptions.find(o => o.value === selectedLokasi) || null} onChange={opt => onLokasiChange(opt?.value || '')} isDisabled={!selectedGedung || !selectedUnitKerja || loading.lokasi} placeholder={loading.lokasi ? "Memuat..." : "Pilih Ruangan"} styles={selectStyles} isClearable />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};

