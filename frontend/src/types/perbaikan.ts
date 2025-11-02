// src/types/perbaikan.ts
export interface Asset {
  id_aset: string;
  kode_aset: string;
  nama_aset: string;
  kategori: string;
  status_aset: "Tersedia" | "Dipinjam" | "Rusak" | "Maintenance";
  lokasi: string;
  deskripsi?: string;
}

export interface Perbaikan {
  id_perbaikan: number;
  id_aset: number;
  aset?: Asset;
  tgl_lapor_rusak: string;
  deskripsi_kerusakan: string;
  id_pelapor: number;
  tindakan_perbaikan?: string;
  biaya_perbaikan?: number;
  tgl_selesai_perbaikan?: string;
  status_perbaikan:
    | "Dilaporkan"
    | "Proses Perbaikan"
    | "Selesai"
    | "Tidak Bisa Diperbaiki";
}

export interface CreatePerbaikanDto {
  id_aset: number;
  tgl_lapor_rusak: string;
  deskripsi_kerusakan: string;
  id_pelapor: number;
  tindakan_perbaikan?: string;
  biaya_perbaikan?: number;
  tgl_selesai_perbaikan?: string;
  status_perbaikan?:
    | "Dilaporkan"
    | "Proses Perbaikan"
    | "Selesai"
    | "Tidak Bisa Diperbaiki";
}

export interface UpdatePerbaikanDto extends Partial<CreatePerbaikanDto> {}
