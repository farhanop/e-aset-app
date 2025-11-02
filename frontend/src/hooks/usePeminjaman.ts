// frontend/src/hooks/usePeminjaman.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assetLifecycleService } from "../services/assetLifecycleService";
import {
  CreatePeminjamanDto,
  PengembalianDto,
  Peminjaman,
  Asset,
} from "../types/peminjaman";

export const usePeminjaman = () => {
  const queryClient = useQueryClient();

  // Mutation untuk peminjaman
  const pinjamMutation = useMutation({
    mutationFn: (data: CreatePeminjamanDto) =>
      assetLifecycleService.pinjam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["peminjaman-aktif"] });
      queryClient.invalidateQueries({ queryKey: ["peminjaman-history"] });
    },
    onError: (error: Error) => {
      console.error("Gagal meminjam:", error);
    },
  });

  // Mutation untuk pengembalian
  const kembalikanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: PengembalianDto }) =>
      assetLifecycleService.kembalikan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["peminjaman-aktif"] });
      queryClient.invalidateQueries({ queryKey: ["peminjaman-history"] });
    },
    onError: (error: Error) => {
      console.error("Gagal mengembalikan:", error);
    },
  });

  // Query untuk history peminjaman
  const useHistory = (id_aset: number) => {
    return useQuery<Peminjaman[], Error>({
      queryKey: ["peminjaman-history", id_aset],
      queryFn: () => assetLifecycleService.getHistory(id_aset),
      enabled: !!id_aset,
    });
  };

  // Query untuk aset
  const useAssets = () => {
    return useQuery<Asset[], Error>({
      queryKey: ["assets"],
      queryFn: () => assetLifecycleService.getAssets(),
    });
  };

  // Query untuk peminjaman aktif
  const usePeminjamanAktif = () => {
    return useQuery<Peminjaman[], Error>({
      queryKey: ["peminjaman-aktif"],
      queryFn: () => assetLifecycleService.getPeminjamanAktif(),
    });
  };

  return {
    // Mutations
    pinjam: pinjamMutation.mutateAsync,
    pinjamLoading: pinjamMutation.isPending,
    pinjamError: pinjamMutation.error,

    kembalikan: kembalikanMutation.mutateAsync,
    kembalikanLoading: kembalikanMutation.isPending,
    kembalikanError: kembalikanMutation.error,

    // Queries
    useHistory,
    useAssets,
    usePeminjamanAktif,
  };
};
