"use client";

import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Type } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";

interface SignaturePadProps {
  onSave: (signatureData: string, signatureType: "draw" | "type", name?: string) => void;
  onCancel: () => void;
  customerName?: string;
}

export default function SignaturePad({ onSave, onCancel, customerName }: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureType, setSignatureType] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState(customerName || "");
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && signatureRef.current) {
      const isDark = document.documentElement.classList.contains("dark");
      signatureRef.current.penColor = isDark ? "#ffffff" : "#000000";
    }
  }, [theme, mounted]);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleSave = () => {
    if (signatureType === "draw") {
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        const dataURL = signatureRef.current.toDataURL("image/png");
        onSave(dataURL, "draw");
      } else {
        alert("Please draw your signature or switch to typed signature");
      }
    } else {
      if (typedName.trim()) {
        onSave(typedName, "type", typedName);
      } else {
        alert("Please enter your name");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={signatureType === "draw" ? "default" : "outline"}
          onClick={() => setSignatureType("draw")}
          className="flex items-center gap-2"
        >
          Draw Signature
        </Button>
        <Button
          type="button"
          variant={signatureType === "type" ? "default" : "outline"}
          onClick={() => setSignatureType("type")}
          className="flex items-center gap-2"
        >
          <Type size={16} />
          Type Name
        </Button>
      </div>

      {signatureType === "draw" ? (
        <div className="space-y-3">
          <div className="border-2 border-border rounded-lg bg-white dark:bg-gray-900 p-2">
            {mounted && (
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 600,
                  height: 200,
                  className: "w-full h-48 border rounded bg-white dark:bg-gray-900",
                }}
                backgroundColor="transparent"
                penColor={document.documentElement.classList.contains("dark") ? "#ffffff" : "#000000"}
              />
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <p className="text-sm text-muted-foreground flex items-center">
              Draw your signature in the box above
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter your full name to sign
            </label>
            <Input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="John Doe"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              By typing your name, you agree that this constitutes your electronic signature
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave}>
          Save Signature
        </Button>
      </div>
    </div>
  );
}

