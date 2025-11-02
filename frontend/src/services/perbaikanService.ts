// src/services/perbaikanService.ts
import api from "../api/axios";
import {
  Perbaikan,
  CreatePerbaikanDto,
  UpdatePerbaikanDto,
} from "../types/perbaikan";

export const perbaikanService = {
  // Get all perbaikan
  async getAll(): Promise<Perbaikan[]> {
    const response = await api.get("/perbaikan");
    return response.data;
  },

  // Get perbaikan by ID
  async getById(id: number): Promise<Perbaikan> {
    const response = await api.get(`/perbaikan/${id}`);
    return response.data;
  },

  // Get perbaikan by asset ID
  async getByAssetId(id_aset: number): Promise<Perbaikan[]> {
    const response = await api.get(`/perbaikan/asset/${id_aset}`);
    return response.data;
  },

  // Create new perbaikan
  async create(data: CreatePerbaikanDto): Promise<Perbaikan> {
    const response = await api.post("/perbaikan", data);
    return response.data;
  },

  // Update perbaikan
  async update(id: number, data: UpdatePerbaikanDto): Promise<Perbaikan> {
    const response = await api.patch(`/perbaikan/${id}`, data);
    return response.data;
  },

  // Update perbaikan status
  async updateStatus(id: number, status: string): Promise<Perbaikan> {
    const response = await api.patch(`/perbaikan/${id}/status`, { status });
    return response.data;
  },

  // Delete perbaikan
  async delete(id: number): Promise<void> {
    await api.delete(`/perbaikan/${id}`);
  },
};
