// frontend\src\types\peminjaman.ts
export interface Asset {
  id_aset: number; // Ubah dari string ke number
  kode_aset: string;
  nama_aset: string;
  kategori: string;
  status_aset: "Tersedia" | "Dipinjam" | "Rusak" | "Maintenance";
  lokasi: string;
  deskripsi?: string;
}

export interface Peminjaman {
  id_peminjaman: number; // Ubah dari string ke number
  id_aset: number; // Ubah dari string ke number
  aset?: Asset;
  nama_peminjam: string;
  identitas_peminjam: string;
  tgl_pinjam: string; // Tetap string karena dari API biasanya dalam format ISO string
  tgl_rencana_kembali: string; // Tetap string karena dari API biasanya dalam format ISO string
  tgl_aktual_kembali?: string; // Tetap string karena dari API biasanya dalam format ISO string
  kondisi_pinjam: string;
  kondisi_kembali?: string;
  keterangan_peminjaman?: string;
  status_peminjaman: "Dipinjam" | "Dikembalikan" | "Terlambat";
}

export interface CreatePeminjamanDto {
  id_aset: number; // Ubah dari string ke number
  nama_peminjam: string;
  identitas_peminjam: string;
  tgl_rencana_kembali: string; // Tetap string karena akan dikirim sebagai ISO string
  keterangan_peminjaman?: string;
}

export interface PengembalianDto {
  tgl_aktual_kembali?: Date; // Tambahkan field ini
  kondisi_kembali: string;
  keterangan_pengembalian?: string; // Tambahkan field ini
}
