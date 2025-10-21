"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/Dialog";
import {
  Search,
  DollarSign,
  CreditCard,
  Calendar,
  User,
  Phone,
  Receipt,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Eye,
} from "lucide-react";
import { useToast } from "../../components/ui/use-toast";

interface Customer {
  id: string;
  name?: string;
  phone: string;
  address?: string;
}

interface Sale {
  id: string;
  total: number;
  discount: number;
  paidAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  user: {
    name: string;
  };
  items: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }>;
  duePayments: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    method?: string;
    reference?: string;
    notes?: string;
  }>;
  pendingAmount: number;
  hasDue: boolean;
  totalDuePayments: number;
}

interface DuePayment {
  id: string;
  saleId: string;
  amount: number;
  paymentDate: string;
  method?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export default function DuesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] =
    useState<Sale | null>(null);
  const [duePayments, setDuePayments] = useState<DuePayment[]>([]);
  const { toast } = useToast();

  // Form states
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    paymentDate: "",
    method: "",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    fetchDues();
  }, [selectedStatus]);

  const fetchDues = async () => {
    try {
      const response = await fetch(`/api/dues?status=${selectedStatus}`);
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) {
      console.error("Error fetching dues:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dues",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDuePayments = async (saleId: string) => {
    try {
      const response = await fetch(`/api/due-payments?saleId=${saleId}`);
      if (response.ok) {
        const data = await response.json();
        setDuePayments(data);
      }
    } catch (error) {
      console.error("Error fetching due payments:", error);
    }
  };

  const handleAddDuePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSaleForPayment || !paymentFormData.amount) {
      toast({
        title: "Error",
        description: "Please enter payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/due-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          saleId: selectedSaleForPayment.id,
          ...paymentFormData,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment added successfully",
        });
        setIsPaymentDialogOpen(false);
        resetPaymentForm();
        fetchDues();
        if (selectedSaleForPayment) {
          fetchDuePayments(selectedSaleForPayment.id);
        }
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to add payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding due payment:", error);
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive",
      });
    }
  };

  const resetPaymentForm = () => {
    setPaymentFormData({
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      method: "",
      reference: "",
      notes: "",
    });
  };

  const openPaymentDialog = (sale: Sale) => {
    setSelectedSaleForPayment(sale);
    setPaymentFormData({
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      method: "",
      reference: "",
      notes: "",
    });
    fetchDuePayments(sale.id);
    setIsPaymentDialogOpen(true);
  };

  const filteredSales = sales.filter((sale) => {
    const customerName = sale.customer?.name || "Walk-in Customer";
    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer?.phone.includes(searchQuery) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Partial
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const totalPendingAmount = sales.reduce(
    (sum, sale) => sum + sale.pendingAmount,
    0
  );

  const totalCollected = sales.reduce((sum, sale) => sum + sale.paidAmount, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dues Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track payment history and collect outstanding balances from customer
            sales
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sales Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0))}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Total value of {sales.length} sales with payment records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Balance
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalPendingAmount)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Remaining amount to be collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Payment Status
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {sales.filter((sale) => sale.status === "paid").length}/
              {sales.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Sales fully paid out of total sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalCollected + totalPendingAmount > 0
                ? `${(
                    (totalCollected / (totalCollected + totalPendingAmount)) *
                    100
                  ).toFixed(1)}%`
                : "0%"}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Of total sales value collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer name, phone, or sale ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sales</SelectItem>
                <SelectItem value="pending">Pending Payment</SelectItem>
                <SelectItem value="partial">Partial Payment</SelectItem>
                <SelectItem value="paid">Fully Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dues Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Dues</CardTitle>
          <CardDescription>
            Customer payment history and outstanding balances (
            {filteredSales.length} of {sales.length} sales with payment records)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sale Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <User className="h-8 w-8 text-gray-400 mr-3 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {sale.customer?.name || "Walk-in Customer"}
                          </div>
                          {sale.customer?.phone && (
                            <div className="text-gray-500 dark:text-gray-400 flex items-center text-xs">
                              <Phone className="h-3 w-3 mr-1" />
                              {sale.customer.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      {formatCurrency(sale.paidAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20">
                      {formatCurrency(sale.pendingAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(sale.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPaymentDialog(sale)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Collect Payment
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sales found matching your criteria. Sales with payment history
              will appear here automatically.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Due Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Collect Due Payment</DialogTitle>
            <DialogDescription>
              Record payment collection from{" "}
              {selectedSaleForPayment?.customer?.name || "Walk-in Customer"}
              {selectedSaleForPayment && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Sale Total:</span>{" "}
                      {formatCurrency(selectedSaleForPayment.total)}
                    </div>
                    <div>
                      <span className="font-medium">Already Paid:</span>{" "}
                      {formatCurrency(selectedSaleForPayment.paidAmount)}
                    </div>
                    <div>
                      <span className="font-medium">Pending Amount:</span>{" "}
                      <span className="text-red-600 font-bold text-lg">
                        {formatCurrency(selectedSaleForPayment.pendingAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      {getStatusBadge(selectedSaleForPayment.status)}
                    </div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Payment History */}
            <div>
              <h3 className="text-lg font-medium mb-3">Payment History</h3>
              {duePayments.length > 0 ? (
                <div className="space-y-2">
                  {duePayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <Receipt className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                            {payment.method && ` • ${payment.method}`}
                            {payment.reference && ` • ${payment.reference}`}
                          </div>
                          {payment.notes && (
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {payment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No payments collected yet.
                </div>
              )}
            </div>

            {/* Collect Payment Form - Only show if sale is not fully paid */}
            {selectedSaleForPayment?.status !== "paid" && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">
                  Collect New Payment
                </h3>
                <form onSubmit={handleAddDuePayment} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="due-payment-amount"
                        className="block text-sm font-medium mb-1"
                      >
                        Payment Amount (৳) *
                      </label>
                      <Input
                        id="due-payment-amount"
                        type="number"
                        step="0.01"
                        value={paymentFormData.amount}
                        onChange={(e) =>
                          setPaymentFormData({
                            ...paymentFormData,
                            amount: e.target.value,
                          })
                        }
                        placeholder={
                          selectedSaleForPayment
                            ? formatCurrency(
                                selectedSaleForPayment.pendingAmount
                              ).replace("৳", "")
                            : "0.00"
                        }
                        max={selectedSaleForPayment?.pendingAmount.toString()}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="due-payment-date"
                        className="block text-sm font-medium mb-1"
                      >
                        Payment Date *
                      </label>
                      <Input
                        id="due-payment-date"
                        type="date"
                        value={paymentFormData.paymentDate}
                        onChange={(e) =>
                          setPaymentFormData({
                            ...paymentFormData,
                            paymentDate: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="due-payment-method"
                        className="block text-sm font-medium mb-1"
                      >
                        Payment Method
                      </label>
                      <Select
                        value={paymentFormData.method}
                        onValueChange={(value) =>
                          setPaymentFormData({
                            ...paymentFormData,
                            method: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label
                        htmlFor="due-payment-reference"
                        className="block text-sm font-medium mb-1"
                      >
                        Reference
                      </label>
                      <Input
                        id="due-payment-reference"
                        value={paymentFormData.reference}
                        onChange={(e) =>
                          setPaymentFormData({
                            ...paymentFormData,
                            reference: e.target.value,
                          })
                        }
                        placeholder="Check #123 or Transaction ID"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="due-payment-notes"
                      className="block text-sm font-medium mb-1"
                    >
                      Notes
                    </label>
                    <textarea
                      id="due-payment-notes"
                      value={paymentFormData.notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setPaymentFormData({
                          ...paymentFormData,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Additional notes about the payment..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsPaymentDialogOpen(false);
                        setSelectedSaleForPayment(null);
                        resetPaymentForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Collect Payment</Button>
                  </div>
                </form>
              </div>
            )}

            {/* Show message when sale is fully paid */}
            {selectedSaleForPayment?.status === "paid" && (
              <div className="border-t pt-4">
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-400 mb-2">
                    Sale Fully Paid
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This sale has been completely paid. No additional payments
                    are needed.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
