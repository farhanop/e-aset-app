// frontend\src\hooks\useMutasi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { Mutasi, CreateMutasiDto } from "../types/mutasi";
import { toast } from "react-hot-toast";
/**
 * Tipe data untuk error
 */
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/**
 * Kunci query untuk mutasi
 */
export const MUTASI_QUERY_KEY = "mutasi";

// --- FUNGSI-FUNGSI API ---

/**
 * Mengambil semua riwayat mutasi
 */
const fetchMutasiList = async (): Promise<Mutasi[]> => {
  const { data } = await api.get("/mutasi");
  return data;
};

/**
 * Mengambil detail satu mutasi
 */
const fetchMutasi = async (id: number): Promise<Mutasi> => {
  const { data } = await api.get(`/mutasi/${id}`);
  return data;
};

/**
 * Mengambil riwayat mutasi untuk satu aset spesifik
 */
const fetchMutasiByAsset = async (id_aset: number): Promise<Mutasi[]> => {
  const { data } = await api.get(`/mutasi/asset/${id_aset}`);
  return data;
};

/**
 * Membuat mutasi baru
 * (Menggunakan DTO yang sudah kita perbaiki, tanpa id_petugas/id_lokasi_lama)
 */
const createMutasi = async (mutasiData: CreateMutasiDto): Promise<Mutasi> => {
  const { data } = await api.post("/mutasi", mutasiData);
  return data;
};

// --- HOOKS ---

export const useMutasi = () => {
  const queryClient = useQueryClient();

  /**
   * Hook untuk mengambil SEMUA mutasi
   */
  const useMutasiList = () => {
    return useQuery({
      queryKey: [MUTASI_QUERY_KEY, "list"],
      queryFn: fetchMutasiList,
    });
  };

  /**
   * Hook untuk mengambil detail SATU mutasi
   * (Digunakan oleh MutasiDetail.tsx)
   */
  const useMutasiById = (id: number) => {
    return useQuery({
      queryKey: [MUTASI_QUERY_KEY, "detail", id],
      queryFn: () => fetchMutasi(id),
      enabled: !!id, // Hanya jalankan query jika ID ada
    });
  };

  /**
   * Hook untuk mengambil mutasi berdasarkan ID ASET
   * (Digunakan oleh MutasiList.tsx saat di halaman detail aset)
   */
  const useMutasiByAsset = (id_aset: number) => {
    return useQuery({
      queryKey: [MUTASI_QUERY_KEY, "byAsset", id_aset],
      queryFn: () => fetchMutasiByAsset(id_aset),
      enabled: !!id_aset, // Hanya jalankan query jika ID Aset ada
    });
  };

  /**
   * Hook untuk MEMBUAT mutasi baru
   * (Digunakan oleh MutasiModal.tsx)
   */
  const useCreateMutasi = () => {
    return useMutation({
      mutationFn: createMutasi,
      onSuccess: (newData) => {
        toast.success("Aset berhasil dimutasi!");

        // Refresh semua query yang berkaitan dengan mutasi
        queryClient.invalidateQueries({ queryKey: [MUTASI_QUERY_KEY] });

        // Refresh juga query untuk aset spesifik tersebut (penting!)
        queryClient.invalidateQueries({
          queryKey: ["assets", "detail", newData.id_aset],
        });
      },
      onError: (error: ApiError) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Gagal melakukan mutasi.";
        toast.error(message);
      },
    });
  };

  return {
    useMutasiList,
    useMutasiById,
    useMutasiByAsset,
    useCreateMutasi,
  };
};
