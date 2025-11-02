// src/hooks/useMutasi.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mutasiService } from "../services/mutasiService";
import { Mutasi, CreateMutasiDto, UpdateMutasiDto } from "../types/mutasi";

export const useMutasi = () => {
  const queryClient = useQueryClient();

  // Get all mutasi
  const useMutasiList = () =>
    useQuery<Mutasi[], Error>({
      queryKey: ["mutasi"],
      queryFn: mutasiService.getAll,
    });

  // Get mutasi by ID
  const useMutasi = (id: number) =>
    useQuery<Mutasi, Error>({
      queryKey: ["mutasi", id],
      queryFn: () => mutasiService.getById(id),
      enabled: !!id,
    });

  // Get mutasi by asset ID
  const useMutasiByAsset = (id_aset: number) =>
    useQuery<Mutasi[], Error>({
      queryKey: ["mutasi", "asset", id_aset],
      queryFn: () => mutasiService.getByAssetId(id_aset),
      enabled: !!id_aset,
    });

  // Create mutasi
  const useCreateMutasi = () =>
    useMutation<Mutasi, Error, CreateMutasiDto>({
      mutationFn: mutasiService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["mutasi"] });
      },
    });

  // Update mutasi
  const useUpdateMutasi = () =>
    useMutation<Mutasi, Error, { id: number; data: UpdateMutasiDto }>({
      mutationFn: ({ id, data }) => mutasiService.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["mutasi"] });
      },
    });

  // Delete mutasi
  const useDeleteMutasi = () =>
    useMutation<void, Error, number>({
      mutationFn: mutasiService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["mutasi"] });
      },
    });

  return {
    useMutasiList,
    useMutasi,
    useMutasiByAsset,
    useCreateMutasi,
    useUpdateMutasi,
    useDeleteMutasi,
  };
};
