// frontend/src/types/mutasi.ts
import { Asset } from "./asset";
import { Lokasi } from "./lokasi";
import { User } from "./User";

// Tipe data Mutasi lengkap (untuk list/detail)
export interface Mutasi {
  id_mutasi: number;
  id_aset: number;
  id_lokasi_lama: number;
  id_lokasi_baru: number;
  tgl_mutasi: string | Date;
  catatan: string;
  id_petugas: number;

  // --- RELASI (Ini yang memperbaiki error 2339) ---
  aset?: Asset;
  lokasiLama?: Lokasi;
  lokasiBaru?: Lokasi;
  petugas?: User;
}

// DTO (untuk form modal)
export interface CreateMutasiDto {
  id_aset: number;
  id_lokasi_baru: number;
  id_unit_kerja_baru?: number;
  tgl_mutasi?: string | Date;
  catatan?: string;
}

// 
export interface UpdateMutasiDto {
  id_lokasi_baru?: number;
  id_unit_kerja_baru?: number;
  tgl_mutasi?: string | Date;
  catatan?: string;
}
