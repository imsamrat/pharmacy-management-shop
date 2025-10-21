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
import { Edit, Trash2, Plus, Package, MapPin } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { useSession } from "next-auth/react";
import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

interface Shelf {
  id: string;
  name: string;
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

type TabType = "categories" | "shelves";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("categories");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<
    Category | Shelf | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { data: session } = useSession();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemName: string;
    itemType: TabType;
    isDeleting: boolean;
  }>({
    isOpen: false,
    itemId: null,
    itemName: "",
    itemType: "categories",
    isDeleting: false,
  });

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

  const handleAddItem = () => {
    setEditingItem(undefined);
    setShowForm(true);
  };

  const handleEditItem = (item: Category | Shelf) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteItem = (
    itemId: string,
    itemName: string,
    itemType: TabType
  ) => {
    setDeleteDialog({
      isOpen: true,
      itemId,
      itemName,
      itemType,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.itemId || !deleteDialog.itemType) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const endpoint =
        deleteDialog.itemType === "categories" ? "categories" : "shelves";
      const response = await fetch(`/api/${endpoint}/${deleteDialog.itemId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        if (deleteDialog.itemType === "categories") {
          fetchCategories();
        } else {
          fetchShelves();
        }
        toast({
          title: "Success",
          description:
            data.message ||
            `${deleteDialog.itemType.slice(0, -1)} deleted successfully`,
          variant: "success",
        });
        setDeleteDialog({
          isOpen: false,
          itemId: null,
          itemName: "",
          itemType: "categories",
          isDeleting: false,
        });
      } else {
        toast({
          title: "Error",
          description:
            data.message ||
            data.error ||
            `Failed to delete ${deleteDialog.itemType.slice(0, -1)}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(
        `Error deleting ${deleteDialog.itemType.slice(0, -1)}:`,
        error
      );
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the item",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      itemId: null,
      itemName: "",
      itemType: "categories",
      isDeleting: false,
    });
  };

  const handleFormSuccess = () => {
    fetchCategories();
    fetchShelves();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Category & Shelf Management</h1>
          {session?.user?.role === "admin" && (
            <Button onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add {activeTab === "categories" ? "Category" : "Shelf"}
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "categories"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("shelves")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "shelves"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <MapPin className="h-4 w-4 inline mr-2" />
            Shelves ({shelves.length})
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage your product categories</CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No categories found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Create your first category to organize your products
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Products
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {category.description || "No description"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {category._count?.products || 0} products
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {new Date(category.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {session?.user?.role === "admin" && (
                              <>
                                <Button
                                  onClick={() => handleEditItem(category)}
                                  size="sm"
                                  variant="outline"
                                  className="mr-2"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleDeleteItem(
                                      category.id,
                                      category.name,
                                      "categories"
                                    )
                                  }
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Shelves Tab */}
        {activeTab === "shelves" && (
          <Card>
            <CardHeader>
              <CardTitle>Shelves</CardTitle>
              <CardDescription>
                Manage your medicine shelf locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {shelves.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No shelves found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Create your first shelf to organize your medicine locations
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Products
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {shelves.map((shelf) => (
                        <tr key={shelf.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {shelf.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {shelf.location || "No location"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {shelf.description || "No description"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {shelf._count?.products || 0} products
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {new Date(shelf.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {session?.user?.role === "admin" && (
                              <>
                                <Button
                                  onClick={() => handleEditItem(shelf)}
                                  size="sm"
                                  variant="outline"
                                  className="mr-2"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleDeleteItem(
                                      shelf.id,
                                      shelf.name,
                                      "shelves"
                                    )
                                  }
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showForm && (
          <ItemForm
            item={editingItem}
            itemType={activeTab}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}

        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title={`Delete ${deleteDialog.itemName}`}
          description={`Are you sure you want to delete "${deleteDialog.itemName}"? This action cannot be undone and may affect product organization.`}
          isLoading={deleteDialog.isDeleting}
        />
      </div>
    </ResponsiveLayout>
  );
}

// ItemForm component (handles both categories and shelves)
interface ItemFormProps {
  item?: Category | Shelf;
  itemType: TabType;
  onClose: () => void;
  onSuccess: () => void;
}

function ItemForm({ item, itemType, onClose, onSuccess }: ItemFormProps) {
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [location, setLocation] = useState((item as Shelf)?.location || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = itemType === "categories" ? "categories" : "shelves";
      const url = item ? `/api/${endpoint}/${item.id}` : `/api/${endpoint}`;
      const method = item ? "PUT" : "POST";

      const body =
        itemType === "categories"
          ? {
              name: name.trim(),
              description: description.trim() || null,
            }
          : {
              name: name.trim(),
              location: location.trim() || null,
              description: description.trim() || null,
            };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description:
            data.message ||
            `${itemType.slice(0, -1)} ${
              item ? "updated" : "created"
            } successfully`,
          variant: "success",
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Error",
          description:
            data.error ||
            `Failed to ${item ? "update" : "create"} ${itemType.slice(0, -1)}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error submitting ${itemType.slice(0, -1)}:`, error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {item
              ? `Edit ${itemType.slice(0, -1)}`
              : `Add ${itemType.slice(0, -1)}`}
          </CardTitle>
          <CardDescription>
            {item
              ? `Update ${itemType.slice(0, -1)} information`
              : `Create a new ${itemType.slice(0, -1)} for organizing ${
                  itemType === "categories" ? "products" : "medicine locations"
                }`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={`Enter ${itemType.slice(0, -1)} name`}
                required
              />
            </div>

            {itemType === "shelves" && (
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Aisle A, Row 1"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={`Enter ${itemType.slice(
                  0,
                  -1
                )} description (optional)`}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : item ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
