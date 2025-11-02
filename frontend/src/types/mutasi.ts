// src/types/mutasi.ts

export interface Asset {
  id_aset: string;
  kode_aset: string;
  nama_aset: string;
  kategori: string;
  status_aset: "Tersedia" | "Dipinjam" | "Rusak" | "Maintenance";
  lokasi: string;
  deskripsi?: string;
}

export interface Mutasi {
  id_mutasi: number;
  id_aset: number;
  aset?: Asset;
  id_lokasi_lama: number;
  id_lokasi_baru: number;
  tgl_mutasi: string;
  catatan?: string;
  id_petugas: number;
}

export interface CreateMutasiDto {
  id_aset: number;
  id_lokasi_lama: number;
  id_lokasi_baru: number;
  tgl_mutasi: string;
  catatan?: string;
  id_petugas: number;
}

export interface UpdateMutasiDto extends Partial<CreateMutasiDto> {}
