// src/components/forms/PeminjamanForm.tsx
import { useState } from 'react';

interface FormProps {
  onSubmit: (data: { nama_peminjam: string; identitas_peminjam: string; tgl_rencana_kembali: string }) => void;
  onCancel: () => void;
}

export function PeminjamanForm({ onSubmit, onCancel }: FormProps) {
  const [formData, setFormData] = useState({
    nama_peminjam: '',
    identitas_peminjam: '',
    tgl_rencana_kembali: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Peminjam</label>
        <input type="text" name="nama_peminjam" value={formData.nama_peminjam} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Identitas (NIM/NIDN)</label>
        <input type="text" name="identitas_peminjam" value={formData.identitas_peminjam} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Rencana Kembali</label>
        <input type="date" name="tgl_rencana_kembali" value={formData.tgl_rencana_kembali} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700" />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-600">Batal</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Pinjamkan</button>
      </div>
    </form>
  );
}