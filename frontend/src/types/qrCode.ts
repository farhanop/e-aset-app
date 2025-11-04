// src/types/qrCode.ts
export interface QRCode {
  filename: string;
  url: string;
}

export interface Asset {
  id_aset: number;
  kode_aset: string;
  file_qrcode?: string;
  item?: {
    id_item: number;
    nama_item: string;
  };
  lokasi?: {
    id_lokasi: number;
    nama_ruangan: string;
  };
  // tambahkan properti lain sesuai kebutuhan
}