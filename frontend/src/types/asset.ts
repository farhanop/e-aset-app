// frontend/src/types/asset.ts
import { Lokasi } from "./lokasi";
import { UnitKerja } from "./unitKerja";

export interface Asset {
  id_aset: number;
  kode_aset: string;
  status_aset: string;
  id_lokasi: number;
  id_unit_kerja: number;

  // Relasi dari backend
  item?: {
    id_item: number;
    nama_item: string;
  };
  lokasi?: Lokasi;
  unitKerja?: UnitKerja;
}
