"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadPDFButtonProps {
  contractId: string;
  contractNumber: string;
  token?: string;
}

export default function DownloadPDFButton({ contractId, contractNumber, token }: DownloadPDFButtonProps) {
  const handleDownload = async () => {
    try {
      const url = token 
        ? `/api/contracts/${contractId}/pdf?token=${token}`
        : `/api/contracts/${contractId}/pdf`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `contract-${contractNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <Button 
      variant="outline" 
      className="inline-flex items-center gap-2"
      onClick={handleDownload}
    >
      <Download size={20} />
      Download PDF
    </Button>
  );
}

