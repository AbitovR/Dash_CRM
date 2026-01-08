import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const [
      totalCustomers,
      totalContracts,
      totalRevenue,
      allContracts,
      revenueByMonth,
      customersByMonth,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.contract.count(),
      prisma.payment.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
      prisma.contract.findMany({
        select: { status: true },
      }),
      prisma.payment.findMany({
        where: {
          status: "completed",
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        select: {
          amount: true,
          createdAt: true,
        },
      }),
      prisma.customer.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Group contracts by status manually
    const contractsByStatus = allContracts.reduce((acc: any, contract) => {
      const status = contract.status || "unknown";
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {});

    // Process revenue by month
    const revenueData = revenueByMonth.reduce((acc: any, payment) => {
      const month = new Date(payment.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + payment.amount;
      return acc;
    }, {});

    const revenueChartData = Object.entries(revenueData).map(([month, amount]) => ({
      month,
      revenue: Number(amount),
    }));

    // Process customers by month
    const customerData = customersByMonth.reduce((acc: any, customer) => {
      const month = new Date(customer.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const customerChartData = Object.entries(customerData).map(([month, count]) => ({
      month,
      customers: Number(count),
    }));

    return NextResponse.json({
      totalCustomers,
      totalContracts,
      totalRevenue: totalRevenue._sum.amount || 0,
      contractsByStatus,
      revenueChartData,
      customerChartData,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

