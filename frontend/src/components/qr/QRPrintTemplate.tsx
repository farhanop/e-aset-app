// src/components/QRPrintTemplate.tsx

interface AssetData {
  kode_aset: string;
  item?: { nama_item: string };
  merk: string;
  tipe_model: string;
  lokasi?: { nama_ruangan: string };
  status_aset: string;
  file_qrcode?: string | null;
}

// Exportable CSS used by both the single-card template and the multi-card print document.
export const QR_CARD_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Card-scoped styles only - avoid global body or @media rules so multi-card pages don't conflict */
.container {
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 2mm;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 1.5mm;
  padding-bottom: 1mm;
  border-bottom: 1px solid #e2e8f0;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1mm;
  gap: 1mm;
}

.logo {
  width: 8mm;
  height: 8mm;
  border-radius: 2px;
  background: white;
  padding: 0.5mm;
  border: 1px solid #e2e8f0;
  object-fit: contain;
}

.logo-text { text-align: left; }
.logo-text h2 { font-size: 6px; font-weight: 700; margin-bottom: 0.5px; color: #1e293b; line-height: 1.1; }
.logo-text p { font-size: 4px; color: #64748b; line-height: 1.1; }

.header h1 { font-size: 7px; font-weight: 700; margin-bottom: 0.5mm; color: #1e293b; }
.header-subtitle { font-size: 4.5px; color: #64748b; }

.content { display: flex; gap: 2mm; flex-grow: 1; }
.info-section { flex: 1; display: flex; flex-direction: column; gap: 0.8mm; font-size: 4.5px; }
.info-row { display: flex; gap: 1mm; }
.info-label { font-weight: 600; color: #64748b; min-width: 12mm; flex-shrink: 0; }
.info-value { font-weight: 500; color: #1e293b; flex-grow: 1; }
.print-date-value { font-weight: 600; color: #3b82f6; }

.qr-section { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 20mm; }
.qr-container { width: 18mm; height: 18mm; border: 1px solid #e2e8f0; border-radius: 2px; display: flex; align-items: center; justify-content: center; background: white; margin-bottom: 1mm; }
.qr-image { max-width: 100%; max-height: 100%; }
.qr-placeholder { color: #94a3b8; font-size: 4px; text-align: center; padding: 1mm; }
.qr-code-text { font-family: 'Courier New', monospace; font-size: 4px; font-weight: 700; color: #1e293b; text-align: center; word-break: break-all; }
.footer { display: flex; justify-content: center; align-items: center; font-size: 3.5px; color: #64748b; padding-top: 0.5mm; border-top: 0.5px solid #e2e8f0; margin-top: 1mm; }
`;

export const generateQRPrintHTML = (asset: AssetData, qrCodeUrl: string | null): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kode Aset - ${asset.kode_aset}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background: white;
          color: #1e293b;
          line-height: 1.3;
          width: 90mm;
          height: 50mm;
          padding: 2mm;
          overflow: hidden;
        }
        
        .container {
          width: 100%;
          height: 100%;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 2mm;
          display: flex;
          flex-direction: column;
        }
        
        .header {
          text-align: center;
          margin-bottom: 1.5mm;
          padding-bottom: 1mm;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1mm;
          gap: 1mm;
        }
        
        .logo {
          width: 8mm;
          height: 8mm;
          border-radius: 2px;
          background: white;
          padding: 0.5mm;
          border: 1px solid #e2e8f0;
          object-fit: contain;
        }
        
        .logo-text {
          text-align: left;
        }
        
        .logo-text h2 {
          font-size: 6px;
          font-weight: 700;
          margin-bottom: 0.5px;
          color: #1e293b;
          line-height: 1.1;
        }
        
        .logo-text p {
          font-size: 4px;
          color: #64748b;
          line-height: 1.1;
        }
        
        .header h1 {
          font-size: 7px;
          font-weight: 700;
          margin-bottom: 0.5mm;
          color: #1e293b;
        }
        
        .header-subtitle {
          font-size: 4.5px;
          color: #64748b;
        }
        
        .content {
          display: flex;
          gap: 2mm;
          flex-grow: 1;
        }
        
        .info-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.8mm;
          font-size: 4.5px;
        }
        
        .info-row {
          display: flex;
          gap: 1mm;
        }
        
        .info-label {
          font-weight: 600;
          color: #64748b;
          min-width: 12mm;
          flex-shrink: 0;
        }
        
        .info-value {
          font-weight: 500;
          color: #1e293b;
          flex-grow: 1;
        }
        
        .print-date-value {
          font-weight: 600;
          color: #3b82f6;
        }
        
        .qr-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 20mm;
        }
        
        .qr-container {
          width: 18mm;
          height: 18mm;
          border: 1px solid #e2e8f0;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          margin-bottom: 1mm;
        }
        
        .qr-image {
          max-width: 100%;
          max-height: 100%;
        }
        
        .qr-placeholder {
          color: #94a3b8;
          font-size: 4px;
          text-align: center;
          padding: 1mm;
        }
        
        .qr-code-text {
          font-family: 'Courier New', monospace;
          font-size: 4px;
          font-weight: 700;
          color: #1e293b;
          text-align: center;
          word-break: break-all;
        }
        
        .footer {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 3.5px;
          color: #64748b;
          padding-top: 0.5mm;
          border-top: 0.5px solid #e2e8f0;
          margin-top: 1mm;
        }
        
        .print-controls {
          position: fixed;
          top: 10px;
          right: 10px;
          background: white;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
        }
        
        .print-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          margin-right: 8px;
        }
        
        .close-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }
        
        @media print {
          body {
            width: 90mm;
            height: 50mm;
            padding: 2mm;
            background: white;
          }
          
          .container {
            border: none;
            box-shadow: none;
          }
          
          .print-controls {
            display: none !important;
          }
          
          @page {
            size: 90mm 50mm;
            margin: 0mm;
          }
        }
        
        @media screen {
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f8fafc;
            padding: 20px;
          }
          
          .container {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
        }
      </style>
    </head>
    <body>
      <div class="print-controls no-print">
        <button class="print-btn" onclick="handlePrint()">🖨️ Cetak</button>
        <button class="close-btn" onclick="handleClose()">❌ Tutup</button>
      </div>
      
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img src="/uigm.png" alt="Logo UIGM" class="logo" onerror="this.style.display='none'">
            <div class="logo-text">
              <h2>UIGM</h2>
              <p>Sistem Aset Digital</p>
            </div>
          </div>
          <h1>KARTU IDENTITAS ASET</h1>
          <p class="header-subtitle">Dokumen Resmi Inventaris</p>
        </div>
        
        <div class="content">
          <div class="info-section">
            <div class="info-row">
              <div class="info-label">Kode Aset</div>
              <div class="info-value" style="font-weight: 700; color: #3b82f6;">${asset.kode_aset}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Nama Barang</div>
              <div class="info-value" style="font-weight: 600;">${asset.item?.nama_item || 'N/A'}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Merk</div>
              <div class="info-value">${asset.merk || '-'}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Tipe/Model</div>
              <div class="info-value">${asset.tipe_model || '-'}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Lokasi</div>
              <div class="info-value">${asset.lokasi?.nama_ruangan || 'N/A'}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Tanggal Cetak</div>
              <div class="info-value print-date-value">
                ${new Date().toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
          
          <div class="qr-section">
            <div class="qr-container">
              ${qrCodeUrl 
                ? `<img src="${qrCodeUrl}" alt="QR Code Aset ${asset.kode_aset}" class="qr-image" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"/>
                   <div class="qr-placeholder" style="display:none;">
                     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 6mm; height: 6mm;">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h1m-6 0h1m-6 0h1m6 0v1m-6-4v1m6-5v1M9 9v1m3-6h1m3 0h1M9 4h1m3 0h1M9 20h1m3 0h1m-3-4h1m3 0h1M9 16h1"/>
                     </svg>
                   </div>` 
                : `<div class="qr-placeholder">
                     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 6mm; height: 6mm;">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h1m-6 0h1m-6 0h1m6 0v1m-6-4v1m6-5v1M9 9v1m3-6h1m3 0h1M9 4h1m3 0h1M9 20h1m3 0h1m-3-4h1m3 0h1M9 16h1"/>
                     </svg>
                   </div>`
              }
            </div>
            
            <div class="qr-code-text">${asset.kode_aset}</div>
          </div>
        </div>
        
        <div class="footer">
          e-Aset UIGM
        </div>
      </div>

      <script>
        let printAttempted = false;
        let printCancelled = false;
        let printSucceeded = false;
        
        function handlePrint() {
          printAttempted = true;
          printCancelled = false;
          printSucceeded = false;
          window.print();
        }
        
        function handleClose() {
          printCancelled = true;
          printSucceeded = false;
          window.close();
        }
        
        // Auto print saat halaman dimuat
        window.onload = function() {
          setTimeout(() => {
            if (!printAttempted) {
              handlePrint();
            }
          }, 500);
        };
        
        // Handle setelah print
        window.onafterprint = function(event) {
          if (printSucceeded && !printCancelled) {
            // Hanya tutup window jika print berhasil dan tidak dibatalkan
            setTimeout(() => {
              if (!window.closed) {
                window.close();
              }
            }, 1000);
          }
          // Reset status untuk print berikutnya
          printAttempted = false;
        };
        
        // Deteksi ketika print dialog muncul
        window.onbeforeprint = function() {
          printCancelled = false;
          printSucceeded = false;
        };
        
        // Deteksi ketika print berhasil (bukan dibatalkan)
        function detectPrintSuccess() {
          // Jika sudah ada attempt print dan tidak ada tanda pembatalan dalam 2 detik,
          // anggap print berhasil
          if (printAttempted && !printCancelled) {
            printSucceeded = true;
          }
        }
        
        // Event listeners untuk browser support
        if (window.matchMedia) {
          let mediaQueryList = window.matchMedia('print');
          mediaQueryList.addListener(function(mql) {
            if (mql.matches) {
              // Sebelum print
              printCancelled = false;
              printSucceeded = false;
            } else {
              // Setelah print - tunggu sebentar untuk deteksi pembatalan
              setTimeout(detectPrintSuccess, 2000);
            }
          });
        }
        
        // Tambahkan event listener untuk keypress (ESC key)
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            printCancelled = true;
            printSucceeded = false;
          }
        });
        
        // Fallback untuk browser yang tidak support matchMedia
        setTimeout(() => {
          if (printAttempted && !printSucceeded && !printCancelled) {
            // Jika tidak ada kejadian print dalam 3 detik setelah attempt, anggap dibatalkan
            printCancelled = true;
          }
        }, 3000);
      </script>
    </body>
    </html>
  `;
};

// Card-only HTML snippet (no <html>/<head>/<body>) so it can be composed
export const generateQRCardHTML = (asset: AssetData, qrCodeUrl: string | null): string => {
  return `
    <div class="container">
      <div class="header">
        <div class="logo-container">
          <img src="/uigm.png" alt="Logo UIGM" class="logo" onerror="this.style.display='none'" />
          <div class="logo-text">
            <h2>UIGM</h2>
            <p>Sistem Aset Digital</p>
          </div>
        </div>
        <h1>KARTU IDENTITAS ASET</h1>
        <p class="header-subtitle">Dokumen Resmi Inventaris</p>
      </div>
      <div class="content">
        <div class="info-section">
          <div class="info-row">
            <div class="info-label">Kode Aset</div>
            <div class="info-value" style="font-weight: 700; color: #3b82f6;">${asset.kode_aset}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Nama Barang</div>
            <div class="info-value" style="font-weight: 600;">${asset.item?.nama_item || 'N/A'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Merk</div>
            <div class="info-value">${asset.merk || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Tipe/Model</div>
            <div class="info-value">${asset.tipe_model || '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Lokasi</div>
            <div class="info-value">${asset.lokasi?.nama_ruangan || 'N/A'}</div>
          </div>
        </div>
        <div class="qr-section">
          <div class="qr-container">
            ${qrCodeUrl ? `<img src="${qrCodeUrl}" class="qr-image" alt="QR ${asset.kode_aset}" />` : `<div class="qr-placeholder">QR</div>`}
          </div>
          <div class="qr-code-text">${asset.kode_aset}</div>
        </div>
      </div>
      <div class="footer">e-Aset UIGM</div>
    </div>
  `;
};