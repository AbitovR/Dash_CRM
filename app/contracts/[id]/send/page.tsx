"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";

export default function SendContractPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");

  const handleSend = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/contracts/${params.id}/send`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentLink(data.paymentLink);
        setSuccess(true);
      } else {
        const errorMessage = data.error || data.message || "Failed to send contract";
        alert(`Error: ${errorMessage}`);
        console.error("Contract send error:", data);
      }
    } catch (error: any) {
      console.error("Error sending contract:", error);
      alert(`An error occurred: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <Link
          href={`/contracts/${params.id as string}`}
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Contract
        </Link>

        <div className="max-w-2xl mx-auto bg-card rounded-lg border p-8">
          {!success ? (
            <>
              <h1 className="text-3xl font-bold mb-6">Send Contract</h1>
              <p className="text-muted-foreground mb-6">
                This will create a Stripe payment link and mark the contract as sent. The customer
                will be able to sign the contract and make payment through the link.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  <strong>Note:</strong> In a production environment, you would also:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-yellow-800 dark:text-yellow-400">
                  <li>Generate a PDF contract document</li>
                  <li>Send an email to the customer with the contract and payment link</li>
                  <li>Integrate with an e-signature service (DocuSign, HelloSign, etc.)</li>
                </ul>
              </div>
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={20} />
                    Send Contract & Create Payment Link
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                Contract Sent Successfully!
              </h2>
              <p className="text-muted-foreground mb-6">
                A Stripe payment link has been created for this contract.
              </p>
              {paymentLink && (
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Payment Link:</p>
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {paymentLink}
                  </a>
                </div>
              )}
              <Link
                href={`/contracts/${params.id as string}`}
                className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                View Contract
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

