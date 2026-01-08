import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

const statusConfig = {
  draft: { icon: FileText, color: "text-muted-foreground", bg: "bg-muted" },
  sent: { icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  signed: { icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
  completed: { icon: CheckCircle, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  cancelled: { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
};

export default async function ContractsPage() {
  const contracts = await prisma.contract.findMany({
    include: {
      customer: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Contracts</h1>
          <Link href="/contracts/new">
            <Button>
              <Plus size={20} className="mr-2" />
              Create Contract
            </Button>
          </Link>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contract #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No contracts found. Create your first contract to get started.
                    </td>
                  </tr>
                ) : (
                  contracts.map((contract) => {
                    const StatusIcon = statusConfig[contract.status as keyof typeof statusConfig]?.icon || FileText;
                    const statusColor = statusConfig[contract.status as keyof typeof statusConfig]?.color || "text-muted-foreground";
                    const statusBg = statusConfig[contract.status as keyof typeof statusConfig]?.bg || "bg-muted";

                    return (
                      <tr key={contract.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">
                            {contract.contractNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {contract.customer.firstName} {contract.customer.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{contract.customer.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">{contract.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">
                            ${contract.totalAmount.toFixed(2)} {contract.currency}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${statusBg} ${statusColor} border-0`}>
                            <StatusIcon size={14} className="mr-1" />
                            {contract.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/contracts/${contract.id}`}
                            className="text-primary hover:underline mr-4"
                          >
                            View
                          </Link>
                          {contract.status === "draft" && (
                            <Link
                              href={`/contracts/${contract.id}/send`}
                              className="text-primary hover:underline"
                            >
                              Send
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
