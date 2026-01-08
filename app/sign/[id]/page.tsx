"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { CheckCircle, AlertCircle, Download } from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PublicSignContractPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const contractId = (params?.id as string) || "";
  const token = searchParams.get("token") || "";
  
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [signing, setSigning] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (!contractId || !token) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    fetch(`/api/contracts/${contractId}/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.authorized) {
          setContract(data.contract);
          setSigned(data.contract.status === "signed" && data.contract.signedBy);
        } else {
          setUnauthorized(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching contract:", err);
        setUnauthorized(true);
        setLoading(false);
      });
  }, [contractId, token]);

  const handleSignatureSave = async (signatureData: string, signatureType: "draw" | "type", name?: string) => {
    setSigning(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature: signatureData,
          signatureType,
          signedByName: name || contract?.customer?.firstName + " " + contract?.customer?.lastName,
          token: token, // Include token for verification
        }),
      });

      if (response.ok) {
        const updatedContract = await response.json();
        setContract(updatedContract);
        setSigned(true);
        setShowSignaturePad(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save signature");
      }
    } catch (error) {
      console.error("Error saving signature:", error);
      alert("An error occurred");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading contract...</div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle size={64} className="text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            This link is invalid or has expired. Please use the link provided in your email.
          </p>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact Caravan Transport support.
          </p>
        </Card>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contract Not Found</h1>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <CheckCircle size={64} className="text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Contract Signed Successfully!</h1>
          <p className="text-muted-foreground mb-6">
            This contract has been signed by {contract.signedBy} on{" "}
            {contract.signedAt ? new Date(contract.signedAt).toLocaleDateString() : "today"}.
          </p>
          <p className="text-sm text-muted-foreground">
            Thank you for signing. You will receive a confirmation email shortly.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Caravan Transport</h1>
          <p className="text-muted-foreground">Contract Signing</p>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-2">{contract.title}</h2>
          <p className="text-muted-foreground mb-6">
            Contract #{contract.contractNumber}
          </p>

          {contract.description && (
            <div className="mb-6">
              <div className="bg-muted rounded-lg p-6 border max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {contract.description.replace(
                    "[Customer Signature Will Appear Here]",
                    contract.signedBy || "[Customer Signature Will Appear Here]"
                  )}
                </pre>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="text-2xl font-bold">
                  ${contract.totalAmount.toFixed(2)} {contract.currency}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Payment Method</div>
                <div className="font-medium capitalize">
                  {contract.paymentMethod === "credit_card" ? "Credit Card" : 
                   contract.paymentMethod === "cod" ? "Cash on Delivery (COD)" : 
                   "Split Payment"}
                </div>
              </div>
            </div>

            {contract.paymentMethod === "split" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm font-medium mb-2">Payment Breakdown:</div>
                <div className="space-y-1 text-sm">
                  {contract.amountPaidOnline && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Online Payment:</span>
                      <span className="font-semibold">${contract.amountPaidOnline.toFixed(2)}</span>
                    </div>
                  )}
                  {contract.amountPaidCOD && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cash on Delivery:</span>
                      <span className="font-semibold">${contract.amountPaidCOD.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {contract.paymentMethod === "cod" && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  Payment will be collected in cash upon delivery
                </p>
              </div>
            )}
          </div>

          {!showSignaturePad ? (
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
                <h3 className="text-xl font-semibold mb-2">Ready to Sign?</h3>
                <p className="text-muted-foreground mb-4">
                  Please review the contract terms above. By signing, you agree to all terms and conditions.
                </p>
                <Button onClick={() => setShowSignaturePad(true)} size="lg">
                  Sign Contract
                </Button>
              </div>
            </div>
          ) : (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Sign Contract</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Please sign below. You can either draw your signature or type your name.
              </p>
              <SignaturePad
                onSave={handleSignatureSave}
                onCancel={() => setShowSignaturePad(false)}
                customerName={`${contract.customer?.firstName} ${contract.customer?.lastName}`}
              />
            </Card>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={`/api/contracts/${contractId}/pdf?token=${token}`}
              download={`contract-${contract.contractNumber}.pdf`}
              className="w-full sm:w-auto"
            >
              <Button variant="outline" className="w-full sm:w-auto">
                <Download size={16} className="mr-2" />
                Download PDF
              </Button>
            </a>
            {contract.paymentMethod === "cod" ? (
              <div className="w-full sm:w-auto p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  Payment: Cash on Delivery
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  ${contract.totalAmount.toFixed(2)} will be collected upon delivery
                </p>
              </div>
            ) : contract.stripePaymentLinkUrl ? (
              <a
                href={contract.stripePaymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto">
                  Pay {contract.paymentMethod === "split" && contract.amountPaidOnline ? `$${contract.amountPaidOnline.toFixed(2)}` : "Now"}
                </Button>
              </a>
            ) : null}
          </div>
          {contract.paymentMethod === "split" && contract.amountPaidCOD && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Remaining ${contract.amountPaidCOD.toFixed(2)} will be collected in cash upon delivery
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

