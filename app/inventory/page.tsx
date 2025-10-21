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
import { ProductForm } from "../../components/ProductForm";
import { Edit, Trash2, Plus, Package, Filter, X, Search } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Product {
  id: string;
  name: string;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  initialStock: number;
  stock: number;
  soldQty: number;
  lastSoldDate: string | null;
  stockStatus: string;
  purchaseDate: string;
  categoryId?: string;
  category?: { id: string; name: string };
  shelfId?: string;
  shelf?: { id: string; name: string };
  expiryDate?: string;
  batchNumber?: string;
  manufacturer?: string;
  barcode?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shelves, setShelves] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [nameSearch, setNameSearch] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<string | null>(
    null
  );
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    productId: null,
    productName: "",
    isDeleting: false,
  });

  useEffect(() => {
    fetchProducts();
    fetchShelves();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/inventory");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShelves = async () => {
    try {
      const response = await fetch("/api/shelves");
      if (response.ok) {
        const data = await response.json();
        setShelves(data);
      }
    } catch (error) {
      console.error("Error fetching shelves:", error);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    setDeleteDialog({
      isOpen: true,
      productId,
      productName,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.productId) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(`/api/inventory/${deleteDialog.productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        fetchProducts();
        toast({
          title: "Success",
          description: data.message || "Product deleted successfully",
          variant: "success",
        });
        setDeleteDialog({
          isOpen: false,
          productId: null,
          productName: "",
          isDeleting: false,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || data.error || "Failed to delete product",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the product",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      productId: null,
      productName: "",
      isDeleting: false,
    });
  };

  const handleFormSuccess = () => {
    fetchProducts();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedShelf(null);
    setNameSearch("");
    setStockStatusFilter(null);
    setDateRange({ startDate: "", endDate: "" });
  };

  const getImageSrc = (image: string | undefined) => {
    if (!image) return null;

    // If it's already a data URL, return as is
    if (image.startsWith("data:")) {
      return image;
    }

    // If it's base64 without prefix, add default prefix
    if (
      image.length > 100 &&
      /^[A-Za-z0-9+/=]+$/.test(image.replace(/data:image\/[^;]+;base64,/, ""))
    ) {
      return `data:image/jpeg;base64,${image}`;
    }

    return null;
  };

  const lowStockProducts = products.filter((product) => product.stock < 10);

  // Get unique categories for filter
  const categories = Array.from(
    new Set(products.map((p) => p.category?.name).filter(Boolean))
  ).sort() as string[];

  // Get unique shelves for filter
  const shelfNames = Array.from(
    new Set(products.map((p) => p.shelf?.name).filter(Boolean))
  ).sort() as string[];

  // Filter products by all criteria
  const filteredProducts = products.filter((product) => {
    // Category filter
    if (selectedCategory && product.category?.name !== selectedCategory) {
      return false;
    }

    // Shelf filter
    if (selectedShelf && product.shelf?.name !== selectedShelf) {
      return false;
    }

    // Name search filter
    if (
      nameSearch &&
      !product.name.toLowerCase().includes(nameSearch.toLowerCase())
    ) {
      return false;
    }

    // Stock status filter
    if (stockStatusFilter && product.stockStatus !== stockStatusFilter) {
      return false;
    }

    // Date range filter (purchase date)
    if (dateRange.startDate || dateRange.endDate) {
      const purchaseDate = new Date(product.purchaseDate);

      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        if (purchaseDate < startDate) {
          return false;
        }
      }

      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        if (purchaseDate > endDate) {
          return false;
        }
      }
    }

    return true;
  });

  // Filter low stock products by all criteria
  const filteredLowStockProducts = lowStockProducts.filter((product) => {
    // Category filter
    if (selectedCategory && product.category?.name !== selectedCategory) {
      return false;
    }

    // Shelf filter
    if (selectedShelf && product.shelf?.name !== selectedShelf) {
      return false;
    }

    // Name search filter
    if (
      nameSearch &&
      !product.name.toLowerCase().includes(nameSearch.toLowerCase())
    ) {
      return false;
    }

    // Stock status filter
    if (stockStatusFilter && product.stockStatus !== stockStatusFilter) {
      return false;
    }

    // Date range filter (purchase date)
    if (dateRange.startDate || dateRange.endDate) {
      const purchaseDate = new Date(product.purchaseDate);

      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        if (purchaseDate < startDate) {
          return false;
        }
      }

      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        if (purchaseDate > endDate) {
          return false;
        }
      }
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex gap-3">
          <Button onClick={() => router.push("/categories")} variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
          <Button
            onClick={handleAddProduct}
            disabled={session?.user?.role !== "admin"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {filteredLowStockProducts.length > 0 && (
        <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Low Stock Alert ({filteredLowStockProducts.length} items)
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              Products with stock below 10 units require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700"
                >
                  <div className="flex items-center gap-3">
                    {getImageSrc(product.image) ? (
                      <img
                        src={getImageSrc(product.image)!}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {product.category?.name || "No category"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${
                        product.stock === 0
                          ? "text-red-600 dark:text-red-400"
                          : product.stock < 5
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {product.stock}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      in stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </CardTitle>
              <CardDescription>
                Filter products by multiple criteria
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Hide Filters
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4 mr-2" />
                  Show Filters
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showAdvancedFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Name Search */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Search by Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Enter product name..."
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={(value) =>
                    setSelectedCategory(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Shelf Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Shelf</label>
                <Select
                  value={selectedShelf || "all"}
                  onValueChange={(value) =>
                    setSelectedShelf(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Shelves" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shelves</SelectItem>
                    {shelfNames.map((shelf) => (
                      <SelectItem key={shelf} value={shelf}>
                        {shelf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock Status
                </label>
                <Select
                  value={stockStatusFilter || "all"}
                  onValueChange={(value) =>
                    setStockStatusFilter(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Stock Out">Stock Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Purchase Date From
                </label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Purchase Date To
                </label>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory ||
              selectedShelf ||
              nameSearch ||
              stockStatusFilter ||
              dateRange.startDate ||
              dateRange.endDate) && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Active Filters:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Category: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedShelf && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Shelf: {selectedShelf}
                      <button
                        onClick={() => setSelectedShelf(null)}
                        className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {nameSearch && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Name: {nameSearch}
                      <button
                        onClick={() => setNameSearch("")}
                        className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {stockStatusFilter && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Status: {stockStatusFilter}
                      <button
                        onClick={() => setStockStatusFilter(null)}
                        className="ml-1 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {dateRange.startDate && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      From: {dateRange.startDate}
                      <button
                        onClick={() =>
                          setDateRange((prev) => ({ ...prev, startDate: "" }))
                        }
                        className="ml-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {dateRange.endDate && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      To: {dateRange.endDate}
                      <button
                        onClick={() =>
                          setDateRange((prev) => ({ ...prev, endDate: "" }))
                        }
                        className="ml-1 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your inventory items
            {filteredProducts.length !== products.length && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                • Showing {filteredProducts.length} of {products.length}{" "}
                products
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Sold Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock In Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sold Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Shelf
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {getImageSrc(product.image) ? (
                        <img
                          src={getImageSrc(product.image)!}
                          alt={product.name}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            No Image
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.purchaseDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.lastSoldDate || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.initialStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.soldQty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.stockStatus === "Available"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {product.stockStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.category?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.shelf?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <Button
                        onClick={() => handleEditProduct(product)}
                        size="sm"
                        variant="outline"
                        className="mr-2"
                        disabled={session?.user?.role !== "admin"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {session?.user?.role === "admin" && (
                        <Button
                          onClick={() =>
                            handleDeleteProduct(product.id, product.name)
                          }
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

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteDialog.productName}`}
        description={`Are you sure you want to delete "${deleteDialog.productName}"? This action cannot be undone and may affect existing sales records.`}
        isLoading={deleteDialog.isDeleting}
      />
    </div>
  );
}
