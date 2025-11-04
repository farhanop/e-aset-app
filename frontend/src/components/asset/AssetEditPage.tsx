// src/components/asset/AssetEditPage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select, { StylesConfig } from "react-select";
import api from "../../api/axios";
import { useTheme } from "../../contexts/ThemeContext";
import { QRCodeGenerator } from "../qr/QRCodeGenerator";
import { Modal } from "../Modal";

// ==================== INTERFACES ====================
interface MasterItem {
  id_item: number;
  nama_item: string;
  kode_item: string;
  metode_pelacakan: string;
  umur_ekonomis: number;
  id_kategori?: number;
  kategori?: {
    id_kategori: number;
    nama_kategori: string;
    kode_kategori: string;
  };
}

interface Kampus {
  id_kampus: number;
  nama_kampus: string;
  kode_kampus: string;
}

interface Gedung {
  id_gedung: number;
  nama_gedung: string;
  kode_gedung: string;
  id_kampus: number;
}

interface Lokasi {
  id_lokasi: number;
  nama_ruangan: string;
  kode_ruangan: string;
  lantai: number;
  id_gedung: number;
  id_unit_kerja?: number;
}

interface UnitKerja {
  id_unit_kerja: number;
  nama_unit: string;
  kode_unit: string;
  id_unit_utama: number;
  unitUtama?: {
    id_unit_utama: number;
    kode_unit_utama: string;
    nama_unit_utama: string;
  };
}

interface AssetDetail {
  id_aset: number;
  kode_aset: string;
  id_item: number;
  id_lokasi: number;
  id_unit_kerja: number;
  id_group: number | null;
  merk: string | null;
  foto_barang?: string | null;
  foto_barang_mime?: string | null;
  file_qrcode?: string | null;
  file_dokumen?: string | null;
  item?: any;
  lokasi?: any;
  unitKerja?: any;
  group?: any;
  tipe_model?: string | null;
  tgl_perolehan?: string | null;
  sumber_dana?: string | null;
  nomor_urut?: string | null;
  spesifikasi?: string | null;
  status_aset?: string;
  kondisi_terakhir?: string | null;
}

interface SelectOption {
  value: string;
  label: string;
  data?: any;
}

