// src/hooks/usePemusnahan.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pemusnahanService } from "../services/pemusnahanService";
import {
  Pemusnahan,
  CreatePemusnahanDto,
  UpdatePemusnahanDto,
} from "../types/pemusnahan";

export const usePemusnahan = () => {
  const queryClient = useQueryClient();

  // Get all pemusnahan
  const usePemusnahanList = () =>
    useQuery<Pemusnahan[], Error>({
      queryKey: ["pemusnahan"],
      queryFn: pemusnahanService.getAll,
    });

  // Get pemusnahan by ID
  const usePemusnahan = (id: number) =>
    useQuery<Pemusnahan, Error>({
      queryKey: ["pemusnahan", id],
      queryFn: () => pemusnahanService.getById(id),
      enabled: !!id,
    });

  // Get pemusnahan by asset ID
  const usePemusnahanByAsset = (id_aset: number) =>
    useQuery<Pemusnahan[], Error>({
      queryKey: ["pemusnahan", "asset", id_aset],
      queryFn: () => pemusnahanService.getByAssetId(id_aset),
      enabled: !!id_aset,
    });

  // Create pemusnahan
  const useCreatePemusnahan = () =>
    useMutation<Pemusnahan, Error, CreatePemusnahanDto>({
      mutationFn: pemusnahanService.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["pemusnahan"] });
      },
    });

  // Update pemusnahan
  const useUpdatePemusnahan = () =>
    useMutation<Pemusnahan, Error, { id: number; data: UpdatePemusnahanDto }>({
      mutationFn: ({ id, data }) => pemusnahanService.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["pemusnahan"] });
      },
    });

  // Delete pemusnahan
  const useDeletePemusnahan = () =>
    useMutation<void, Error, number>({
      mutationFn: pemusnahanService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["pemusnahan"] });
      },
    });

  return {
    usePemusnahanList,
    usePemusnahan,
    usePemusnahanByAsset,
    useCreatePemusnahan,
    useUpdatePemusnahan,
    useDeletePemusnahan,
  };
};
