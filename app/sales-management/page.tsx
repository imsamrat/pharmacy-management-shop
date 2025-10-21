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
import { Trash2, Eye, DollarSign, Download } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { useSession } from "next-auth/react";
import { ThermalReceipt } from "../../components/ThermalReceipt";
import * as XLSX from "xlsx";

interface Sale {
  id: string;
  total: number;
  discount: number;
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

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales");
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Management</h1>
        <Button
          onClick={exportToExcel}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
          <CardDescription>
            View and manage all sales transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
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
