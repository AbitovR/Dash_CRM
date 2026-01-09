import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Send, ExternalLink, PenTool, Mail } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import ResendEmailButton from "@/components/ResendEmailButton";
import DownloadPDFButton from "@/components/DownloadPDFButton";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      customer: true,
    },
  });

  if (!contract) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/contracts"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Contracts
        </Link>

        <div className="max-w-4xl mx-auto bg-card rounded-lg border p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{contract.title}</h1>
              <p className="text-muted-foreground mt-1">Contract #{contract.contractNumber}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              contract.status === "signed" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" :
              contract.status === "sent" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400" :
              contract.status === "completed" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400" :
              contract.status === "cancelled" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400" :
              "bg-muted text-muted-foreground"
            }`}>
              {contract.status}
            </span>
          </div>

          <div className="space-y-6">
            {/* Customer Info */}
            <div className="border-b border-border pb-6">
              <h2 className="text-lg font-semibold mb-3">Customer</h2>
              <Link
                href={`/customers/${contract.customer.id}`}
                className="text-primary hover:underline"
              >
                {contract.customer.firstName} {contract.customer.lastName}
              </Link>
              <p className="text-muted-foreground">{contract.customer.email}</p>
              <p className="text-muted-foreground">{contract.customer.phone}</p>
            </div>

            {/* Contract Details */}
            <div className="border-b border-border pb-6">
              <h2 className="text-lg font-semibold mb-3">Contract Details</h2>
              {contract.description && (
                <div className="mb-4">
                  <div className="bg-muted rounded-lg p-6 border">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {contract.signedBy
                        ? contract.description.replace(
                            "[Customer Signature Will Appear Here]",
                            contract.signedBy
                          )
                        : contract.description}
                    </pre>
                  </div>
                  {contract.signatureUrl && contract.signatureUrl.startsWith("data:image") && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm font-medium mb-2">Customer Signature:</p>
                      <img
                        src={contract.signatureUrl}
                        alt="Customer signature"
                        className="max-w-xs border rounded bg-white dark:bg-gray-800 p-2"
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="text-2xl font-bold">
                      ${contract.totalAmount.toFixed(2)} {contract.currency}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Method</div>
                    <div className="text-lg font-semibold capitalize">
                      {contract.paymentMethod === "credit_card" ? "Credit Card" : 
                       contract.paymentMethod === "cod" ? "Cash on Delivery (COD)" : 
                       "Split Payment"}
                    </div>
                  </div>
                </div>

                {(contract.transportAmount || contract.brokerFeeAmount) && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium mb-2">Payment Breakdown:</div>
                    <div className="space-y-1 text-sm">
                      {contract.transportAmount && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transport Fee:</span>
                          <span>${contract.transportAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {contract.brokerFeeAmount && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Broker Fee:</span>
                          <span>${contract.brokerFeeAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {contract.paymentMethod === "split" && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium mb-2">Split Payment Details:</div>
                    <div className="space-y-1 text-sm">
                      {contract.amountPaidOnline && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paid Online (Credit Card):</span>
                          <span className="font-semibold">${contract.amountPaidOnline.toFixed(2)}</span>
                        </div>
                      )}
                      {contract.amountPaidCOD && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paid COD (Cash on Delivery):</span>
                          <span className="font-semibold">${contract.amountPaidCOD.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {contract.paymentMethod === "cod" && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="text-sm font-medium mb-1">Cash on Delivery</div>
                    <div className="text-sm text-muted-foreground">
                      Customer will pay ${contract.totalAmount.toFixed(2)} in cash to the driver upon delivery.
                    </div>
                  </div>
                )}

                {contract.depositAmount && (
                  <div>
                    <div className="text-sm text-muted-foreground">Deposit Amount</div>
                    <div className="text-xl font-semibold">
                      ${contract.depositAmount.toFixed(2)} {contract.currency}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            {(contract.pickupDate || contract.deliveryDate || contract.estimatedDelivery) && (
              <div className="border-b border-border pb-6">
                <h2 className="text-lg font-semibold mb-3">Important Dates</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {contract.pickupDate && (
                    <div>
                      <div className="text-sm text-muted-foreground">Pickup Date</div>
                      <div className="font-medium">
                        {new Date(contract.pickupDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {contract.deliveryDate && (
                    <div>
                      <div className="text-sm text-muted-foreground">Delivery Date</div>
                      <div className="font-medium">
                        {new Date(contract.deliveryDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {contract.estimatedDelivery && (
                    <div>
                      <div className="text-sm text-muted-foreground">Estimated Delivery</div>
                      <div className="font-medium">
                        {new Date(contract.estimatedDelivery).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Link */}
            {contract.stripePaymentLinkUrl && contract.paymentMethod !== "cod" && (
              <div className="border-b border-border pb-6">
                <h2 className="text-lg font-semibold mb-3">Payment</h2>
                <div className="space-y-2">
                  {contract.paymentMethod === "split" && contract.amountPaidOnline && (
                    <p className="text-sm text-muted-foreground">
                      Online Payment Amount: <span className="font-semibold">${contract.amountPaidOnline.toFixed(2)}</span>
                    </p>
                  )}
                  <a
                    href={contract.stripePaymentLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    <ExternalLink size={20} />
                    View Payment Link
                  </a>
                </div>
              </div>
            )}
            {contract.paymentMethod === "cod" && (
              <div className="border-b border-border pb-6">
                <h2 className="text-lg font-semibold mb-3">Payment</h2>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Cash on Delivery (COD)
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Customer will pay ${contract.totalAmount.toFixed(2)} in cash to the driver upon delivery.
                  </p>
                </div>
              </div>
            )}

            {/* Signature Section */}
            {contract.status === "signed" && contract.signedBy && (
              <div className="border-b border-border pb-6">
                <h2 className="text-lg font-semibold mb-3">Signature</h2>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Signed by:</span> {contract.signedBy}
                  </p>
                  {contract.signedAt && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Signed on:</span>{" "}
                      {new Date(contract.signedAt).toLocaleString()}
                    </p>
                  )}
                  {contract.signatureUrl && contract.signatureUrl.startsWith("data:image") && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm font-medium mb-2">Signature:</p>
                      <img
                        src={contract.signatureUrl}
                        alt="Customer signature"
                        className="max-w-xs border rounded bg-white dark:bg-gray-800 p-2"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Download PDF Section */}
            <div className="border-b border-border pb-6">
              <h2 className="text-lg font-semibold mb-3">Contract Document</h2>
              <DownloadPDFButton 
                contractId={contract.id}
                contractNumber={contract.contractNumber}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">
              {contract.status === "draft" && (
                <Link href={`/contracts/${contract.id}/send`}>
                  <Button className="inline-flex items-center gap-2">
                    <Send size={20} />
                    Send Contract
                  </Button>
                </Link>
              )}
              {contract.status === "sent" && !contract.signedBy && (
                <>
                  <Link href={`/contracts/${contract.id}/sign`}>
                    <Button className="inline-flex items-center gap-2">
                      <PenTool size={20} />
                      Sign Contract
                    </Button>
                  </Link>
                  <ResendEmailButton contractId={contract.id} />
                </>
              )}
              {contract.status === "sent" && contract.stripePaymentLinkUrl && (
                <a
                  href={contract.stripePaymentLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="inline-flex items-center gap-2">
                    <ExternalLink size={20} />
                    View Payment Link
                  </Button>
                </a>
              )}
            </div>

            {/* Metadata */}
            <div className="pt-6 border-t border-border text-sm text-muted-foreground">
              <p>Created: {new Date(contract.createdAt).toLocaleString()}</p>
              {contract.signedAt && (
                <p>Signed: {new Date(contract.signedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

