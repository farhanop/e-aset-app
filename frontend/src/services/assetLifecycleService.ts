// frontend/src/services/assetLifecycleService.ts
import api from "../api/axios";
import {
  CreatePeminjamanDto,
  Peminjaman,
  Asset,
  PengembalianDto,
} from "../types/peminjaman";

export const assetLifecycleService = {
  // Peminjaman
  async pinjam(data: CreatePeminjamanDto): Promise<Peminjaman> {
    const response = await api.post("/asset-lifecycle/pinjam", data);
    return response.data;
  },

  // Pengembalian
  async kembalikan(
    id_peminjaman: number,
    data: PengembalianDto
  ): Promise<Asset> {
    const response = await api.post(
      `/asset-lifecycle/kembalikan/${id_peminjaman}`,
      data
    );
    return response.data;
  },

  // History peminjaman
  async getHistory(id_aset: number): Promise<Peminjaman[]> {
    const response = await api.get(`/asset-lifecycle/history/${id_aset}`);
    return response.data;
  },

  // Update status terlambat
  async updateStatusTerlambat(): Promise<void> {
    await api.post("/asset-lifecycle/check-overdue");
  },

  // Get semua aset
  async getAssets(): Promise<Asset[]> {
    const response = await api.get("/asset-lifecycle/assets");
    return response.data;
  },

  // Get peminjaman aktif
  async getPeminjamanAktif(): Promise<Peminjaman[]> {
    const response = await api.get("/asset-lifecycle/peminjaman-aktif");
    return response.data;
  },
};
