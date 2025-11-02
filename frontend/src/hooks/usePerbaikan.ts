// src/hooks/usePerbaikan.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { perbaikanService } from "../services/perbaikanService";
import {
  Perbaikan,
  CreatePerbaikanDto,
  UpdatePerbaikanDto,
} from "../types/perbaikan";

export const usePerbaikan = () => {
  const queryClient = useQueryClient();

  // Get all perbaikan
  const usePerbaikanList = () =>
    useQuery<Perbaikan[], Error>({
      queryKey: ["perbaikan"],
      queryFn: perbaikanService.getAll,
    });

  // Get perbaikan by ID
  const usePerbaikan = (id: number) =>
    useQuery<Perbaikan, Error>({
      queryKey: ["perbaikan", id],
      queryFn: () => perbaikanService.getById(id),
      enabled: !!id,
    });

  // Get perbaikan by asset ID
  const usePerbaikanByAsset = (id_aset: number) =>
    useQuery<Perbaikan[], Error>({
      queryKey: ["perbaikan", "asset", id_aset],
      queryFn: () => perbaikanService.getByAssetId(id_aset),
      enabled: !!id_aset,
    });

  // Create perbaikan
  const useCreatePerbaikan = () =>
    useMutation<Perbaikan, Error, CreatePerbaikanDto>({
      mutationFn: perbaikanService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["perbaikan"] });
      },
    });

  // Update perbaikan
  const useUpdatePerbaikan = () =>
    useMutation<Perbaikan, Error, { id: number; data: UpdatePerbaikanDto }>({
      mutationFn: ({ id, data }) => perbaikanService.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["perbaikan"] });
      },
    });

  // Update perbaikan status
  const useUpdatePerbaikanStatus = () =>
    useMutation<Perbaikan, Error, { id: number; status: string }>({
      mutationFn: ({ id, status }) => perbaikanService.updateStatus(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["perbaikan"] });
      },
    });

  // Delete perbaikan
  const useDeletePerbaikan = () =>
    useMutation<void, Error, number>({
      mutationFn: perbaikanService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["perbaikan"] });
      },
    });

  return {
    usePerbaikanList,
    usePerbaikan,
    usePerbaikanByAsset,
    useCreatePerbaikan,
    useUpdatePerbaikan,
    useUpdatePerbaikanStatus,
    useDeletePerbaikan,
  };
};
