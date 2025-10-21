"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/Select";
import { useToast } from "./ui/use-toast";

interface Product {
  id?: string;
  name: string;
  description?: string;
  purchasePrice: number;
  sellingPrice: number;
  initialStock: number;
  stock: number;
  categoryId?: string;
  category?: { id: string; name: string };
  shelfId?: string;
  shelf?: { id: string; name: string };
  expiryDate?: string;
  batchNumber?: string;
  manufacturer?: string;
  barcode?: string;
  image?: string;
}

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    name: product?.name || "",
    description: product?.description || "",
    purchasePrice: product?.purchasePrice || 0,
    sellingPrice: product?.sellingPrice || 0,
    initialStock: product?.initialStock || 0,
    stock: product?.stock || 0,
    categoryId: product?.categoryId || product?.category?.id || "",
    shelfId: product?.shelfId || product?.shelf?.id || "",
    expiryDate: product?.expiryDate
      ? new Date(product.expiryDate).toISOString().split("T")[0]
      : "",
    batchNumber: product?.batchNumber || "",
    manufacturer: product?.manufacturer || "",
    barcode: product?.barcode || "",
    image: product?.image || "",
  });
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [shelves, setShelves] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchShelves();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
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

  useEffect(() => {
    if (product?.image) {
      // Check if it's already a data URL, if not, assume it's base64 and add the prefix
      if (product.image.startsWith("data:")) {
        setPreviewUrl(product.image);
      } else if (product.image) {
        // Assume it's base64 data and add the data URL prefix
        // Try to detect the image type from the base64 string
        const base64Data = product.image;
        if (base64Data.includes("data:image/")) {
          setPreviewUrl(base64Data);
        } else {
          // If it doesn't have the prefix, add a default one
          setPreviewUrl(`data:image/jpeg;base64,${base64Data}`);
        }
      }
    }
  }, [product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setFormData((prev) => ({
          ...prev,
          image: result, // Store base64 data
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = product ? `/api/inventory/${product.id}` : "/api/inventory";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          purchasePrice: formData.purchasePrice,
          sellingPrice: formData.sellingPrice,
          initialStock: formData.initialStock,
          stock: formData.stock,
          categoryId:
            formData.categoryId === "none" ? null : formData.categoryId || null,
          shelfId:
            formData.shelfId === "none" ? null : formData.shelfId || null,
          expiryDate: formData.expiryDate || null,
          batchNumber: formData.batchNumber,
          manufacturer: formData.manufacturer,
          barcode: formData.barcode,
          image: formData.image,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description:
            data.message ||
            `Product ${product ? "updated" : "created"} successfully`,
          variant: "success",
        });
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description:
            error.message ||
            error.error ||
            `Failed to ${product ? "update" : "create"} product`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "purchasePrice" ||
        name === "sellingPrice" ||
        name === "initialStock" ||
        name === "stock"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle>{product ? "Edit Product" : "Add Product"}</CardTitle>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {product
              ? "Update product information"
              : "Add a new product to inventory"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Purchase Price *
                </label>
                <Input
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Selling Price *
                </label>
                <Input
                  name="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Initial Stock Qty *
              </label>
              <Input
                name="initialStock"
                type="number"
                min="0"
                value={formData.initialStock}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Current Stock Qty *
              </label>
              <Input
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select
                value={formData.categoryId || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: value === "none" ? "" : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Shelf</label>
              <Select
                value={formData.shelfId || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    shelfId: value === "none" ? "" : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a shelf" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No shelf</SelectItem>
                  {shelves.map((shelf) => (
                    <SelectItem key={shelf.id} value={shelf.id}>
                      {shelf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Expiry Date
              </label>
              <Input
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Batch Number
              </label>
              <Input
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Manufacturer
              </label>
              <Input
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Barcode</label>
              <Input
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Product Image
              </label>
              <div className="space-y-3">
                {previewUrl && (
                  <div className="relative inline-block">
                    <Image
                      src={previewUrl}
                      alt="Product preview"
                      width={96}
                      height={96}
                      className="h-24 w-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {selectedFile ? "Change Image" : "Upload Image"}
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-gray-500">
                      {selectedFile.name}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>
            </div>
          </form>
        </CardContent>
        <div className="flex-shrink-0 p-6 pt-0">
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              onClick={handleSubmit}
            >
              {isLoading ? "Saving..." : product ? "Update" : "Add"} Product
            </Button>
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
