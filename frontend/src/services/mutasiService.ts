// src/services/mutasiService.ts
import api from "../api/axios";
import { Mutasi, CreateMutasiDto, UpdateMutasiDto } from "../types/mutasi";

export const mutasiService = {
  // Get all mutasi
  async getAll(): Promise<Mutasi[]> {
    const response = await api.get("/mutasi");
    return response.data;
  },

  // Get mutasi by ID
  async getById(id: number): Promise<Mutasi> {
    const response = await api.get(`/mutasi/${id}`);
    return response.data;
  },

  // Get mutasi by asset ID
  async getByAssetId(id_aset: number): Promise<Mutasi[]> {
    const response = await api.get(`/mutasi/asset/${id_aset}`);
    return response.data;
  },

  // Create new mutasi
  async create(data: CreateMutasiDto): Promise<Mutasi> {
    const response = await api.post("/mutasi", data);
    return response.data;
  },

  // Update mutasi
  async update(id: number, data: UpdateMutasiDto): Promise<Mutasi> {
    const response = await api.patch(`/mutasi/${id}`, data);
    return response.data;
  },

  // Delete mutasi
  async delete(id: number): Promise<void> {
    await api.delete(`/mutasi/${id}`);
  },
};
