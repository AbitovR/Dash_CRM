"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  DollarSign,
  Calendar,
  Search,
  Plus,
  MoreHorizontal,
  Send,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useRouter } from "next/navigation"

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status?: "active" | "pending" | "inactive"
  totalValue?: number
  lastActivity?: string
  contracts?: number
}

interface Contract {
  id: string
  customerId: string
  customerName: string
  amount: number
  status: "draft" | "sent" | "signed" | "completed" | "cancelled"
  createdAt: string
  expiresAt?: string
  contractNumber: string
}

interface Transaction {
  id: string
  customerId: string
  customerName: string
  amount: number
  status: "completed" | "pending" | "failed"
  date: string
  type: "payment" | "refund"
}

const chartConfig: ChartConfig = {
  revenue: {
    label: "Revenue",
    color: "#3b82f6",
  },
}

function BrokerageCRMDashboard() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedTab, setSelectedTab] = useState("overview")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [customersRes, contractsRes, paymentsRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/contracts"),
        fetch("/api/payments"),
      ])

      const customersData = await customersRes.json()
      const contractsData = await contractsRes.json()
      let paymentsData = []
      try {
        paymentsData = await paymentsRes.json()
      } catch (e) {
        paymentsData = []
      }

      // Transform customers
      const transformedCustomers = customersData.map((c: any) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        status: "active" as const,
        totalValue: 0,
        contracts: 0,
      }))

      // Transform contracts
      const transformedContracts = contractsData.map((c: any) => ({
        id: c.id,
        customerId: c.customerId,
        customerName: `${c.customer.firstName} ${c.customer.lastName}`,
        amount: c.totalAmount,
        status: c.status,
        createdAt: c.createdAt,
        contractNumber: c.contractNumber,
      }))

      // Transform payments
      const payments = await paymentsData
      const transformedTransactions = payments.map((p: any) => ({
        id: p.id,
        customerId: p.customerId,
        customerName: `${p.customer.firstName} ${p.customer.lastName}`,
        amount: p.amount,
        status: p.status,
        date: p.paidAt || p.createdAt,
        type: "payment" as const,
      }))

      // Calculate totals
      transformedCustomers.forEach((customer: Customer) => {
        const customerContracts = transformedContracts.filter(
          (c: Contract) => c.customerId === customer.id
        )
        customer.contracts = customerContracts.length
        customer.totalValue = customerContracts.reduce(
          (sum: number, c: Contract) => sum + c.amount,
          0
        )
      })

      setCustomers(transformedCustomers)
      setContracts(transformedContracts)
      setTransactions(transformedTransactions)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() - (11 - i))
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date)
      return (
        tDate.getMonth() === month.getMonth() &&
        tDate.getFullYear() === month.getFullYear() &&
        t.status === "completed" &&
        t.type === "payment"
      )
    })
    return {
      month: month.toLocaleDateString("en-US", { month: "short" }),
      revenue: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
    }
  })

  const totalRevenue = transactions
    .filter((t) => t.status === "completed" && t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingContracts = contracts.filter((c) => c.status === "sent").length
  const activeCustomers = customers.filter((c) => c.status === "active").length

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      signed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    }
    return variants[status] || variants.inactive
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Caravan Transport CRM</h1>
          <p className="text-muted-foreground">Manage customers, contracts, and payments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-green-500" />
                <span className="text-green-500">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCustomers}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-green-500" />
                <span className="text-green-500">+2</span> new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingContracts}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting signature</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68.2%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-green-500" />
                <span className="text-green-500">+5.2%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Contracts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contracts.slice(0, 3).map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{contract.customerName}</p>
                          <p className="text-xs text-muted-foreground">{contract.contractNumber}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium">${(contract.amount / 1000).toFixed(0)}K</p>
                          <Badge className={getStatusBadge(contract.status)}>{contract.status}</Badge>
                        </div>
                      </div>
                    ))}
                    {contracts.length === 0 && (
                      <p className="text-sm text-muted-foreground">No contracts yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{transaction.customerName}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium">
                            {transaction.type === "refund" ? "-" : "+"}$
                            {(transaction.amount / 1000).toFixed(0)}K
                          </p>
                          <Badge className={getStatusBadge(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="text-sm text-muted-foreground">No transactions yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Profiles</CardTitle>
                  <Button variant="outline" onClick={() => router.push("/customers")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <motion.div
                      key={customer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">{customer.firstName.charAt(0)}</span>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">${((customer.totalValue || 0) / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-muted-foreground">{customer.contracts || 0} contracts</p>
                        </div>
                        <Badge className={getStatusBadge(customer.status || "active")}>
                          {customer.status || "active"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                  {customers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No customers yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Contracts</CardTitle>
                  <Button variant="outline" onClick={() => router.push("/contracts")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <motion.div
                      key={contract.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/contracts/${contract.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{contract.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {contract.contractNumber} • Created {new Date(contract.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">${(contract.amount / 1000).toFixed(0)}K</p>
                        </div>
                        <Badge className={getStatusBadge(contract.status)}>{contract.status}</Badge>
                      </div>
                    </motion.div>
                  ))}
                  {contracts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No contracts yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment Transactions</CardTitle>
                  <Button variant="outline" onClick={() => router.push("/payments")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            transaction.type === "payment"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-red-100 dark:bg-red-900/30"
                          }`}
                        >
                          {transaction.type === "payment" ? (
                            <ArrowDownRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.id} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {transaction.type === "refund" ? "-" : "+"}$
                            {(transaction.amount / 1000).toFixed(0)}K
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">{transaction.type}</p>
                        </div>
                        <Badge className={getStatusBadge(transaction.status)}>{transaction.status}</Badge>
                      </div>
                    </motion.div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default BrokerageCRMDashboard
