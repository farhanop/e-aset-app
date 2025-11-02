// src/types/pemusnahan.ts
export interface Asset {
  id_aset: string;
  kode_aset: string;
  nama_aset: string;
  kategori: string;
  status_aset: "Tersedia" | "Dipinjam" | "Rusak" | "Maintenance";
  lokasi: string;
  deskripsi?: string;
}

export interface Pemusnahan {
  id_pemusnahan: number;
  id_aset: number;
  aset?: Asset;
  tgl_pemusnahan: string;
  metode_pemusnahan:
    | "Dibakar"
    | "Ditumpuk"
    | "Dipotong"
    | "Dileburkan"
    | "Lainnya";
  alasan_pemusnahan: string;
  no_surat_persetujuan?: string;
  id_petugas_pemusnahan: number;
}

export interface CreatePemusnahanDto {
  id_aset: number;
  tgl_pemusnahan: string;
  metode_pemusnahan:
    | "Dibakar"
    | "Ditumpuk"
    | "Dipotong"
    | "Dileburkan"
    | "Lainnya";
  alasan_pemusnahan: string;
  no_surat_persetujuan?: string;
  id_petugas_pemusnahan: number;
}

export interface UpdatePemusnahanDto extends Partial<CreatePemusnahanDto> {}
