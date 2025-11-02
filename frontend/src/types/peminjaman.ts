export interface Asset {
  id_aset: string;
  kode_aset: string;
  nama_aset: string;
  kategori: string;
  status_aset: "Tersedia" | "Dipinjam" | "Rusak" | "Maintenance";
  lokasi: string;
  deskripsi?: string;
}

export interface Peminjaman {
  id_peminjaman: string;
  id_aset: string;
  aset?: Asset;
  nama_peminjam: string;
  identitas_peminjam: string;
  tgl_pinjam: string;
  tgl_rencana_kembali: string;
  tgl_aktual_kembali?: string;
  kondisi_pinjam: string;
  kondisi_kembali?: string;
  keterangan_peminjaman?: string;
  status_peminjaman: "Dipinjam" | "Dikembalikan" | "Terlambat";
}

export interface CreatePeminjamanDto {
  id_aset: string;
  nama_peminjam: string;
  identitas_peminjam: string;
  tgl_rencana_kembali: string;
  keterangan_peminjaman?: string;
}

export interface PengembalianDto {
  kondisi_kembali: string;
}
