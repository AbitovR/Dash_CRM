"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DEFAULT_CONTRACT_TEMPLATE } from "@/lib/contractTemplate";

export default function NewContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerId: "",
    title: "Car Shipping Broker-Customer Agreement",
    description: DEFAULT_CONTRACT_TEMPLATE,
    totalAmount: "",
    depositAmount: "",
    currency: "USD",
    paymentMethod: "credit_card",
    transportAmount: "",
    brokerFeeAmount: "",
    amountPaidOnline: "",
    amountPaidCOD: "",
    pickupDate: "",
    deliveryDate: "",
    estimatedDelivery: "",
  });

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalAmount: parseFloat(formData.totalAmount),
          depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
          transportAmount: formData.transportAmount ? parseFloat(formData.transportAmount) : null,
          brokerFeeAmount: formData.brokerFeeAmount ? parseFloat(formData.brokerFeeAmount) : null,
          amountPaidOnline: formData.amountPaidOnline ? parseFloat(formData.amountPaidOnline) : null,
          amountPaidCOD: formData.amountPaidCOD ? parseFloat(formData.amountPaidCOD) : null,
          pickupDate: formData.pickupDate || null,
          deliveryDate: formData.deliveryDate || null,
          estimatedDelivery: formData.estimatedDelivery || null,
        }),
      });

      if (response.ok) {
        const contract = await response.json();
        router.push(`/contracts/${contract.id}`);
      } else {
        alert("Failed to create contract");
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold mb-6">Create New Contract</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                  <label className="block text-sm font-medium mb-1">
                Customer *
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName} - {customer.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Contract Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Vehicle Transport Agreement"
                className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Agreement Terms & Conditions
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={20}
                className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                placeholder="Contract terms and conditions..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                This is the default Car Shipping Broker-Customer Agreement template. You can modify it as needed.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => {
                    const method = e.target.value;
                    setFormData({ 
                      ...formData, 
                      paymentMethod: method,
                      // Auto-calculate amounts based on method
                      amountPaidOnline: method === "cod" ? "" : formData.totalAmount,
                      amountPaidCOD: method === "credit_card" ? "" : formData.totalAmount,
                    });
                  }}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="credit_card">Credit Card (Full Payment)</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="split">Split Payment (Credit Card + COD)</option>
                </select>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.totalAmount}
                    onChange={(e) => {
                      const total = e.target.value;
                      setFormData({ 
                        ...formData, 
                        totalAmount: total,
                        // Auto-update payment amounts if not split
                        amountPaidOnline: formData.paymentMethod === "cod" ? "" : (formData.paymentMethod === "split" ? formData.amountPaidOnline : total),
                        amountPaidCOD: formData.paymentMethod === "credit_card" ? "" : (formData.paymentMethod === "split" ? formData.amountPaidCOD : total),
                      });
                    }}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Transport Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.transportAmount}
                    onChange={(e) => setFormData({ ...formData, transportAmount: e.target.value })}
                    placeholder="e.g., 1200"
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Broker Fee Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.brokerFeeAmount}
                    onChange={(e) => setFormData({ ...formData, brokerFeeAmount: e.target.value })}
                    placeholder="e.g., 300"
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {formData.paymentMethod === "split" && (
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Amount Paid Online (Credit Card) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required={formData.paymentMethod === "split"}
                      value={formData.amountPaidOnline}
                      onChange={(e) => setFormData({ ...formData, amountPaidOnline: e.target.value })}
                      className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Amount Paid COD (Cash on Delivery) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required={formData.paymentMethod === "split"}
                      value={formData.amountPaidCOD}
                      onChange={(e) => setFormData({ ...formData, amountPaidCOD: e.target.value })}
                      className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="md:col-span-2 text-sm text-muted-foreground">
                    Total: ${(parseFloat(formData.amountPaidOnline || "0") + parseFloat(formData.amountPaidCOD || "0")).toFixed(2)} 
                    {formData.totalAmount && ` (Expected: $${parseFloat(formData.totalAmount).toFixed(2)})`}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Deposit Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                  <label className="block text-sm font-medium mb-1">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1">
                  Estimated Delivery
                </label>
                <input
                  type="date"
                  value={formData.estimatedDelivery}
                  onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link
                href="/contracts"
                className="px-6 py-2 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Contract"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

