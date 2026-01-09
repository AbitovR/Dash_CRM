"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadPDFButtonProps {
  contractId: string;
  contractNumber: string;
  token?: string;
}

export default function DownloadPDFButton({ contractId, contractNumber, token }: DownloadPDFButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = token ? `?token=${encodeURIComponent(token)}` : "";
      const response = await fetch(`/api/contracts/${contractId}/pdf${query}`, {
        method: "GET",
        headers: {
          "Accept": "application/pdf",
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorData;
        
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error("PDF fetch error:", errorData);
        throw new Error(errorData.error || `Failed to fetch PDF (${response.status})`);
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/pdf")) {
        const text = await response.text();
        console.error("Unexpected response type:", contentType, text);
        throw new Error("Server returned non-PDF content. Please check the server logs.");
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error("Received empty PDF file");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract-${contractNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err: any) {
      console.error("Error downloading PDF:", err);
      setError(err.message || "Failed to download PDF. Please try again.");
      alert(err.message || "Failed to download PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <Button 
        variant="outline" 
        className="inline-flex items-center gap-2"
        onClick={handleDownload}
        disabled={loading}
      >
        {loading ? (
          <>Loading...</>
        ) : (
          <>
            <Download size={20} />
            Download PDF
          </>
        )}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

