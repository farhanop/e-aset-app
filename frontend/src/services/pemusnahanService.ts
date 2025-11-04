// src/services/pemusnahanService.ts
import api from "../api/axios";
import {
  Pemusnahan,
  CreatePemusnahanDto,
  UpdatePemusnahanDto,
} from "../types/pemusnahan";

export const pemusnahanService = {
  // Get all pemusnahan
  async getAll(): Promise<Pemusnahan[]> {
    const response = await api.get("/pemusnahan");
    return response.data;
  },

  // Get pemusnahan by ID
  async getById(id: number): Promise<Pemusnahan> {
    const response = await api.get(`/pemusnahan/${id}`);
    return response.data;
  },

  // Get pemusnahan by asset ID
  async getByAssetId(id_aset: number): Promise<Pemusnahan[]> {
    const response = await api.get(`/pemusnahan/asset/${id_aset}`);
    return response.data;
  },

  // Create new pemusnahan
  async create(data: CreatePemusnahanDto): Promise<Pemusnahan> {
    const response = await api.post("/pemusnahan", data);
    return response.data;
  },

  // Update pemusnahan
  async update(id: number, data: UpdatePemusnahanDto): Promise<Pemusnahan> {
    const response = await api.patch(`/pemusnahan/${id}`, data);
    return response.data;
  },

  // Delete pemusnahan
  async delete(id: number): Promise<void> {
    await api.delete(`/pemusnahan/${id}`);
  },
};
