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
import { Trash2, Eye, DollarSign, Download, Filter, X } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { useSession } from "next-auth/react";
import { ThermalReceipt } from "../../components/ThermalReceipt";
import * as XLSX from "xlsx";
import { Input } from "../../components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";

interface Sale {
  id: string;
  total: number;
  discount: number;
  hasDue: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  customer?: {
    id: string;
    name?: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
    };
  }>;
}

export default function SalesManagementPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showThermalReceipt, setShowThermalReceipt] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    saleId: string | null;
    saleTotal: number;
    isDeleting: boolean;
  }>({
    isOpen: false,
    saleId: null,
    saleTotal: 0,
    isDeleting: false,
  });

  // Dues confirmation dialog state
  const [duesDialog, setDuesDialog] = useState<{
    isOpen: boolean;
    sale: Sale | null;
    isProcessing: boolean;
  }>({
    isOpen: false,
    sale: null,
    isProcessing: false,
  });

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    startDate: string;
    endDate: string;
    hasDues: string;
  }>({
    startDate: "",
    endDate: "",
    hasDues: "all",
  });

  useEffect(() => {
    fetchSales();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      hasDues: "all",
    });
  };

  const fetchSales = async () => {
    try {
      // Build query parameters for filters
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.hasDues && filters.hasDues !== "all")
        params.append("hasDues", filters.hasDues);

      const queryString = params.toString();
      const url = queryString ? `/api/sales?${queryString}` : "/api/sales";

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      // Prepare data for Excel export
      const exportData = sales.map((sale) => ({
        "Sale ID": sale.id,
        "Customer Name": sale.customer?.name || "Walk-in",
        "Customer Phone": sale.customer?.phone || "",
        Cashier: sale.user.name,
        Subtotal: sale.total + (sale.discount || 0),
        Discount: sale.discount || 0,
        "Total Amount": sale.total,
        "Has Dues": sale.hasDue ? "Yes" : "No",
        Date: new Date(sale.createdAt).toLocaleDateString(),
        Time: new Date(sale.createdAt).toLocaleTimeString(),
        "Items Count": sale.items.length,
        "Items Details": sale.items
          .map(
            (item) =>
              `${item.product.name} (Qty: ${item.quantity}, Price: ৳${item.price})`
          )
          .join("; "),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = [
        { wch: 15 }, // Sale ID
        { wch: 20 }, // Customer Name
        { wch: 15 }, // Customer Phone
        { wch: 15 }, // Cashier
        { wch: 12 }, // Subtotal
        { wch: 10 }, // Discount
        { wch: 12 }, // Total Amount
        { wch: 10 }, // Has Dues
        { wch: 12 }, // Date
        { wch: 10 }, // Time
        { wch: 12 }, // Items Count
        { wch: 50 }, // Items Details
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Sales");

      // Generate filename with current date
      const fileName = `sales_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Success",
        description: "Sales data exported to Excel successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Error",
        description: "Failed to export sales data to Excel",
        variant: "destructive",
      });
    }
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const handleDeleteSale = (saleId: string, saleTotal: number) => {
    setDeleteDialog({
      isOpen: true,
      saleId,
      saleTotal,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.saleId) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(`/api/sales/${deleteDialog.saleId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        fetchSales();
        toast({
          title: "Success",
          description: data.message || "Sale deleted successfully",
          variant: "success",
        });
        setDeleteDialog({
          isOpen: false,
          saleId: null,
          saleTotal: 0,
          isDeleting: false,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || data.error || "Failed to delete sale",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the sale",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      saleId: null,
      saleTotal: 0,
      isDeleting: false,
    });
  };

  const handleCloseSaleDetails = () => {
    setSelectedSale(null);
  };

  const handlePrintReceipt = () => {
    setShowThermalReceipt(true);
  };

  const handleCloseThermalReceipt = () => {
    setShowThermalReceipt(false);
  };

  const handleAddDue = (sale: Sale) => {
    setDuesDialog({
      isOpen: true,
      sale,
      isProcessing: false,
    });
  };

  const handleConfirmAddDue = async () => {
    if (!duesDialog.sale) return;

    setDuesDialog((prev) => ({ ...prev, isProcessing: true }));

    try {
      const response = await fetch("/api/dues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ saleId: duesDialog.sale.id }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sale marked as having dues",
        });
        fetchSales(); // Refresh the sales list
        setDuesDialog({
          isOpen: false,
          sale: null,
          isProcessing: false,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to add due",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding due:", error);
      toast({
        title: "Error",
        description: "Failed to add due",
        variant: "destructive",
      });
    } finally {
      setDuesDialog((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleCloseDuesDialog = () => {
    setDuesDialog({
      isOpen: false,
      sale: null,
      isProcessing: false,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Filters</CardTitle>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Has Dues
                </label>
                <Select
                  value={filters.hasDues}
                  onValueChange={(value) =>
                    handleFilterChange("hasDues", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All sales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sales</SelectItem>
                    <SelectItem value="true">Has dues</SelectItem>
                    <SelectItem value="false">No dues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
          <CardDescription>
            View and manage all sales transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {sales.length} sale{sales.length !== 1 ? "s" : ""}
              {(filters.startDate ||
                filters.endDate ||
                (filters.hasDues && filters.hasDues !== "all")) && (
                <span className="ml-2 text-blue-600">(filtered)</span>
              )}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cashier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Has Dues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {sale.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {sale.customer ? (
                        <div>
                          <div className="font-medium">
                            {sale.customer.name || "N/A"}
                          </div>
                          <div className="text-xs">{sale.customer.phone}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Walk-in</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {sale.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ৳{sale.discount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ৳{sale.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sale.hasDue
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {sale.hasDue ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <Button
                        onClick={() => handleViewSale(sale)}
                        size="sm"
                        variant="outline"
                        className="mr-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleAddDue(sale)}
                        size="sm"
                        variant="outline"
                        className="mr-2 text-blue-600 hover:text-blue-700"
                        disabled={sale.hasDue}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      {session?.user?.role === "admin" && (
                        <Button
                          onClick={() => handleDeleteSale(sale.id, sale.total)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Sale Details</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePrintReceipt}
                    variant="outline"
                    size="sm"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                  <Button
                    onClick={handleCloseSaleDetails}
                    variant="outline"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Sale ID
                    </label>
                    <p className="text-sm">{selectedSale.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Date
                    </label>
                    <p className="text-sm">
                      {new Date(selectedSale.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Customer
                    </label>
                    <p className="text-sm">
                      {selectedSale.customer
                        ? selectedSale.customer.name || "N/A"
                        : "Walk-in"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cashier
                    </label>
                    <p className="text-sm">{selectedSale.user.name}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Items</h3>
                  <div className="space-y-2">
                    {selectedSale.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">৳{item.price}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ৳{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Subtotal:</span>
                      <span>
                        ৳
                        {(
                          selectedSale.total + (selectedSale.discount || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                    {selectedSale.discount && selectedSale.discount > 0 && (
                      <div className="flex justify-between items-center text-red-600">
                        <span>Discount:</span>
                        <span>-৳{selectedSale.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>৳{selectedSale.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={`Delete Sale - ৳${deleteDialog.saleTotal}`}
        description={`Are you sure you want to delete this sale? This action cannot be undone and will affect inventory records.`}
        isLoading={deleteDialog.isDeleting}
      />

      {/* Dues Confirmation Dialog */}
      {duesDialog.isOpen && duesDialog.sale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Mark Sale as Having Dues
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sale ID: {duesDialog.sale.id.slice(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Customer:
                      </span>
                      <span className="text-sm font-medium">
                        {duesDialog.sale.customer?.name || "Walk-in"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Total Amount:
                      </span>
                      <span className="text-sm font-medium">
                        ৳{duesDialog.sale.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Date:
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(
                          duesDialog.sale.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to mark this sale as having outstanding
                dues? This will enable the customer to make partial payments
                towards this sale.
              </p>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={handleCloseDuesDialog}
                  variant="outline"
                  disabled={duesDialog.isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmAddDue}
                  disabled={duesDialog.isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {duesDialog.isProcessing
                    ? "Processing..."
                    : "Yes, Mark as Dues"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Modal */}
      {showThermalReceipt && selectedSale && (
        <ThermalReceipt
          data={{
            customer: selectedSale.customer
              ? {
                  name: selectedSale.customer.name || undefined,
                  phone: selectedSale.customer.phone || "",
                }
              : undefined,
            items: selectedSale.items.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
            })),
            subtotal: selectedSale.total + (selectedSale.discount || 0),
            discount: selectedSale.discount || 0,
            total: selectedSale.total,
            saleId: selectedSale.id,
            date: new Date(selectedSale.createdAt).toLocaleString(),
            cashier: selectedSale.user.name,
          }}
          onClose={handleCloseThermalReceipt}
        />
      )}
    </div>
  );
}
