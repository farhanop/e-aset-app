// frontend/src/components/forms/PrintInventoryReport.tsx
import { forwardRef } from 'react';

interface Asset {
  id_aset: number;
  kode_aset: string;
  item: { nama_item: string };
  status_aset: string;
  kondisi_terakhir: string;
}

interface PrintInventoryReportProps {
  assets: Asset[];
  selectedGedungName: string;
  selectedUnitName: string;
  selectedLokasiName: string;
  reportNumber: string;
}

const PrintInventoryReport = forwardRef<HTMLDivElement, PrintInventoryReportProps>(
  ({ assets, selectedGedungName, selectedUnitName, selectedLokasiName }, ref) => {
    // Tanggal tetap 18 Oktober 2025 sesuai permintaan
    const recordDateStr = '18 Oktober 2025';

    // Format tanggal untuk tanda tangan
    const currentDate = new Date();
    const signatureDateStr = currentDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Kelompokkan aset berdasarkan nama item
    const groupedAssets = assets.reduce((acc, asset) => {
      const itemName = asset.item.nama_item;
      if (!acc[itemName]) {
        acc[itemName] = {
          ...asset,
          count: 1
        };
      } else {
        acc[itemName].count += 1;
      }
      return acc;
    }, {} as Record<string, Asset & { count: number }>);

    // Ubah ke array dan urutkan
    const sortedAssets = Object.values(groupedAssets).sort((a, b) => {
      return a.item.nama_item.localeCompare(b.item.nama_item);
    });

    return (
      <div ref={ref} className="p-8 bg-white text-black" style={{ 
        fontSize: '12pt', 
        fontFamily: 'Times New Roman, serif', 
        lineHeight: '1.5' // Mengubah spasi menjadi 1.5
      }}>
        {/* Kop Surat dengan Kotak Header */}
        <div className="border-2 border-gray-800 p-4 mb-6">
          <div className="flex items-center">
            <div className="w-1/6">
              <img 
                src="/uigm.png" 
                alt="Logo UIGM" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <div className="w-5/6 text-center">
              <h1 className="font-bold mb-2" style={{ fontSize: '22pt' }}>DAFTAR INVENTARIS RUANGAN</h1>
              <p className="font-normal" style={{ fontSize: '17pt' }}>FM-PM-13.4/08.02</p>
              {/* Nomor laporan dihapus sesuai permintaan */}
            </div>
          </div>
        </div>

        {/* Informasi Ruangan dan Tanggal - Dua Kolom */}
        <div className="mb-6">
          <table className="w-full">
            <tbody>
              <tr>
                {/* Kolom Kiri */}
                <td className="w-1/2 align-top" valign="top">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="w-2/5 align-top"><strong>Gedung</strong></td>
                        <td className="w-3/5 align-top">: {selectedGedungName || 'TES'}</td>
                      </tr>
                      <tr>
                        <td className="w-2/5 align-top"><strong>Unit</strong></td>
                        <td className="w-3/5 align-top">: {selectedUnitName || 'BPT'}</td>
                      </tr>
                      <tr>
                        <td className="w-2/5 align-top"><strong>Nama Ruangan</strong></td>
                        <td className="w-3/5 align-top">: {selectedLokasiName || 'BPT'}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                
                {/* Kolom Kanan */}
                <td className="w-1/2 align-top" valign="top">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="w-2/5 align-top"><strong>Tanggal Pencatatan</strong></td>
                        <td className="w-3/5 align-top">: {recordDateStr}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel Data Aset */}
        <table className="w-full border border-gray-800 mb-4" style={{ borderCollapse: 'collapse', fontSize: '10pt' }}>
          <thead>
            <tr>
              <th className="border border-gray-800 px-2 py-1 text-center font-bold w-8">No</th>
              <th className="border border-gray-800 px-2 py-1 text-center font-bold">ID Barang/Alat</th>
              <th className="border border-gray-800 px-2 py-1 text-center font-bold">Nama Barang/Alat</th>
              <th className="border border-gray-800 px-2 py-1 text-center font-bold" colSpan={3}>Kondisi</th>
              <th className="border border-gray-800 px-2 py-1 text-center font-bold w-16">Jumlah</th>
              <th className="border border-gray-800 px-2 py-1 text-center font-bold">Ket</th>
            </tr>
            <tr>
              <td className="border border-gray-800 px-2 py-1 text-center" colSpan={3}></td>
              <td className="border border-gray-800 px-2 py-1 text-center font-medium">Baik</td>
              <td className="border border-gray-800 px-2 py-1 text-center font-medium">Rusak</td>
              <td className="border border-gray-800 px-2 py-1 text-center font-medium">Butuh Perbaikan</td>
              <td className="border border-gray-800 px-2 py-1 text-center"></td>
              <td className="border border-gray-800 px-2 py-1 text-center"></td>
            </tr>
          </thead>
          <tbody>
            {sortedAssets.length > 0 ? (
              sortedAssets.map((asset, index) => (
                <tr key={asset.id_aset}>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">
                    {(index + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="border border-gray-800 px-2 py-1 align-top">
                    {asset.kode_aset || '-'}
                  </td>
                  <td className="border border-gray-800 px-2 py-1 align-top">
                    {asset.item.nama_item}
                  </td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">
                    {asset.kondisi_terakhir === 'Baik' ? '✓' : ''}
                  </td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">
                    {asset.kondisi_terakhir === 'Rusak' ? '✓' : ''}
                  </td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">
                    {asset.kondisi_terakhir === 'Butuh Perbaikan' ? '✓' : ''}
                  </td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">
                    {asset.count} Buah
                  </td>
                  <td className="border border-gray-800 px-2 py-1 align-top">
                    {/* Keterangan tidak tersedia di API */}
                  </td>
                </tr>
              ))
            ) : (
              // Data contoh dari gambar
              <>
                <tr>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">01</td>
                  <td className="border border-gray-800 px-2 py-1 align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 align-top">AC Uchida 2 PK</td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">1 Buah</td>
                  <td className="border border-gray-800 px-2 py-1 align-top"></td>
                </tr>
                <tr>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">02</td>
                  <td className="border border-gray-800 px-2 py-1 align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 align-top">Bemot AC Uchida</td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">1 Buah</td>
                  <td className="border border-gray-800 px-2 py-1 align-top"></td>
                </tr>
                <tr>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">03</td>
                  <td className="border border-gray-800 px-2 py-1 align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 align-top">Lampu Philips Neon</td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">1 Buah</td>
                  <td className="border border-gray-800 px-2 py-1 align-top"></td>
                </tr>
                <tr>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">04</td>
                  <td className="border border-gray-800 px-2 py-1 align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 align-top">Sorden Vertical Blind</td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">1 buah</td>
                  <td className="border border-gray-800 px-2 py-1 align-top"></td>
                </tr>
                <tr>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">05</td>
                  <td className="border border-gray-800 px-2 py-1 align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 align-top">Daftar Inventaris</td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top"></td>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">1 Buah</td>
                  <td className="border border-gray-800 px-2 py-1 align-top"></td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        {/* Garis pemisah */}
        <div className="border-t border-gray-800 my-4"></div>

        {/* Catatan - Sesuai permintaan */}
        <div className="mb-8" style={{ fontSize: '12pt' }}>
          <p className="font-semibold mb-2">Catatan:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Pengisian Daftar Inventaris Ruangan disesuaikan dengan Daftar Inventaris Barang/Alat yang berada dalam Ruangan Tersebut.</li>
            <li>Setiap perubahan pada daftar Inventaris Barang/Alat akan diikuti oleh perubahan pada Daftar Inventaris Ruangan.</li>
            <li>Perbaruan/Updating data terkait Inventaris ruangan dilakukan setiap 1 tahun. (pada bulan Agustus laporan inventaris ke Yayasan IGM)</li>
          </ol>
        </div>

        {/* Tanda Tangan - Format Tabel seperti di gambar */}
        <div className="mt-12" style={{ fontSize: '10pt' }}>
          {/* Tanggal di atas TTD */}
          <div className="text-center mb-8">
            <p>Palembang, {signatureDateStr}</p>
            <p className="font-semibold mb-4">Mengetahui,</p>
          </div>

          {/* Tabel Tanda Tangan */}
          <table className="w-full border border-gray-800" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {/* Baris Jabatan */}
              <tr>
                <td className="border border-gray-800 w-1/3 text-center p-2">
                  <p className="font-semibold">Kepala Biro Administrasi Umum</p>
                </td>
                <td className="border border-gray-800 w-1/3 text-center p-2">
                  <p className="font-semibold">Kabag. Umum dan Sarpras</p>
                </td>
                <td className="border border-gray-800 w-1/3 text-center p-2">
                  <p className="font-semibold">Kasi. Kebersihan dan Sarpras</p>
                </td>
              </tr>
              
              {/* Ruang untuk tanda tangan */}
              <tr>
                <td className="border border-gray-800 h-24"></td>
                <td className="border border-gray-800 h-24"></td>
                <td className="border border-gray-800 h-24"></td>
              </tr>
              
              {/* Baris Nama dan NIK */}
              <tr>
                <td className="border border-gray-800 text-center p-1">
                  <p className="underline font-semibold">Sylvia Dwi Lestari, SE., M.Si., Ak., CA</p>
                  <p className="text-xs">NITK 7700014258</p>
                </td>
                <td className="border border-gray-800 text-center p-1">
                  <p className="underline font-semibold">Samat, S.Si., M.Si</p>
                  <p className="text-xs">NIK 2006.01.0106</p>
                </td>
                <td className="border border-gray-800 text-center p-1">
                  <p className="underline font-semibold">Yepi, SP</p>
                  <p className="text-xs">NIK. 2009.02.0046</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

PrintInventoryReport.displayName = 'PrintInventoryReport';

export default PrintInventoryReport;