// ==================== MAIN COMPONENT ====================
export function AssetEditPage() {
  const { theme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    id_item: "",
    id_kampus: "",
    id_gedung: "",
    id_lokasi: "",
    id_unit_kerja: "",
    merk: "",
    tipe_model: "",
    spesifikasi: "",
    tgl_perolehan: "",
    sumber_dana: "",
    status_aset: "Tersedia",
    kondisi_terakhir: "Baik",
  });

  // Master Data State
  const [items, setItems] = useState<MasterItem[]>([]);
  const [kampus, setKampus] = useState<Kampus[]>([]);
  const [gedung, setGedung] = useState<Gedung[]>([]);
  const [lokasi, setLokasi] = useState<Lokasi[]>([]);
  const [unitKerja, setUnitKerja] = useState<UnitKerja[]>([]);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState<any>(null);

  // Photo State
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("");
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string>("");
  const [removePhoto, setRemovePhoto] = useState(false);

  // Document State
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string>("");
  const [existingDocumentUrl, setExistingDocumentUrl] = useState<string>("");
  const [removeDocument, setRemoveDocument] = useState(false);

  // QR & Success Modal State
  const [qrCodePreview, setQrCodePreview] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Select Options State
  const [itemOptions, setItemOptions] = useState<SelectOption[]>([]);
  const [kampusOptions, setKampusOptions] = useState<SelectOption[]>([]);
  const [gedungOptions, setGedungOptions] = useState<SelectOption[]>([]);
  const [lokasiOptions, setLokasiOptions] = useState<SelectOption[]>([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState<SelectOption[]>([]);

  // ==================== SELECT STYLES ====================
  const selectStyles: StylesConfig<SelectOption, false> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
      borderColor: state.isFocused
        ? "#3b82f6"
        : theme === "dark"
        ? "#4b5563"
        : "#d1d5db",
      color: theme === "dark" ? "#fff" : "#1f2937",
      "&:hover": {
        borderColor: "#3b82f6",
      },
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? theme === "dark"
          ? "#374151"
          : "#f3f4f6"
        : "transparent",
      color: state.isSelected ? "#fff" : theme === "dark" ? "#fff" : "#1f2937",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#fff" : "#1f2937",
    }),
    input: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#fff" : "#1f2937",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#9ca3af" : "#6b7280",
    }),
  };

  // ==================== FETCH ASSET DATA ====================
  useEffect(() => {
    const fetchAssetData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await api.get(`/assets/${id}`);
        const assetData: AssetDetail = response.data;

        // Set form data with existing values
        setFormData({
          id_item: assetData.id_item.toString(),
          id_kampus: assetData.lokasi?.gedung?.id_kampus?.toString() || "",
          id_gedung: assetData.lokasi?.id_gedung?.toString() || "",
          id_lokasi: assetData.id_lokasi.toString(),
          id_unit_kerja: assetData.id_unit_kerja.toString(),
          merk: assetData.merk || "",
          tipe_model: assetData.tipe_model || "",
          spesifikasi: assetData.spesifikasi || "",
          tgl_perolehan: assetData.tgl_perolehan
            ? new Date(assetData.tgl_perolehan).toISOString().split("T")[0]
            : "",
          sumber_dana: assetData.sumber_dana || "",
          status_aset: assetData.status_aset || "Tersedia",
          kondisi_terakhir: assetData.kondisi_terakhir || "Baik",
        });

        // Set existing photo and document URLs
        if (assetData.foto_barang) {
          setExistingPhotoUrl(assetData.foto_barang);
        }

        if (assetData.file_dokumen) {
          setExistingDocumentUrl(assetData.file_dokumen);
          setDocumentPreviewUrl(
            assetData.file_dokumen.split("/").pop() || "Dokumen.pdf"
          );
        }

        // Set QR code preview
        setQrCodePreview(assetData.kode_aset);

        setError("");
      } catch (err: any) {
        console.error("Gagal mengambil data aset:", err);
        setError(
          `Gagal memuat data aset: ${
            err.response?.data?.message || err.message || "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssetData();
  }, [id]);

  // ==================== FETCH MASTER DATA ====================
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("🔄 Fetching master data...");

        // Fetch semua data master secara paralel
        const [itemRes, kampusRes, unitKerjaRes] = await Promise.all([
          api.get("/master-data/master-item"),
          api.get("/master-data/kampus"),
          api.get("/master-data/unit-kerja"),
        ]);

        console.log("✅ Master Item Response:", itemRes.data);
        console.log("✅ Kampus Response:", kampusRes.data);
        console.log("✅ Unit Kerja Response:", unitKerjaRes.data);

        // Normalize response (bisa berupa array langsung atau dalam property data)
        const itemsData: MasterItem[] = Array.isArray(itemRes.data)
          ? itemRes.data
          : itemRes.data?.data || [];

        const kampusData: Kampus[] = Array.isArray(kampusRes.data)
          ? kampusRes.data
          : kampusRes.data?.data || [];

        const unitKerjaData: UnitKerja[] = Array.isArray(unitKerjaRes.data)
          ? unitKerjaRes.data
          : unitKerjaRes.data?.data || [];

        // Tampilkan semua item (Individual dan Stok)
        const allItems = itemsData;

        console.log("📦 All Items:", allItems.length);
        console.log("🏛️ Kampus:", kampusData.length);
        console.log("🏢 Unit Kerja:", unitKerjaData.length);

        setItems(allItems);
        setKampus(kampusData);
        setUnitKerja(unitKerjaData);

        // Set options untuk react-select dengan indikator metode pelacakan
        setItemOptions(
          allItems.map((item) => ({
            value: item.id_item.toString(),
            label: `${item.kode_item} - ${item.nama_item}${
              item.kategori ? ` (${item.kategori.nama_kategori})` : ""
            } [${item.metode_pelacakan}]`,
            data: item,
          }))
        );

        setKampusOptions(
          kampusData.map((k) => ({
            value: k.id_kampus.toString(),
            label: `${k.kode_kampus} - ${k.nama_kampus}`,
            data: k,
          }))
        );

        setUnitKerjaOptions(
          unitKerjaData.map((u) => ({
            value: u.id_unit_kerja.toString(),
            label: `${u.kode_unit} - ${u.nama_unit}`,
            data: u,
          }))
        );

        if (allItems.length === 0) {
          setError(
            "Tidak ada item tersedia. Silakan buat master item terlebih dahulu."
          );
        }
      } catch (err: any) {
        console.error("❌ Gagal memuat data master:", err);
        console.error("Error response:", err.response?.data);
        setError(
          `Gagal memuat data master: ${
            err.response?.data?.message || err.message || "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  // ==================== FETCH GEDUNG BY KAMPUS ====================
  useEffect(() => {
    if (!formData.id_kampus) {
      setGedung([]);
      setGedungOptions([]);
      return;
    }

    const fetchGedung = async () => {
      try {
        console.log(`🔄 Fetching gedung for kampus ${formData.id_kampus}...`);
        const response = await api.get(
          `/master-data/gedung/by-kampus/${formData.id_kampus}`
        );

        const gedungData: Gedung[] = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        console.log("✅ Gedung:", gedungData.length);
        setGedung(gedungData);
        setGedungOptions(
          gedungData.map((g) => ({
            value: g.id_gedung.toString(),
            label: `${g.kode_gedung} - ${g.nama_gedung}`,
            data: g,
          }))
        );
      } catch (err: any) {
        console.error("❌ Gagal memuat data gedung:", err);
        setGedung([]);
        setGedungOptions([]);
      }
    };

    fetchGedung();
  }, [formData.id_kampus]);

  // ==================== FETCH LOKASI BY GEDUNG ====================
  useEffect(() => {
    if (!formData.id_gedung) {
      setLokasi([]);
      setLokasiOptions([]);
      return;
    }

    const fetchLokasi = async () => {
      try {
        console.log(`🔄 Fetching lokasi for gedung ${formData.id_gedung}...`);
        const response = await api.get(
          `/master-data/lokasi/by-gedung/${formData.id_gedung}`
        );

        const lokasiData: Lokasi[] = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        console.log("✅ Lokasi:", lokasiData.length);
        setLokasi(lokasiData);
        setLokasiOptions(
          lokasiData.map((l) => ({
            value: l.id_lokasi.toString(),
            label: `Lantai ${l.lantai} - ${l.kode_ruangan} - ${l.nama_ruangan}`,
            data: l,
          }))
        );
      } catch (err: any) {
        console.error("❌ Gagal memuat data lokasi:", err);
        setLokasi([]);
        setLokasiOptions([]);
      }
    };

    fetchLokasi();
  }, [formData.id_gedung]);

  // ==================== CHANGE HANDLERS ====================
  const handleItemChange = (selected: SelectOption | null) => {
    setFormData((prev) => ({ ...prev, id_item: selected?.value || "" }));
    if (fieldErrors.id_item) {
      setFieldErrors((prev) => ({ ...prev, id_item: "" }));
    }
  };

  const handleKampusChange = (selected: SelectOption | null) => {
    setFormData((prev) => ({
      ...prev,
      id_kampus: selected?.value || "",
      id_gedung: "",
      id_lokasi: "",
    }));
    if (fieldErrors.id_kampus) {
      setFieldErrors((prev) => ({ ...prev, id_kampus: "" }));
    }
  };

  const handleGedungChange = (selected: SelectOption | null) => {
    setFormData((prev) => ({
      ...prev,
      id_gedung: selected?.value || "",
      id_lokasi: "",
    }));
    if (fieldErrors.id_gedung) {
      setFieldErrors((prev) => ({ ...prev, id_gedung: "" }));
    }
  };

  const handleLokasiChange = (selected: SelectOption | null) => {
    setFormData((prev) => ({ ...prev, id_lokasi: selected?.value || "" }));
    if (fieldErrors.id_lokasi) {
      setFieldErrors((prev) => ({ ...prev, id_lokasi: "" }));
    }
  };

  const handleUnitKerjaChange = (selected: SelectOption | null) => {
    setFormData((prev) => ({ ...prev, id_unit_kerja: selected?.value || "" }));
    if (fieldErrors.id_unit_kerja) {
      setFieldErrors((prev) => ({ ...prev, id_unit_kerja: "" }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ==================== PHOTO HANDLER ====================
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (photoPreviewUrl) {
      try {
        URL.revokeObjectURL(photoPreviewUrl);
      } catch (err) {
        console.error("Failed to revoke URL:", err);
      }
    }

    if (!file) {
      setSelectedPhoto(null);
      setPhotoPreviewUrl("");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!file.type.startsWith("image/")) {
      setSelectedPhoto(null);
      setPhotoPreviewUrl("");
      setError("Format file tidak didukung. Pilih file gambar (jpg/png/gif).");
      return;
    }
    if (file.size > maxSize) {
      setSelectedPhoto(null);
      setPhotoPreviewUrl("");
      setError("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    setError("");
    setSelectedPhoto(file);
    setRemovePhoto(false); // Reset remove flag when new photo is selected
    const url = URL.createObjectURL(file);
    setPhotoPreviewUrl(url);
  };

  const handleRemovePhoto = () => {
    if (photoPreviewUrl) {
      try {
        URL.revokeObjectURL(photoPreviewUrl);
      } catch (err) {
        console.error("Failed to revoke URL:", err);
      }
    }
    setSelectedPhoto(null);
    setPhotoPreviewUrl("");
    setRemovePhoto(true);
  };

  // ==================== DOCUMENT HANDLER ====================
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setSelectedDocument(null);
      setDocumentPreviewUrl("");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (!file.name.match(/\.(pdf|doc|docx)$/)) {
      setSelectedDocument(null);
      setDocumentPreviewUrl("");
      setError("Format file tidak didukung. Pilih file PDF, DOC, atau DOCX.");
      return;
    }
    if (file.size > maxSize) {
      setSelectedDocument(null);
      setDocumentPreviewUrl("");
      setError("Ukuran file terlalu besar. Maksimal 10MB.");
      return;
    }

    setError("");
    setSelectedDocument(file);
    setRemoveDocument(false); // Reset remove flag when new document is selected
    setDocumentPreviewUrl(file.name);
  };

  const handleRemoveDocument = () => {
    setSelectedDocument(null);
    setDocumentPreviewUrl("");
    setRemoveDocument(true);
  };

  // ==================== PREVIEW HANDLER ====================
  const handlePreview = () => {
    const validationErrors: Record<string, string> = {};

    if (!formData.id_item)
      validationErrors.id_item = "Jenis item wajib dipilih";
    if (!formData.id_kampus)
      validationErrors.id_kampus = "Kampus wajib dipilih";
    if (!formData.id_gedung)
      validationErrors.id_gedung = "Gedung wajib dipilih";
    if (!formData.id_lokasi)
      validationErrors.id_lokasi = "Lokasi penempatan wajib dipilih";
    if (!formData.id_unit_kerja)
      validationErrors.id_unit_kerja = "Unit penanggung jawab wajib dipilih";
    if (!formData.tgl_perolehan)
      validationErrors.tgl_perolehan = "Tanggal perolehan wajib diisi";

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    const selectedItem = items.find(
      (item) => item.id_item === Number(formData.id_item)
    );
    const selectedKampus = kampus.find(
      (k) => k.id_kampus === Number(formData.id_kampus)
    );
    const selectedGedung = gedung.find(
      (g) => g.id_gedung === Number(formData.id_gedung)
    );
    const selectedLokasi = lokasi.find(
      (l) => l.id_lokasi === Number(formData.id_lokasi)
    );
    const selectedUnitKerja = unitKerja.find(
      (u) => u.id_unit_kerja === Number(formData.id_unit_kerja)
    );

    if (
      selectedItem &&
      selectedKampus &&
      selectedGedung &&
      selectedLokasi &&
      selectedUnitKerja
    ) {
      const preview = {
        item: selectedItem,
        kampus: selectedKampus,
        gedung: selectedGedung,
        lokasi: selectedLokasi,
        unitKerja: selectedUnitKerja,
        formData,
      };
      setPreviewData(preview);

      // Generate kode aset untuk preview
      const kodeAset =
        qrCodePreview ||
        `${selectedKampus.kode_kampus}${selectedGedung.kode_gedung}${
          selectedLokasi.lantai
        }${selectedLokasi.kode_ruangan}/${
          selectedUnitKerja.unitUtama?.kode_unit_utama
        }.${selectedUnitKerja.kode_unit}/${selectedItem.kode_item}.1/${new Date(
          formData.tgl_perolehan
        ).getFullYear()}`;
      setQrCodePreview(kodeAset);
    }
  };

  // ==================== SUBMIT HANDLER ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});

    // Validasi
    const validationErrors: Record<string, string> = {};

    if (!formData.id_item)
      validationErrors.id_item = "Jenis item wajib dipilih";
    if (!formData.id_kampus)
      validationErrors.id_kampus = "Kampus wajib dipilih";
    if (!formData.id_gedung)
      validationErrors.id_gedung = "Gedung wajib dipilih";
    if (!formData.id_lokasi)
      validationErrors.id_lokasi = "Lokasi penempatan wajib dipilih";
    if (!formData.id_unit_kerja)
      validationErrors.id_unit_kerja = "Unit penanggung jawab wajib dipilih";
    if (!formData.tgl_perolehan)
      validationErrors.tgl_perolehan = "Tanggal perolehan wajib diisi";

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload foto jika ada
      let fotoPath: string | undefined = undefined;
      if (selectedPhoto) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", selectedPhoto);

        try {
          const uploadRes = await api.post("/assets/upload", formDataUpload, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          fotoPath =
            uploadRes.data?.url ||
            `/uploads/foto-barang/${uploadRes.data?.filename}`;
          console.log("✅ Foto uploaded:", fotoPath);
        } catch (err: any) {
          console.error("❌ Gagal upload foto:", err);
          setError("Gagal mengunggah foto. Silakan coba lagi.");
          setIsSubmitting(false);
          return;
        }
      }

      // Upload dokumen jika ada
      let dokumenPath: string | undefined = undefined;
      if (selectedDocument) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", selectedDocument);

        try {
          const uploadRes = await api.post(
            "/assets/upload-document",
            formDataUpload,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          dokumenPath =
            uploadRes.data?.url ||
            `/uploads/dokumen/${uploadRes.data?.filename}`;
          console.log("✅ Dokumen uploaded:", dokumenPath);
        } catch (err: any) {
          console.error("❌ Gagal upload dokumen:", err);
          setError("Gagal mengunggah dokumen. Silakan coba lagi.");
          setIsSubmitting(false);
          return;
        }
      }

      // Kirim data ke backend
      const payload = {
        id_item: Number(formData.id_item),
        id_lokasi: Number(formData.id_lokasi),
        id_unit_kerja: Number(formData.id_unit_kerja),
        merk: formData.merk || null,
        tipe_model: formData.tipe_model || null,
        spesifikasi: formData.spesifikasi || null,
        tgl_perolehan: formData.tgl_perolehan,
        sumber_dana: formData.sumber_dana || null,
        status_aset: formData.status_aset,
        kondisi_terakhir: formData.kondisi_terakhir,
        foto_barang: fotoPath || (removePhoto ? null : undefined),
        file_dokumen: dokumenPath || (removeDocument ? null : undefined),
      };

      console.log("📤 Sending payload:", payload);

      const response = await api.put(`/assets/${id}`, payload);

      console.log("✅ Response:", response.data);

      // Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("❌ Gagal mengupdate aset:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 400) {
        const backendErrors = error.response.data;

        if (Array.isArray(backendErrors.message)) {
          const errorMessages = backendErrors.message.map((err: any) => {
            if (typeof err === "string") return err;
            if (err.constraints) {
              return Object.values(err.constraints).join(", ");
            }
            return JSON.stringify(err);
          });
          setError(`Validasi gagal: ${errorMessages.join("; ")}`);
        } else if (backendErrors.message) {
          setError(backendErrors.message);
        } else {
          setError(
            "Terjadi kesalahan validasi. Periksa kembali data yang dimasukkan."
          );
        }
      } else if (error.response?.status === 500) {
        setError("Terjadi kesalahan server. Silakan coba lagi.");
      } else {
        setError(
          "Gagal mengupdate aset. Periksa koneksi internet dan coba lagi."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== MODAL HANDLERS ====================
  const handleViewAsset = () => {
    if (id) {
      navigate(`/assets/${id}`);
    }
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p
            className={`mt-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Memuat data aset...
          </p>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1
                className={`text-3xl font-bold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-800"
                }`}
              >
                Edit Aset
              </h1>
              <p
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Edit informasi aset yang sudah terdaftar
              </p>
            </div>
            <button
              onClick={() => navigate(`/assets/${id}`)}
              className={`px-4 py-2 rounded-lg shadow hover:shadow-md transition-all duration-200 flex items-center gap-2 ${
                theme === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className={`mb-6 p-4 rounded-lg border flex items-start ${
                theme === "dark"
                  ? "bg-red-900/20 border-red-800"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <svg
                className={`w-5 h-5 mt-0.5 mr-2 flex-shrink-0 ${
                  theme === "dark" ? "text-red-400" : "text-red-500"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p
                  className={`font-medium ${
                    theme === "dark" ? "text-red-400" : "text-red-700"
                  }`}
                >
                  Gagal mengupdate aset
                </p>
                <p
                  className={`text-sm mt-1 ${
                    theme === "dark" ? "text-red-300" : "text-red-600"
                  }`}
                >
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className={`p-8 rounded-lg shadow-md border space-y-8 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            {/* Section 1: Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Jenis Item */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Jenis Item <span className="text-red-500">*</span>
                </label>
                <Select
                  options={itemOptions}
                  value={itemOptions.find(
                    (opt) => opt.value === formData.id_item
                  )}
                  onChange={handleItemChange}
                  placeholder="Pilih jenis item"
                  isClearable
                  isSearchable
                  styles={selectStyles}
                />
                {fieldErrors.id_item && (
                  <p
                    className={`mt-1 text-sm ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {fieldErrors.id_item}
                  </p>
                )}
                {items.length === 0 && !fieldErrors.id_item && (
                  <p
                    className={`mt-1 text-sm ${
                      theme === "dark" ? "text-yellow-400" : "text-yellow-600"
                    }`}
                  >
                    Tidak ada item tersedia
                  </p>
                )}
              </div>

              {/* Kampus */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Kampus <span className="text-red-500">*</span>
                </label>
                <Select
                  options={kampusOptions}
                  value={kampusOptions.find(
                    (opt) => opt.value === formData.id_kampus
                  )}
                  onChange={handleKampusChange}
                  placeholder="Pilih kampus"
                  isClearable
                  isSearchable
                  styles={selectStyles}
                />
                {fieldErrors.id_kampus && (
                  <p
                    className={`mt-1 text-sm ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {fieldErrors.id_kampus}
                  </p>
                )}
              </div>

              {/* Gedung */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Gedung <span className="text-red-500">*</span>
                </label>
                <Select
                  options={gedungOptions}
                  value={gedungOptions.find(
                    (opt) => opt.value === formData.id_gedung
                  )}
                  onChange={handleGedungChange}
                  placeholder="Pilih gedung"
                  isClearable
                  isSearchable
                  isDisabled={!formData.id_kampus}
                  styles={selectStyles}
                />
                {fieldErrors.id_gedung && (
                  <p
                    className={`mt-1 text-sm ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {fieldErrors.id_gedung}
                  </p>
                )}
              </div>

              {/* Lokasi */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Lantai/Ruangan <span className="text-red-500">*</span>
                </label>
                <Select
                  options={lokasiOptions}
                  value={lokasiOptions.find(
                    (opt) => opt.value === formData.id_lokasi
                  )}
                  onChange={handleLokasiChange}
                  placeholder="Pilih ruangan"
                  isClearable
                  isSearchable
                  isDisabled={!formData.id_gedung}
                  styles={selectStyles}
                />
                {fieldErrors.id_lokasi && (
                  <p
                    className={`mt-1 text-sm ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {fieldErrors.id_lokasi}
                  </p>
                )}
              </div>
            </div>

            {/* Section 2: Unit Kerja */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unit Kerja */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Unit Kerja <span className="text-red-500">*</span>
                </label>
                <Select
                  options={unitKerjaOptions}
                  value={unitKerjaOptions.find(
                    (opt) => opt.value === formData.id_unit_kerja
                  )}
                  onChange={handleUnitKerjaChange}
                  placeholder="Pilih unit kerja"
                  isClearable
                  isSearchable
                  styles={selectStyles}
                />
                {fieldErrors.id_unit_kerja && (
                  <p
                    className={`mt-1 text-sm ${
                      theme === "dark" ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {fieldErrors.id_unit_kerja}
                  </p>
                )}
              </div>
            </div>

            {/* Section 3: Detail Spesifikasi */}
            <div className="space-y-6">
              <h3
                className={`text-lg font-semibold border-b pb-2 ${
                  theme === "dark"
                    ? "text-gray-200 border-gray-700"
                    : "text-gray-800 border-gray-200"
                }`}
              >
                Detail Spesifikasi Aset
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Merk */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Merk
                  </label>
                  <input
                    type="text"
                    name="merk"
                    value={formData.merk}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Contoh: Samsung, Dell, dll."
                  />
                </div>

                {/* Tipe/Model */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Tipe / Model
                  </label>
                  <input
                    type="text"
                    name="tipe_model"
                    value={formData.tipe_model}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Contoh: Galaxy S21, Inspiron 15"
                  />
                </div>
              </div>

              {/* Spesifikasi */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Spesifikasi Lengkap
                </label>
                <textarea
                  name="spesifikasi"
                  value={formData.spesifikasi}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    theme === "dark"
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="Deskripsi detail spesifikasi aset..."
                ></textarea>
              </div>
            </div>

            {/* Section 4: Informasi Pengadaan */}
            <div className="space-y-6">
              <h3
                className={`text-lg font-semibold border-b pb-2 ${
                  theme === "dark"
                    ? "text-gray-200 border-gray-700"
                    : "text-gray-800 border-gray-200"
                }`}
              >
                Informasi Pengadaan
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tanggal Perolehan */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Tanggal Perolehan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="tgl_perolehan"
                    value={formData.tgl_perolehan}
                    onChange={handleChange}
                    required
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      fieldErrors.tgl_perolehan
                        ? theme === "dark"
                          ? "border-red-500 bg-red-900/20 text-red-200"
                          : "border-red-300 bg-red-50 text-red-900"
                        : theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                  {fieldErrors.tgl_perolehan && (
                    <p
                      className={`mt-1 text-sm ${
                        theme === "dark" ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      {fieldErrors.tgl_perolehan}
                    </p>
                  )}
                </div>

                {/* Sumber Dana */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Sumber Dana
                  </label>
                  <input
                    type="text"
                    name="sumber_dana"
                    value={formData.sumber_dana}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                        : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                    }`}
                    placeholder="Contoh: APBN, APBD, Mandiri"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Status dan Kondisi */}
            <div className="space-y-6">
              <h3
                className={`text-lg font-semibold border-b pb-2 ${
                  theme === "dark"
                    ? "text-gray-200 border-gray-700"
                    : "text-gray-800 border-gray-200"
                }`}
              >
                Status dan Kondisi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Aset */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Status Aset
                  </label>
                  <select
                    name="status_aset"
                    value={formData.status_aset}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Dipinjam">Dipinjam</option>
                    <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                    <option value="Rusak">Rusak</option>
                    <option value="Hilang">Hilang</option>
                    <option value="Dihapuskan">Dihapuskan</option>
                  </select>
                </div>

                {/* Kondisi Terakhir */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Kondisi Terakhir
                  </label>
                  <select
                    name="kondisi_terakhir"
                    value={formData.kondisi_terakhir}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    }`}
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                    <option value="Tidak Dapat Digunakan">
                      Tidak Dapat Digunakan
                    </option>
                  </select>
                </div>
              </div>

              {/* Foto Barang */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Foto Barang
                </label>

                {/* Existing Photo */}
                {existingPhotoUrl && !removePhoto && !selectedPhoto && (
                  <div className="mb-4 flex justify-center">
                    <div className="relative">
                      <img
                        src={existingPhotoUrl}
                        alt="Existing foto"
                        className="max-h-64 max-w-full object-contain rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload New Photo */}
                <div className="flex flex-col items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    } ${fieldErrors.foto_barang ? "border-red-500" : ""}`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Klik untuk upload</span>{" "}
                        atau drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF (MAKS. 5MB)
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>

                  {fieldErrors.foto_barang && (
                    <p
                      className={`mt-1 text-sm ${
                        theme === "dark" ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      {fieldErrors.foto_barang}
                    </p>
                  )}
                </div>

                {/* Preview Gambar */}
                {photoPreviewUrl && (
                  <div className="mt-4 flex justify-center">
                    <div className="relative">
                      <img
                        src={photoPreviewUrl}
                        alt="Preview foto"
                        className="max-h-64 max-w-full object-contain rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPhoto(null);
                          setPhotoPreviewUrl("");
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dokumen Pengadaan */}
              <div className="mt-6">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Dokumen Pengadaan
                </label>

                {/* Existing Document */}
                {existingDocumentUrl &&
                  !removeDocument &&
                  !selectedDocument && (
                    <div className="mb-4 p-3 rounded-lg border flex items-center">
                      <svg
                        className="w-8 h-8 mr-3 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div>
                        <p className="font-medium">
                          {existingDocumentUrl.split("/").pop() ||
                            "Dokumen.pdf"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Dokumen pengadaan
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDocument}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                {/* Upload New Document */}
                <div className="flex flex-col items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-document"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Klik untuk upload</span>{" "}
                        atau drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOC, DOCX (MAKS. 10MB)
                      </p>
                    </div>
                    <input
                      id="dropzone-document"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleDocumentChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview Dokumen */}
                {documentPreviewUrl && (
                  <div className="mt-4 p-3 rounded-lg border flex items-center">
                    <svg
                      className="w-8 h-8 mr-3 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    <div>
                      <p className="font-medium">{documentPreviewUrl}</p>
                      <p className="text-sm text-gray-500">Dokumen pengadaan</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDocument(null);
                        setDocumentPreviewUrl("");
                      }}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 6: Preview Kode Aset */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3
                  className={`text-lg font-semibold ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Preview Kode Aset
                </h3>
                <button
                  type="button"
                  onClick={handlePreview}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    theme === "dark"
                      ? "bg-blue-900/30 text-blue-300 hover:bg-blue-800/40"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  Preview Kode
                </button>
              </div>

              {previewData && (
                <div
                  className={`p-4 rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div
                        className={`text-sm mb-2 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Kode aset:
                      </div>
                      <div
                        className={`font-mono text-sm p-2 rounded ${
                          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        {qrCodePreview}
                      </div>
                    </div>

                    <div>
                      <div
                        className={`text-sm mb-2 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Preview QR Code:
                      </div>
                      <div className="flex justify-center">
                        <div className="space-y-2">
                          {(photoPreviewUrl || existingPhotoUrl) &&
                            !removePhoto && (
                              <img
                                src={photoPreviewUrl || existingPhotoUrl}
                                alt="Preview foto"
                                className="h-28 w-28 object-cover rounded shadow-sm mx-auto"
                              />
                            )}
                          {qrCodePreview && (
                            <QRCodeGenerator
                              value={qrCodePreview}
                              size={150}
                              className="p-2 bg-white rounded-lg shadow-sm"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              className={`flex justify-end pt-6 space-x-4 border-t ${
                theme === "dark" ? "border-gray-700" : "border-gray-100"
              }`}
            >
              <button
                type="button"
                onClick={() => navigate(`/assets/${id}`)}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg border transition-colors ${
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className={`px-6 py-2 rounded-lg shadow transition-colors flex items-center ${
                  isSubmitting || items.length === 0
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Aset Berhasil Diperbarui"
        >
          <div className="p-4">
            <div className="text-center mb-6">
              <div
                className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
                  theme === "dark" ? "bg-green-900/30" : "bg-green-100"
                }`}
              >
                <svg
                  className={`h-8 w-8 ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3
                className={`text-lg font-medium mt-4 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Update Aset Berhasil!
              </h3>
              <div
                className={`mt-2 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <p>Informasi aset telah berhasil diperbarui.</p>
              </div>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowSuccessModal(false)}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Tutup
              </button>
              <button
                onClick={handleViewAsset}
                className={`px-4 py-2 rounded-md transition-colors ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                Lihat Detail Aset
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
