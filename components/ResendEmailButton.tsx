"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResendEmailButtonProps {
  contractId: string;
}

export default function ResendEmailButton({ contractId }: ResendEmailButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);

  const handleResend = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/contracts/${contractId}/resend`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: data.message || "Email sent successfully!",
        });
      } else {
        setResult({
          success: false,
          message: "Failed to resend email",
          error: data.error || "Unknown error",
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: "An error occurred",
        error: error.message || "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="inline-flex items-center gap-2"
      >
        <Mail size={20} />
        Resend Email
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend Contract Email</DialogTitle>
            <DialogDescription>
              This will resend the contract email to the customer with the signing link and payment link.
            </DialogDescription>
          </DialogHeader>

          {result ? (
            <div className="py-4">
              {result.success ? (
                <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                  <CheckCircle size={24} />
                  <div>
                    <p className="font-medium">{result.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The email has been sent to the customer.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle size={24} className="mt-0.5" />
                  <div>
                    <p className="font-medium">{result.message}</p>
                    {result.error && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Error: {result.error}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      Please check your SendGrid configuration and try again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to resend the contract email to the customer?
              </p>
            </div>
          )}

          <DialogFooter>
            {result ? (
              <Button onClick={() => {
                setShowDialog(false);
                setResult(null);
              }}>
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleResend} disabled={loading}>
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Mail size={16} className="mr-2" />
                      Resend Email
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

