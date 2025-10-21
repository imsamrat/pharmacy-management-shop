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
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Filter,
  CreditCard,
  Receipt,
} from "lucide-react";
import { useToast } from "../../components/ui/use-toast";

interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  summary: {
    totalPurchases: number;
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
  };
}

interface Purchase {
  id: string;
  supplierId: string;
  invoiceNumber?: string;
  purchaseDate: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  lastPaidDate?: string;
  dueDate?: string;
  status: string;
  notes?: string;
  supplier: {
    id: string;
    name: string;
    contact?: string;
    phone?: string;
  };
}

interface Payment {
  id: string;
  purchaseId: string;
  amount: number;
  paymentDate: string;
  method?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPurchaseForPayment, setSelectedPurchaseForPayment] =
    useState<Purchase | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    supplierId: "",
    invoiceNumber: "",
    purchaseDate: "",
    totalAmount: "",
    paidAmount: "",
    dueDate: "",
    notes: "",
  });

  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    paymentDate: "",
    method: "",
    reference: "",
    notes: "",
  });

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/purchases");
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast({
        title: "Error",
        description: "Failed to fetch purchases",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      supplierId: "",
      invoiceNumber: "",
      purchaseDate: "",
      totalAmount: "",
      paidAmount: "",
      dueDate: "",
      notes: "",
    });
  };

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId || !formData.totalAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Purchase added successfully",
        });
        setIsAddDialogOpen(false);
        resetForm();
        fetchPurchases();
        fetchSuppliers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to add purchase",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding purchase:", error);
      toast({
        title: "Error",
        description: "Failed to add purchase",
        variant: "destructive",
      });
    }
  };

  const handleEditPurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPurchase || !formData.totalAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/purchases/${editingPurchase.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Purchase updated successfully",
        });
        setIsEditDialogOpen(false);
        setEditingPurchase(null);
        resetForm();
        fetchPurchases();
        fetchSuppliers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update purchase",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating purchase:", error);
      toast({
        title: "Error",
        description: "Failed to update purchase",
        variant: "destructive",
      });
    }
  };

  const handleDeletePurchase = async (id: string) => {
    if (!confirm("Are you sure you want to delete this purchase?")) {
      return;
    }

    try {
      const response = await fetch(`/api/purchases/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Purchase deleted successfully",
        });
        fetchPurchases();
        fetchSuppliers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete purchase",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
      toast({
        title: "Error",
        description: "Failed to delete purchase",
        variant: "destructive",
      });
    }
  };

  const fetchPayments = async (purchaseId: string) => {
    try {
      const response = await fetch(`/api/payments?purchaseId=${purchaseId}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPurchaseForPayment || !paymentFormData.amount) {
      toast({
        title: "Error",
        description: "Please enter payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseId: selectedPurchaseForPayment.id,
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
        fetchPurchases();
        fetchSuppliers();
        if (selectedPurchaseForPayment) {
          fetchPayments(selectedPurchaseForPayment.id);
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
      console.error("Error adding payment:", error);
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
      paymentDate: "",
      method: "",
      reference: "",
      notes: "",
    });
  };

  const openPaymentDialog = (purchase: Purchase) => {
    setSelectedPurchaseForPayment(purchase);
    setPaymentFormData({
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      method: "",
      reference: "",
      notes: "",
    });
    fetchPayments(purchase.id);
    setIsPaymentDialogOpen(true);
  };

  const openEditDialog = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      supplierId: purchase.supplierId,
      invoiceNumber: purchase.invoiceNumber || "",
      purchaseDate: purchase.purchaseDate.split("T")[0],
      totalAmount: purchase.totalAmount.toString(),
      paidAmount: purchase.paidAmount.toString(),
      dueDate: purchase.dueDate ? purchase.dueDate.split("T")[0] : "",
      notes: purchase.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.supplier.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (purchase.invoiceNumber &&
        purchase.invoiceNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesSupplier =
      selectedSupplier === "all" || purchase.supplierId === selectedSupplier;

    const matchesStatus =
      selectedStatus === "all" || purchase.status === selectedStatus;

    return matchesSearch && matchesSupplier && matchesStatus;
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
            Paid
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Partial
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
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

  const totalPendingAmount = purchases.reduce(
    (sum, purchase) => sum + purchase.pendingAmount,
    0
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading purchases...
          </p>
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
            Purchase Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track purchases and supplier payments
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Purchase</DialogTitle>
              <DialogDescription>
                Enter the details of the new purchase from a supplier.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="supplierId"
                    className="block text-sm font-medium mb-1"
                  >
                    Supplier *
                  </label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, supplierId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="invoiceNumber"
                    className="block text-sm font-medium mb-1"
                  >
                    Invoice Number
                  </label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoiceNumber: e.target.value,
                      })
                    }
                    placeholder="INV-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="purchaseDate"
                    className="block text-sm font-medium mb-1"
                  >
                    Purchase Date *
                  </label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium mb-1"
                  >
                    Due Date
                  </label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="totalAmount"
                    className="block text-sm font-medium mb-1"
                  >
                    Total Amount (৳) *
                  </label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, totalAmount: e.target.value })
                    }
                    placeholder="10000.00"
                  />
                </div>
                <div>
                  <label
                    htmlFor="paidAmount"
                    className="block text-sm font-medium mb-1"
                  >
                    Paid Amount (৳)
                  </label>
                  <Input
                    id="paidAmount"
                    type="number"
                    step="0.01"
                    value={formData.paidAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, paidAmount: e.target.value })
                    }
                    placeholder="8000.00"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium mb-1"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes about the purchase..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Purchase</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Purchases
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                purchases.reduce((sum, p) => sum + p.totalAmount, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                purchases.reduce((sum, p) => sum + p.paidAmount, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payment
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalPendingAmount)}
            </div>
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
                  placeholder="Search by supplier or invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedSupplier}
              onValueChange={setSelectedSupplier}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Records</CardTitle>
          <CardDescription>
            {filteredPurchases.length} of {purchases.length} purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
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
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {purchase.supplier.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {purchase.invoiceNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatCurrency(purchase.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatCurrency(purchase.paidAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {formatCurrency(purchase.pendingAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {getStatusBadge(purchase.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPaymentDialog(purchase)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(purchase)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePurchase(purchase.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPurchases.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No purchases found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Purchase Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Purchase</DialogTitle>
            <DialogDescription>
              Update the purchase details and payment information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPurchase} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-supplierId"
                  className="block text-sm font-medium mb-1"
                >
                  Supplier *
                </label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, supplierId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  htmlFor="edit-invoiceNumber"
                  className="block text-sm font-medium mb-1"
                >
                  Invoice Number
                </label>
                <Input
                  id="edit-invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceNumber: e.target.value })
                  }
                  placeholder="INV-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-purchaseDate"
                  className="block text-sm font-medium mb-1"
                >
                  Purchase Date *
                </label>
                <Input
                  id="edit-purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="edit-dueDate"
                  className="block text-sm font-medium mb-1"
                >
                  Due Date
                </label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-totalAmount"
                  className="block text-sm font-medium mb-1"
                >
                  Total Amount (৳) *
                </label>
                <Input
                  id="edit-totalAmount"
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, totalAmount: e.target.value })
                  }
                  placeholder="10000.00"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-paidAmount"
                  className="block text-sm font-medium mb-1"
                >
                  Paid Amount (৳)
                </label>
                <Input
                  id="edit-paidAmount"
                  type="number"
                  step="0.01"
                  value={formData.paidAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, paidAmount: e.target.value })
                  }
                  placeholder="8000.00"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-notes"
                className="block text-sm font-medium mb-1"
              >
                Notes
              </label>
              <textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes about the purchase..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingPurchase(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Purchase</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Management</DialogTitle>
            <DialogDescription>
              Track payments for purchase from{" "}
              {selectedPurchaseForPayment?.supplier.name}
              {selectedPurchaseForPayment && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Amount:</span>{" "}
                      {formatCurrency(selectedPurchaseForPayment.totalAmount)}
                    </div>
                    <div>
                      <span className="font-medium">Paid Amount:</span>{" "}
                      {formatCurrency(selectedPurchaseForPayment.paidAmount)}
                    </div>
                    <div>
                      <span className="font-medium">Pending Amount:</span>{" "}
                      <span className="text-red-600 font-semibold">
                        {formatCurrency(
                          selectedPurchaseForPayment.pendingAmount
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      {getStatusBadge(selectedPurchaseForPayment.status)}
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
              {payments.length > 0 ? (
                <div className="space-y-2">
                  {payments.map((payment) => (
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
                  No payments recorded yet.
                </div>
              )}
            </div>

            {/* Add Payment Form - Only show if purchase is not fully paid */}
            {selectedPurchaseForPayment?.status !== "paid" && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Add New Payment</h3>
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="payment-amount"
                        className="block text-sm font-medium mb-1"
                      >
                        Payment Amount (৳) *
                      </label>
                      <Input
                        id="payment-amount"
                        type="number"
                        step="0.01"
                        value={paymentFormData.amount}
                        onChange={(e) =>
                          setPaymentFormData({
                            ...paymentFormData,
                            amount: e.target.value,
                          })
                        }
                        placeholder="2000.00"
                        max={selectedPurchaseForPayment?.pendingAmount.toString()}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="payment-date"
                        className="block text-sm font-medium mb-1"
                      >
                        Payment Date *
                      </label>
                      <Input
                        id="payment-date"
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
                        htmlFor="payment-method"
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
                        htmlFor="payment-reference"
                        className="block text-sm font-medium mb-1"
                      >
                        Reference
                      </label>
                      <Input
                        id="payment-reference"
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
                      htmlFor="payment-notes"
                      className="block text-sm font-medium mb-1"
                    >
                      Notes
                    </label>
                    <textarea
                      id="payment-notes"
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
                        setSelectedPurchaseForPayment(null);
                        resetPaymentForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Payment</Button>
                  </div>
                </form>
              </div>
            )}

            {/* Show message when purchase is fully paid */}
            {selectedPurchaseForPayment?.status === "paid" && (
              <div className="border-t pt-4">
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-400 mb-2">
                    Purchase Fully Paid
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This purchase has been completely paid. No additional
                    payments are needed.
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
