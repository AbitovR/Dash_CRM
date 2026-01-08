"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import SignaturePad from "@/components/SignaturePad";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignContractPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;
  
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    fetch(`/api/contracts/${contractId}`)
      .then((res) => res.json())
      .then((data) => {
        setContract(data);
        setSigned(data.status === "signed" && data.signedBy);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching contract:", err);
        setLoading(false);
      });
  }, [contractId]);

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
        }),
      });

      if (response.ok) {
        const updatedContract = await response.json();
        setContract(updatedContract);
        setSigned(true);
        setShowSignaturePad(false);
        // Redirect after a moment
        setTimeout(() => {
          router.push(`/contracts/${contractId}`);
        }, 2000);
      } else {
        alert("Failed to save signature");
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

  if (!contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contract Not Found</h1>
          <Link href="/contracts" className="text-primary hover:underline">
            Back to Contracts
          </Link>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <CheckCircle size={64} className="text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Contract Signed Successfully!</h1>
            <p className="text-muted-foreground mb-6">
              This contract has been signed by {contract.signedBy} on{" "}
              {contract.signedAt ? new Date(contract.signedAt).toLocaleDateString() : "today"}.
            </p>
            <Link href={`/contracts/${contractId}`}>
              <Button>View Contract</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <Link
          href={`/contracts/${contractId}`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Contract
        </Link>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-2">{contract.title}</h1>
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

            <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="text-2xl font-bold">
                  ${contract.totalAmount.toFixed(2)} {contract.currency}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Customer</div>
                <div className="font-medium">
                  {contract.customer?.firstName} {contract.customer?.lastName}
                </div>
                <div className="text-sm text-muted-foreground">{contract.customer?.email}</div>
              </div>
            </div>

            {!showSignaturePad ? (
              <div className="space-y-4">
                <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
                  <h2 className="text-xl font-semibold mb-2">Ready to Sign?</h2>
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
                <h2 className="text-xl font-semibold mb-4">Sign Contract</h2>
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
        </div>
      </div>
    </div>
  );
}

