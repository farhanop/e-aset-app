// frontend/src/types/User.ts
export interface User {
  id_user: number;
  username: string;
  email: string;
  nama_lengkap: string;
  nomor_telepon?: string;
  foto_profil?: string;
  status: "aktif" | "nonaktif";
  roles?: Role[];
  sessionInfo?: {
    isActive: boolean;
    timeRemaining: number;
    lastActivity: Date;
    username: string;
    sessionCount: number;
  };
}

export interface Role {
  id_role: number;
  nama_role: string;
  deskripsi?: string;
}
