// frontend/src/types/unitKerja.ts

export interface UnitKerja {
  id_unit_kerja: number;
  nama_unit: string;
  kode_unit: string;

  // Relasi (opsional)
  unitUtama?: {
    id_unit_utama: number;
    nama_unit_utama: string;
  };
}
