// src/types/User.ts
export interface User {
  id_user: number;
  nama_lengkap: string;
  username: string;
  email: string;
  status: 'aktif' | 'nonaktif';
  nomor_telepon?: string;
  foto_profil?: string;
  roles?: Role[];
}

export interface Role {
  id_role: number;
  nama_role: string;
  deskripsi: string;
}