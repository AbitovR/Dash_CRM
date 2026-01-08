import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Car, FileText, DollarSign } from "lucide-react";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      contracts: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      shipments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const totalSpent = customer.payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/customers"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Customers
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h1 className="text-3xl font-bold mb-6">
                {customer.firstName} {customer.lastName}
              </h1>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
                {customer.address && (
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-muted-foreground mt-1" />
                    <div>
                      <div>{customer.address}</div>
                      <div className="text-muted-foreground text-sm">
                        {customer.city}, {customer.state} {customer.zipCode}
                      </div>
                      {customer.country && (
                        <div className="text-muted-foreground text-sm">{customer.country}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Information */}
            {(customer.vehicleMake || customer.vehicleModel) && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Car size={24} />
                  Vehicle Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {customer.vehicleYear && customer.vehicleMake && customer.vehicleModel && (
                    <div>
                      <div className="text-sm text-muted-foreground">Vehicle</div>
                      <div className="font-medium">
                        {customer.vehicleYear} {customer.vehicleMake} {customer.vehicleModel}
                      </div>
                    </div>
                  )}
                  {customer.vehicleVIN && (
                    <div>
                      <div className="text-sm text-muted-foreground">VIN</div>
                      <div className="font-medium font-mono">{customer.vehicleVIN}</div>
                    </div>
                  )}
                  {customer.vehicleType && (
                    <div>
                      <div className="text-sm text-muted-foreground">Type</div>
                      <div className="font-medium capitalize">{customer.vehicleType}</div>
                    </div>
                  )}
                  {customer.pickupLocation && (
                    <div>
                      <div className="text-sm text-muted-foreground">Pickup Location</div>
                      <div className="font-medium">{customer.pickupLocation}</div>
                    </div>
                  )}
                  {customer.deliveryLocation && (
                    <div>
                      <div className="text-sm text-muted-foreground">Delivery Location</div>
                      <div className="font-medium">{customer.deliveryLocation}</div>
                    </div>
                  )}
                </div>
                {customer.specialNotes && (
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground">Special Notes</div>
                    <div className="mt-1">{customer.specialNotes}</div>
                  </div>
                )}
              </div>
            )}

            {/* Contracts */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText size={24} />
                Recent Contracts
              </h2>
              {customer.contracts.length === 0 ? (
                <p className="text-muted-foreground">No contracts yet.</p>
              ) : (
                <div className="space-y-3">
                  {customer.contracts.map((contract) => (
                    <Link
                      key={contract.id}
                      href={`/contracts/${contract.id}`}
                      className="block p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{contract.title}</div>
                          <div className="text-sm text-muted-foreground">{contract.contractNumber}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${contract.totalAmount.toFixed(2)}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            contract.status === "signed" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" :
                            contract.status === "sent" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {contract.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Statistics</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${totalSpent.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Contracts</div>
                  <div className="text-2xl font-bold">
                    {customer.contracts.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Payments</div>
                  <div className="text-2xl font-bold">
                    {customer.payments.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6 space-y-3">
              <Link
                href={`/contracts/new?customerId=${customer.id}`}
                className="block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                Create Contract
              </Link>
              <Link
                href={`/customers/${customer.id}/edit`}
                className="block w-full text-center border border-border px-4 py-2 rounded-lg hover:bg-muted"
              >
                Edit Customer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

