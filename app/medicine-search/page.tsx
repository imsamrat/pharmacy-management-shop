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
  Search,
  Package,
  MapPin,
  Calendar,
  AlertTriangle,
  Filter,
  X,
} from "lucide-react";

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
  shelf?: { id: string; name: string; location?: string };
  expiryDate?: string;
  batchNumber?: string;
  manufacturer?: string;
  barcode?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MedicineSearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shelves, setShelves] = useState<
    Array<{ id: string; name: string; location?: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  // Get unique categories
  const categories = Array.from(
    new Set(products.map((p) => p.category?.name).filter(Boolean))
  ).sort() as string[];

  // Filter products based on search criteria
  const filteredProducts = products.filter((product) => {
    // Search query filter (name, manufacturer, batch number)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(query);
      const matchesManufacturer = product.manufacturer
        ?.toLowerCase()
        .includes(query);
      const matchesBatch = product.batchNumber?.toLowerCase().includes(query);
      const matchesBarcode = product.barcode?.toLowerCase().includes(query);

      if (
        !matchesName &&
        !matchesManufacturer &&
        !matchesBatch &&
        !matchesBarcode
      ) {
        return false;
      }
    }

    // Shelf filter
    if (selectedShelf && product.shelf?.name !== selectedShelf) {
      return false;
    }

    // Category filter
    if (selectedCategory && product.category?.name !== selectedCategory) {
      return false;
    }

    return true;
  });

  // Group products by shelf
  const productsByShelf = filteredProducts.reduce((acc, product) => {
    const shelfName = product.shelf?.name || "No Shelf Assigned";
    if (!acc[shelfName]) {
      acc[shelfName] = [];
    }
    acc[shelfName].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Check for expired or expiring soon medicines
  const today = new Date();
  const warningDays = 30; // Warn 30 days before expiry
  const expiringSoonProducts = products.filter((product) => {
    if (!product.expiryDate) return false;
    const expiryDate = new Date(product.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= warningDays && daysUntilExpiry >= 0;
  });

  const expiredProducts = products.filter((product) => {
    if (!product.expiryDate) return false;
    const expiryDate = new Date(product.expiryDate);
    return expiryDate < today;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading medicines...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Pharmacy Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
              <Package className="h-10 w-10" />
              Pharmacy Medicine Shelves
            </h1>
            <p className="text-blue-100 text-lg">
              Browse medicines by shelf location • {filteredProducts.length}{" "}
              products available
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔍 Search Medicines
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by medicine name, manufacturer, batch number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-gray-300 dark:border-gray-600 rounded-md focus:border-blue-500"
                />
              </div>
            </div>

            <div className="lg:w-72">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📍 Filter by Shelf
              </label>
              <Select
                value={selectedShelf || "all"}
                onValueChange={(value) =>
                  setSelectedShelf(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 rounded-md">
                  <SelectValue placeholder="All Shelves" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="py-2">
                    All Shelves
                  </SelectItem>
                  {shelves.map((shelf) => (
                    <SelectItem
                      key={shelf.id}
                      value={shelf.name}
                      className="py-2"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">{shelf.name}</div>
                          {shelf.location && (
                            <div className="text-xs text-gray-500">
                              {shelf.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || selectedShelf) && (
              <div className="lg:self-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedShelf(null);
                  }}
                  className="h-11 px-4 border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {(expiredProducts.length > 0 || expiringSoonProducts.length > 0) && (
          <div className="mb-8 space-y-4">
            {expiredProducts.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-500 rounded-full p-2">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-800 dark:text-red-200">
                      ⚠️ EXPIRED MEDICINES ({expiredProducts.length})
                    </h3>
                    <p className="text-red-700 dark:text-red-300">
                      Remove from shelves immediately
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expiredProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-red-300 dark:border-red-700 shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                          <Package className="h-8 w-8 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                            {product.name}
                          </h4>
                          <p className="text-red-600 dark:text-red-400 font-semibold">
                            EXPIRED: {product.expiryDate}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Shelf: {product.shelf?.name || "Not assigned"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expiringSoonProducts.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-500 rounded-full p-2">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                      ⏰ EXPIRING SOON ({expiringSoonProducts.length})
                    </h3>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Check expiry dates regularly
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expiringSoonProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-yellow-300 dark:border-yellow-700 shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                          <Package className="h-8 w-8 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                            {product.name}
                          </h4>
                          <p className="text-yellow-600 dark:text-yellow-400 font-semibold">
                            Expires: {product.expiryDate}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Shelf: {product.shelf?.name || "Not assigned"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Physical Shelf Layout */}
        <div className="space-y-6">
          {Object.keys(productsByShelf).length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                No Medicines Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Try adjusting your search or check if medicines are properly
                assigned to shelves
              </p>
            </div>
          ) : (
            Object.entries(productsByShelf).map(
              ([shelfName, shelfProducts]) => (
                <div key={shelfName} className="space-y-3">
                  {/* Shelf Header - Compact */}
                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-700 dark:to-gray-600 text-white rounded-lg p-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-white/20 rounded p-1">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{shelfName}</h2>
                          <p className="text-gray-200 text-xs">
                            {shelfProducts.length} medicine
                            {shelfProducts.length !== 1 ? "s" : ""}
                            {shelves.find((s) => s.name === shelfName)
                              ?.location && (
                              <span className="ml-2">
                                •{" "}
                                {
                                  shelves.find((s) => s.name === shelfName)
                                    ?.location
                                }
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-green-300">
                          ৳
                          {shelfProducts
                            .reduce((sum, p) => sum + p.sellingPrice, 0)
                            .toFixed(0)}{" "}
                          total
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products on Shelf - Like Physical Products */}
                  <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2">
                      {shelfProducts.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-600 overflow-hidden group"
                        >
                          {/* Product Image - Very Compact */}
                          <div className="h-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 flex items-center justify-center p-1 border-b border-gray-200 dark:border-gray-600">
                            {getImageSrc(product.image) ? (
                              <img
                                src={getImageSrc(product.image)!}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>

                          {/* Product Info - Ultra Compact Layout */}
                          <div className="p-2">
                            {/* Medicine Name */}
                            <h3 className="font-bold text-gray-900 dark:text-white text-xs leading-tight mb-1 line-clamp-2">
                              {product.name}
                            </h3>

                            {/* Manufacturer - Compact */}
                            {product.manufacturer && (
                              <p className="text-blue-600 dark:text-blue-400 font-medium text-xs mb-1 truncate">
                                {product.manufacturer}
                              </p>
                            )}

                            {/* Key Details - Minimal */}
                            <div className="space-y-0.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  Cat:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white text-xs truncate">
                                  {product.category?.name || "Gen"}
                                </span>
                              </div>

                              {product.batchNumber && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                                    Batch:
                                  </span>
                                  <span className="font-medium text-gray-900 dark:text-white text-xs">
                                    {product.batchNumber}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  Stock:
                                </span>
                                <span
                                  className={`font-semibold text-xs ${
                                    product.stock === 0
                                      ? "text-red-600"
                                      : product.stock < 10
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {product.stock}
                                </span>
                              </div>
                            </div>

                            {/* Price and Expiry - Compact */}
                            <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-600">
                              <div className="flex justify-between items-center">
                                <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                                  ৳{product.sellingPrice}
                                </span>
                                {product.expiryDate && (
                                  <span
                                    className={`text-xs font-medium ${
                                      new Date(product.expiryDate) < today
                                        ? "text-red-600"
                                        : new Date(product.expiryDate) <=
                                          new Date(
                                            today.getTime() +
                                              warningDays * 24 * 60 * 60 * 1000
                                          )
                                        ? "text-yellow-600"
                                        : "text-gray-500 dark:text-gray-400"
                                    }`}
                                  >
                                    {new Date(
                                      product.expiryDate
                                    ).toLocaleDateString("en-IN", {
                                      month: "short",
                                      year: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}
