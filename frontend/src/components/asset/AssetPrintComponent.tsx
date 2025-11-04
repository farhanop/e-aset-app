// frontend/src/components/forms/AssetPrintComponent.tsx
interface Asset {
  id_aset: number;
  kode_aset: string;
  item: { nama_item: string };
  Kampus: { nama_kampus: string };
  lokasi: { nama_ruangan: string };
  status_aset: string;
  kondisi_terakhir: string;
  tanggal_perolehan: string;
  masa_manfaat: number;
  nilai_perolehan: number;
  keterangan: string;
}

interface AssetPrintProps {
  asset: Asset;
  theme: string;
}

export function AssetPrintComponent({ asset, theme }: AssetPrintProps) {
  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2
            className={`text-2xl font-bold mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            Detail Aset
          </h2>
          <div
            className={`text-lg font-mono ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {asset.kode_aset}
          </div>
        </div>
        <div
          className={`text-right text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <div>Dicetak pada: {new Date().toLocaleString("id-ID")}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3
            className={`text-lg font-semibold mb-3 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Informasi Aset
          </h3>
          <div className="space-y-3">
            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Nama Barang
              </label>
              <div
                className={`mt-1 block w-full rounded-md ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-900"
                } p-2 border ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                {asset.item?.nama_item || "N/A"}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Lokasi
              </label>
              <div
                className={`mt-1 block w-full rounded-md ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-900"
                } p-2 border ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                {asset.lokasi?.nama_ruangan || "N/A"}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Kampus
              </label>
              <div
                className={`mt-1 block w-full rounded-md ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-900"
                } p-2 border ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                {asset.Kampus?.nama_kampus || "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3
            className={`text-lg font-semibold mb-3 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Status & Kondisi
          </h3>
          <div className="space-y-3">
            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Status Aset
              </label>
              <div
                className={`mt-1 block w-full rounded-md ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-900"
                } p-2 border ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    asset.status_aset === "Tersedia"
                      ? theme === "dark"
                        ? "bg-green-800 text-green-100"
                        : "bg-green-100 text-green-800"
                      : asset.status_aset === "Dipinjam"
                      ? theme === "dark"
                        ? "bg-yellow-800 text-yellow-100"
                        : "bg-yellow-100 text-yellow-800"
                      : theme === "dark"
                      ? "bg-red-800 text-red-100"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {asset.status_aset}
                </span>
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Kondisi Terakhir
              </label>
              <div
                className={`mt-1 block w-full rounded-md ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-900"
                } p-2 border ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                {asset.kondisi_terakhir || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3
            className={`text-lg font-semibold mb-3 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Informasi Finansial
          </h3>
          <div className="space-y-3">
            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Tanggal Perolehan
              </label>
              <div
                className={`mt-1 block w-full rounded-md ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-900"
                } p-2 border ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                {asset.tanggal_perolehan
                  ? new Date(asset.tanggal_perolehan).toLocaleDateString(
                      "id-ID"
                    )
                  : "N/A"}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Masa Manfaat (tahun)
              </label>
              <div
                className={`mt-1 block w-full rounded-md ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-900"
                } p-2 border ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                {asset.masa_manfaat || "-"}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Nilai Perolehan
              </label>
              <div
                className={`mt-1 block w-full rounded-md ${
                  theme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-900"
                } p-2 border ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
              >
                {asset.nilai_perolehan
                  ? `Rp ${asset.nilai_perolehan.toLocaleString("id-ID")}`
                  : "-"}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3
            className={`text-lg font-semibold mb-3 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Keterangan
          </h3>
          <div
            className={`mt-1 block w-full rounded-md ${
              theme === "dark"
                ? "bg-gray-700 text-white"
                : "bg-gray-50 text-gray-900"
            } p-2 border ${
              theme === "dark" ? "border-gray-600" : "border-gray-300"
            } min-h-[100px]`}
          >
            {asset.keterangan || "-"}
          </div>
        </div>
      </div>

      <div
        className={`border-t pt-4 mt-6 ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center">
          <div
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            UNIVERSITAS IGM - E-Aset System
          </div>
          <div
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {asset.kode_aset}
          </div>
        </div>
      </div>
    </div>
  );
}
