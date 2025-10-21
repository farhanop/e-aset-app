// frontend/src/components/forms/QRCodeGenerator.tsx
import QRCode from "react-qr-code";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
  showDownloadButton?: boolean;
  downloadFileName?: string;
}

export function QRCodeGenerator({
  value,
  size = 200,
  className = "",
  showDownloadButton = true,
  downloadFileName = "qrcode.svg",
}: QRCodeGeneratorProps) {

  const handleDownload = () => {
    const svg = document.getElementById("QRCodeId");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`relative inline-block p-4 bg-white rounded-lg border ${className}`}>
      <QRCode
        id="QRCodeId" // ID untuk referensi saat download
        value={value}
        size={size}
        level="Q"
        viewBox={`0 0 ${size} ${size}`}
      />
      {showDownloadButton && (
        <button
          onClick={handleDownload}
          className="absolute bottom-2 right-2 bg-blue-600 p-1.5 rounded-full shadow-md hover:bg-blue-700 transition-colors border-2 border-white"
          title="Download QR Code"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
        </button>
      )}
    </div>
  );
}