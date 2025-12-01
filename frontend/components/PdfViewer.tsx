'use client';

interface PdfViewerProps {
  url: string;
}

export default function PdfViewer({ url }: PdfViewerProps) {
  return (
    <div className="w-full h-screen">
      <iframe
        src={url}
        className="w-full h-full border-0"
        title="PDF Viewer"
      />
    </div>
  );
}

