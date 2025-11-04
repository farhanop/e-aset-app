// frontend/src/types/lokasi.ts
export interface Lokasi {
  id_lokasi: number;
  nama_ruangan: string;
  kode_ruangan: string;
  lantai: number;
  gedung?: {
    id_gedung: number;
    kode_gedung: string;
  };
}
