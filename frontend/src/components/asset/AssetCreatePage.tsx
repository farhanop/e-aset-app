// src/pages/AssetCreatePage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

interface SelectOption {
  value: string;
  label: string;
  data?: any;
}

// ==================== MAIN COMPONENT ====================
export function AssetCreatePage() {
  const { theme } = useTheme();
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
    jumlah: 1,
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

  // Document State
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string>("");

  // QR & Success Modal State
  const [qrCodePreview, setQrCodePreview] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAssetId, setCreatedAssetId] = useState<number | null>(null);
  const [createdAssetCount, setCreatedAssetCount] = useState<number>(0);
  const [createdAssetPhotoUrl, setCreatedAssetPhotoUrl] = useState<string>("");
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  // Select Options State
  const [itemOptions, setItemOptions] = useState<SelectOption[]>([]);
  const [kampusOptions, setKampusOptions] = useState<SelectOption[]>([]);
  const [gedungOptions, setGedungOptions] = useState<SelectOption[]>([]);
  const [lokasiOptions, setLokasiOptions] = useState<SelectOption[]>([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState<SelectOption[]>([]);

  // Debugging for image loading
  useEffect(() => {
    if (showSuccessModal && createdAssetPhotoUrl) {
      console.log(
        "Modal sukses ditampilkan dengan URL foto:",
        createdAssetPhotoUrl
      );
      setImageLoadError(false);

      // Coba akses URL untuk memeriksa apakah valid
      fetch(createdAssetPhotoUrl, { method: "HEAD" })
        .then((response) => {
          if (response.ok) {
            console.log("✅ URL foto valid dan dapat diakses");
          } else {
            console.error(
              "❌ URL foto tidak dapat diakses, status:",
              response.status
            );
            setImageLoadError(true);
          }
        })
        .catch((error) => {
          console.error("❌ Gagal mengakses URL foto:", error);
          setImageLoadError(true);
        });
    }
  }, [showSuccessModal, createdAssetPhotoUrl]);

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
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.2)" : "none",
      borderRadius: "0.75rem",
      padding: "0.25rem 0",
      minHeight: "44px",
      transition: "all 0.2s ease-in-out",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
      borderRadius: "0.75rem",
      border: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
      padding: "0.75rem 1rem",
      fontSize: "0.875rem",
      transition: "all 0.15s ease-in-out",
      borderRadius: state.isFocused ? "0.375rem" : "0",
      margin: "0.125rem 0.5rem",
      width: "calc(100% - 1rem)",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#fff" : "#1f2937",
      fontSize: "0.875rem",
    }),
    input: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#fff" : "#1f2937",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#9ca3af" : "#6b7280",
      fontSize: "0.875rem",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#9ca3af" : "#6b7280",
      "&:hover": {
        color: theme === "dark" ? "#d1d5db" : "#374151",
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#4b5563" : "#d1d5db",
    }),
  };

  // ==================== GENERATE PREVIEW KODE ASET ====================
  const generatePreviewKodeAset = (
    selectedKampus: Kampus,
    selectedGedung: Gedung,
    selectedLokasi: Lokasi,
    selectedUnitKerja: UnitKerja,
    selectedItem: MasterItem,
    nomorUrut: number,
    tahun: number
  ): string => {
    // Format: U21/LAB301/FT.3/PC.1/2025
    return [
      selectedKampus.kode_kampus, // U
      selectedGedung.kode_gedung, // 2
      selectedLokasi.lantai.toString(), // 1
      "/",
      selectedLokasi.kode_ruangan, // LAB301
      "/",
      selectedUnitKerja.unitUtama?.kode_unit_utama || "FT", // FT
      ".",
      selectedUnitKerja.kode_unit, // 3
      "/",
      selectedItem.kode_item, // PC
      ".",
      nomorUrut.toString(), // 1 (untuk preview)
      "/",
      tahun.toString(), // 2025
    ].join("");
  };

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
      [name]: name === "jumlah" ? Math.max(1, parseInt(value) || 1) : value,
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
    const url = URL.createObjectURL(file);
    setPhotoPreviewUrl(url);
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
    setDocumentPreviewUrl(file.name);
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
    if (!formData.jumlah || formData.jumlah < 1)
      validationErrors.jumlah = "Jumlah harus lebih dari 0";
    if (!selectedPhoto)
      validationErrors.foto_barang = "Foto barang wajib diupload";

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
        jumlah: Number(formData.jumlah),
      };
      setPreviewData(preview);

      // Debug: Tampilkan nilai masing-masing komponen
      console.log("Kode Kampus:", selectedKampus.kode_kampus);
      console.log("Kode Gedung:", selectedGedung.kode_gedung);
      console.log("Lantai:", selectedLokasi.lantai);
      console.log("Kode Ruangan:", selectedLokasi.kode_ruangan);
      console.log(
        "Kode Fakultas:",
        selectedUnitKerja.unitUtama?.kode_unit_utama
      );
      console.log("Kode Prodi:", selectedUnitKerja.kode_unit);
      console.log("Kode Item:", selectedItem.kode_item);
      console.log("Jumlah:", Number(formData.jumlah));

      // Generate kode aset untuk preview dengan format yang benar
      const kodeAset = generatePreviewKodeAset(
        selectedKampus,
        selectedGedung,
        selectedLokasi,
        selectedUnitKerja,
        selectedItem,
        1, // Preview selalu nomor 1
        new Date(formData.tgl_perolehan).getFullYear()
      );

      console.log("Generated Kode Aset Preview:", kodeAset);
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
    if (!formData.jumlah || formData.jumlah < 1)
      validationErrors.jumlah = "Jumlah harus lebih dari 0";
    if (!selectedPhoto)
      validationErrors.foto_barang = "Foto barang wajib diupload";

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

      // ✅ KIRIM DATA TANPA GENERATE KODE ASET - BACKEND AKAN HANDLE OTOMATIS
      const payload = {
        id_item: Number(formData.id_item),
        id_lokasi: Number(formData.id_lokasi),
        id_unit_kerja: Number(formData.id_unit_kerja),
        merk: formData.merk || undefined,
        tipe_model: formData.tipe_model || undefined,
        spesifikasi: formData.spesifikasi || undefined,
        tgl_perolehan: formData.tgl_perolehan,
        sumber_dana: formData.sumber_dana || undefined,
        jumlah: Number(formData.jumlah),
        status_aset: formData.status_aset,
        kondisi_terakhir: formData.kondisi_terakhir,
        foto_barang: fotoPath || undefined,
        file_dokumen: dokumenPath || undefined,
        // ❌ HAPUS: nomor_aset - Backend akan generate otomatis
      };

      console.log("📤 Sending payload:", payload);

      const response = await api.post("/assets", payload);

      console.log("✅ Response:", response.data);

      // Ambil data aset pertama
      const firstAsset = response.data.data?.[0];
      if (firstAsset) {
        setCreatedAssetId(firstAsset.id_aset);

        // Pastikan URL foto lengkap dengan base URL API
        const baseUrl = api.defaults.baseURL || "";
        const photoUrl = firstAsset.foto_barang
          ? firstAsset.foto_barang.startsWith("http")
            ? firstAsset.foto_barang
            : `${baseUrl}${firstAsset.foto_barang}`
          : "";

        setCreatedAssetPhotoUrl(photoUrl);

        console.log(
          "🎯 Kode Aset yang dihasilkan backend:",
          firstAsset.kode_aset
        );
        console.log("🖼️ URL Foto:", photoUrl);
      }
      setCreatedAssetCount(Number(formData.jumlah));

      // Tampilkan modal sukses
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("❌ Gagal membuat aset:", error);
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
        setError("Gagal membuat aset. Periksa koneksi internet dan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== MODAL HANDLERS ====================
  const handleViewAsset = () => {
    if (createdAssetId) {
      navigate(`/assets/${createdAssetId}`);
    }
  };

  const handleCreateAnother = () => {
    setFormData({
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
      jumlah: 1,
      status_aset: "Tersedia",
      kondisi_terakhir: "Baik",
    });
    setPreviewData(null);
    setQrCodePreview("");
    setSelectedPhoto(null);
    setSelectedDocument(null);
    setPhotoPreviewUrl("");
    setDocumentPreviewUrl("");
    setShowSuccessModal(false);
  };

  const handleBackToAssets = () => {
    navigate("/assets");
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-blue-50 to-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p
            className={`mt-4 text-lg font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Memuat data master...
          </p>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-blue-50 to-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 border-b backdrop-blur-sm ${
          theme === "dark"
            ? "bg-gray-900/80 border-gray-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/assets")}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "hover:bg-gray-800 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <svg
                  className="w-6 h-6"
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
              </button>
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  Pendaftaran Aset Baru
                </h1>
                <p
                  className={`mt-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Daftarkan aset baru ke dalam sistem inventaris
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                className={`px-6 py-2 rounded-lg border-2 transition-all duration-200 font-medium ${
                  theme === "dark"
                    ? "border-blue-600 text-blue-400 hover:bg-blue-900/30"
                    : "border-blue-500 text-blue-600 hover:bg-blue-50"
                }`}
              >
                Preview Kode
              </button>
              <button
                onClick={() => navigate("/assets")}
                className={`px-6 py-2 rounded-lg border transition-all duration-200 font-medium ${
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || items.length === 0}
                className={`px-6 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 ${
                  isSubmitting || items.length === 0
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Simpan Aset
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Error Alert */}
        {error && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 border-red-500 flex items-start ${
              theme === "dark"
                ? "bg-red-900/20 border-red-800"
                : "bg-red-50 border-red-200"
            }`}
          >
            <svg
              className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
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
                Gagal membuat aset
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

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
          {/* Main Form - Scrollable */}
          <div className="xl:col-span-3">
            <div
              className={`h-full rounded-2xl border ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="h-full overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                  {/* Section 1: Informasi Lokasi */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          theme === "dark" ? "bg-blue-900/30" : "bg-blue-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <h3
                        className={`text-xl font-semibold ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        Informasi Lokasi
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                      {/* Kampus */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
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
                            className={`text-sm ${
                              theme === "dark" ? "text-red-400" : "text-red-600"
                            }`}
                          >
                            {fieldErrors.id_kampus}
                          </p>
                        )}
                      </div>

                      {/* Gedung */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
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
                            className={`text-sm ${
                              theme === "dark" ? "text-red-400" : "text-red-600"
                            }`}
                          >
                            {fieldErrors.id_gedung}
                          </p>
                        )}
                      </div>

                      {/* Lokasi */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
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
                            className={`text-sm ${
                              theme === "dark" ? "text-red-400" : "text-red-600"
                            }`}
                          >
                            {fieldErrors.id_lokasi}
                          </p>
                        )}
                      </div>

                      {/* Unit Kerja */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
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
                            className={`text-sm ${
                              theme === "dark" ? "text-red-400" : "text-red-600"
                            }`}
                          >
                            {fieldErrors.id_unit_kerja}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Informasi Aset */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "bg-purple-900/30"
                            : "bg-purple-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <h3
                        className={`text-xl font-semibold ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        Informasi Aset
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Jenis Item */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
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
                            className={`text-sm ${
                              theme === "dark" ? "text-red-400" : "text-red-600"
                            }`}
                          >
                            {fieldErrors.id_item}
                          </p>
                        )}
                      </div>

                      {/* Jumlah */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Jumlah (Input Massal){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="jumlah"
                          value={formData.jumlah}
                          onChange={handleChange}
                          min="1"
                          max="100"
                          required
                          className={`w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            fieldErrors.jumlah
                              ? theme === "dark"
                                ? "border-red-500 bg-red-900/20 text-red-200"
                                : "border-red-300 bg-red-50 text-red-900"
                              : theme === "dark"
                              ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                          }`}
                        />
                        {fieldErrors.jumlah && (
                          <p
                            className={`text-sm ${
                              theme === "dark" ? "text-red-400" : "text-red-600"
                            }`}
                          >
                            {fieldErrors.jumlah}
                          </p>
                        )}
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {formData.jumlah > 1
                            ? `Akan dibuat ${formData.jumlah} aset dengan kode berurutan`
                            : "Akan dibuat 1 aset"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Merk */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
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
                          className={`w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            theme === "dark"
                              ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="Contoh: Samsung, Dell, dll."
                        />
                      </div>

                      {/* Tipe/Model */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
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
                          className={`w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            theme === "dark"
                              ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="Contoh: Galaxy S21, Inspiron 15"
                        />
                      </div>
                    </div>

                    {/* Spesifikasi */}
                    <div className="space-y-2">
                      <label
                        className={`block text-sm font-semibold ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Spesifikasi Lengkap
                      </label>
                      <textarea
                        name="spesifikasi"
                        value={formData.spesifikasi}
                        onChange={handleChange}
                        rows={4}
                        className={`w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          theme === "dark"
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        placeholder="Deskripsi detail spesifikasi aset..."
                      ></textarea>
                    </div>
                  </div>

                  {/* Section 3: Informasi Pengadaan */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          theme === "dark" ? "bg-green-900/30" : "bg-green-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3
                        className={`text-xl font-semibold ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        Informasi Pengadaan
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Tanggal Perolehan */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Tanggal Perolehan{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="tgl_perolehan"
                          value={formData.tgl_perolehan}
                          onChange={handleChange}
                          required
                          className={`w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                            className={`text-sm ${
                              theme === "dark" ? "text-red-400" : "text-red-600"
                            }`}
                          >
                            {fieldErrors.tgl_perolehan}
                          </p>
                        )}
                      </div>

                      {/* Sumber Dana */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
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
                          className={`w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            theme === "dark"
                              ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                          }`}
                          placeholder="Contoh: APBN, APBD, Mandiri"
                        />
                      </div>

                      {/* Status Aset */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Status Aset
                        </label>
                        <select
                          name="status_aset"
                          value={formData.status_aset}
                          onChange={handleChange}
                          className={`w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            theme === "dark"
                              ? "border-gray-600 bg-gray-700 text-white"
                              : "border-gray-300 bg-white text-gray-900"
                          }`}
                        >
                          <option value="Tersedia">Tersedia</option>
                          <option value="Dipinjam">Dipinjam</option>
                          <option value="Diperbaiki">Diperbaiki</option>
                          <option value="Dihapuskan">Dihapuskan</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Kondisi Terakhir */}
                      <div className="space-y-2">
                        <label
                          className={`block text-sm font-semibold ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Kondisi Terakhir
                        </label>
                        <select
                          name="kondisi_terakhir"
                          value={formData.kondisi_terakhir}
                          onChange={handleChange}
                          className={`w-full rounded-xl border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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
                  </div>

                  {/* Section 4: Upload File */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          theme === "dark"
                            ? "bg-orange-900/30"
                            : "bg-orange-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                      </div>
                      <h3
                        className={`text-xl font-semibold ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        Upload File
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Foto Barang */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label
                            className={`block text-sm font-semibold ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                            }`}
                          >
                            Foto Barang <span className="text-red-500">*</span>
                          </label>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              theme === "dark"
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            Maks. 5MB
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center w-full">
                          <label
                            htmlFor="dropzone-file"
                            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                              theme === "dark"
                                ? "border-gray-600 bg-gray-700/50 hover:bg-gray-700 hover:border-blue-500"
                                : "border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-500"
                            } ${
                              fieldErrors.foto_barang ? "border-red-500" : ""
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg
                                className="w-12 h-12 mb-4 text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 16"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">
                                  Klik untuk upload
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG, GIF
                              </p>
                            </div>
                            <input
                              id="dropzone-file"
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="hidden"
                              required
                            />
                          </label>
                          {fieldErrors.foto_barang && (
                            <p
                              className={`mt-2 text-sm ${
                                theme === "dark"
                                  ? "text-red-400"
                                  : "text-red-600"
                              }`}
                            >
                              {fieldErrors.foto_barang}
                            </p>
                          )}
                        </div>

                        {/* Preview Gambar */}
                        {photoPreviewUrl && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-sm font-medium ${
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-700"
                                }`}
                              >
                                Preview Foto:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPhoto(null);
                                  setPhotoPreviewUrl("");
                                }}
                                className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                                  theme === "dark"
                                    ? "bg-red-900/30 text-red-400 hover:bg-red-800/40"
                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                                }`}
                              >
                                Hapus
                              </button>
                            </div>
                            <div className="relative inline-block">
                              <img
                                src={photoPreviewUrl}
                                alt="Preview foto"
                                className="h-32 w-32 object-cover rounded-xl shadow-lg border"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dokumen Pengadaan */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label
                            className={`block text-sm font-semibold ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                            }`}
                          >
                            Dokumen Pengadaan
                          </label>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              theme === "dark"
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            Maks. 10MB
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center w-full">
                          <label
                            htmlFor="dropzone-document"
                            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                              theme === "dark"
                                ? "border-gray-600 bg-gray-700/50 hover:bg-gray-700 hover:border-blue-500"
                                : "border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-500"
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg
                                className="w-12 h-12 mb-4 text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 16"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">
                                  Klik untuk upload
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF, DOC, DOCX
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
                          <div className="mt-4 p-4 rounded-xl border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <svg
                                className="w-8 h-8 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <div>
                                <p className="font-medium text-sm">
                                  {documentPreviewUrl}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Dokumen pengadaan
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDocument(null);
                                setDocumentPreviewUrl("");
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors"
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
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="xl:col-span-1">
            <div
              className={`h-full rounded-2xl border ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="h-full overflow-y-auto p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`p-2 rounded-lg ${
                      theme === "dark" ? "bg-yellow-900/30" : "bg-yellow-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 text-yellow-600"
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
                  </div>
                  <h3
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Preview
                  </h3>
                </div>

                {previewData ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div
                        className={`text-sm mb-2 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Format kode aset:
                      </div>
                      <div
                        className={`font-mono text-sm p-3 rounded-xl ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        {qrCodePreview}
                      </div>
                      <div
                        className={`mt-2 text-xs ${
                          theme === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {previewData.jumlah > 1
                          ? `Akan dibuat ${previewData.jumlah} aset dengan kode berurutan`
                          : "Akan dibuat 1 aset"}
                      </div>
                    </div>

                    <div className="text-center">
                      <div
                        className={`text-sm mb-3 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Preview QR Code:
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        {photoPreviewUrl && (
                          <img
                            src={photoPreviewUrl}
                            alt="Preview foto"
                            className="h-24 w-24 object-cover rounded-xl shadow-lg border"
                          />
                        )}
                        {qrCodePreview && (
                          <div className="p-3 bg-white rounded-xl shadow-lg">
                            <QRCodeGenerator value={qrCodePreview} size={120} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-center py-8 ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    <svg
                      className="w-12 h-12 mx-auto mb-3 opacity-50"
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
                    <p className="text-sm">
                      Klik "Preview Kode Aset" untuk melihat pratinjau
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Aset Berhasil Dibuat"
        >
          <div className="p-6">
            <div className="text-center mb-6">
              <div
                className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full ${
                  theme === "dark" ? "bg-green-900/30" : "bg-green-100"
                }`}
              >
                <svg
                  className={`h-10 w-10 ${
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
                className={`text-xl font-semibold mt-4 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Pendaftaran Aset Berhasil!
              </h3>
              <div
                className={`mt-3 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <p>
                  {createdAssetCount > 1
                    ? `${createdAssetCount} aset berhasil didaftarkan ke dalam sistem.`
                    : "1 aset berhasil didaftarkan ke dalam sistem."}
                </p>
                <p className="mt-2">
                  QR Code telah dibuat secara otomatis untuk setiap aset.
                </p>

                {/* Display asset photo with error handling */}
                {createdAssetPhotoUrl ? (
                  <div className="mt-4">
                    <div className="text-sm mb-2 font-medium">Foto Barang:</div>
                    <div className="flex justify-center">
                      {imageLoadError ? (
                        <div className="h-32 w-32 bg-gray-200 rounded-xl flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      ) : (
                        <img
                          src={createdAssetPhotoUrl}
                          alt="Foto aset"
                          className="h-32 w-32 object-cover rounded-xl shadow-lg border"
                          onError={(e) => {
                            console.error("Gagal memuat gambar:", e);
                            setImageLoadError(true);
                            e.currentTarget.src =
                              "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+";
                          }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center">
                    <div className="text-sm mb-2 text-gray-500">
                      Tidak ada foto yang tersedia
                    </div>
                    <div className="flex justify-center">
                      <div className="h-32 w-32 bg-gray-200 rounded-xl flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleBackToAssets}
                className={`px-6 py-3 border rounded-xl transition-all duration-300 font-medium ${
                  theme === "dark"
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Kembali ke Daftar
              </button>
              <button
                onClick={handleCreateAnother}
                className={`px-6 py-3 border rounded-xl transition-all duration-300 font-medium ${
                  theme === "dark"
                    ? "border-blue-600 text-blue-400 hover:bg-blue-900/30"
                    : "border-blue-500 text-blue-600 hover:bg-blue-50"
                }`}
              >
                Buat Lagi
              </button>
              <button
                onClick={handleViewAsset}
                className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium text-white ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Lihat Detail
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
