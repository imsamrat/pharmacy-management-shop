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
  Building2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  AlertCircle,
  TrendingUp,
  Filter,
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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contact: "",
      phone: "",
      email: "",
      address: "",
    });
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: "Error",
        description: "Please enter supplier name",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Supplier added successfully",
        });
        setIsAddDialogOpen(false);
        resetForm();
        fetchSuppliers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to add supplier",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
    }
  };

  const handleEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingSupplier || !formData.name) {
      toast({
        title: "Error",
        description: "Please enter supplier name",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/suppliers/${editingSupplier.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Supplier updated successfully",
        });
        setIsEditDialogOpen(false);
        setEditingSupplier(null);
        resetForm();
        fetchSuppliers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update supplier",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this supplier? This will also delete all associated purchases."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        });
        fetchSuppliers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete supplier",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
    setIsEditDialogOpen(true);
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.contact &&
        supplier.contact.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (supplier.phone && supplier.phone.includes(searchQuery))
  );

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading suppliers...
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
            Supplier Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage suppliers and their purchase history
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Enter the details of the new supplier.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Supplier Name *
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="ABC Pharmaceuticals"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium mb-1"
                >
                  Contact Person
                </label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-1"
                  >
                    Phone
                  </label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+880 1234-567890"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="contact@abcpharma.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium mb-1"
                >
                  Address
                </label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Business Street, Dhaka"
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
                <Button type="submit">Add Supplier</Button>
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
              Total Suppliers
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Purchases
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.reduce((sum, s) => sum + s.summary.totalPurchases, 0)}
            </div>
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
                suppliers.reduce((sum, s) => sum + s.summary.totalAmount, 0)
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
              {formatCurrency(
                suppliers.reduce((sum, s) => sum + s.summary.totalPending, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, contact, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    {supplier.contact && (
                      <CardDescription>{supplier.contact}</CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(supplier)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-2">
                {supplier.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4 mr-2" />
                    {supplier.phone}
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4 mr-2" />
                    {supplier.email}
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    {supplier.address}
                  </div>
                )}
              </div>

              {/* Purchase Summary */}
              <div className="border-t pt-4 space-y-2">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                  Purchase Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Total Purchases:
                    </span>
                    <div className="font-semibold">
                      {supplier.summary.totalPurchases}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Total Amount:
                    </span>
                    <div className="font-semibold">
                      {formatCurrency(supplier.summary.totalAmount)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Paid:
                    </span>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(supplier.summary.totalPaid)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Pending:
                    </span>
                    <div className="font-semibold text-red-600">
                      {formatCurrency(supplier.summary.totalPending)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No suppliers found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery
              ? "Try adjusting your search criteria."
              : "Get started by adding your first supplier."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          )}
        </div>
      )}

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update the supplier information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSupplier} className="space-y-4">
            <div>
              <label
                htmlFor="edit-name"
                className="block text-sm font-medium mb-1"
              >
                Supplier Name *
              </label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ABC Pharmaceuticals"
                required
              />
            </div>

            <div>
              <label
                htmlFor="edit-contact"
                className="block text-sm font-medium mb-1"
              >
                Contact Person
              </label>
              <Input
                id="edit-contact"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-phone"
                  className="block text-sm font-medium mb-1"
                >
                  Phone
                </label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+880 1234-567890"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@abcpharma.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-address"
                className="block text-sm font-medium mb-1"
              >
                Address
              </label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="123 Business Street, Dhaka"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingSupplier(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Supplier</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
