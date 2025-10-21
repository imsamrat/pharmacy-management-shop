"use client";

import { useState, useEffect } from "react";
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

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

interface UserFormProps {
  user?: User;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserForm({ user, onClose, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState<User>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "user",
    status: user?.status || "active",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords for new users
      if (!user && (!password || password.length < 6)) {
        toast({
          title: "Validation Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }

      // Validate password confirmation for new users
      if (!user && password !== confirmPassword) {
        toast({
          title: "Validation Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        return;
      }

      const url = user ? `/api/users/${user.id}` : "/api/users";
      const method = user ? "PUT" : "POST";

      const requestData = user
        ? {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            status: formData.status,
            ...(password && { password }),
          }
        : {
            name: formData.name,
            email: formData.email,
            password,
            role: formData.role,
            status: formData.status,
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description:
            data.message || `User ${user ? "updated" : "created"} successfully`,
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
            `Failed to ${user ? "update" : "create"} user`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the user",
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
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle>{user ? "Edit User" : "Add User"}</CardTitle>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {user
              ? "Update user information and permissions"
              : "Create a new user account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name *
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address *
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role *</label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User (Salesperson)</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === "admin"
                  ? "Admins have full access to all features"
                  : "Users can create sales and expenses but cannot delete inventory or sales"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status *</label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.status === "active"
                  ? "Active users can log in to the system"
                  : "Inactive users cannot log in to the system"}
              </p>
            </div>

            {(!user || password) && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password {!user && "*"}
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!user}
                    placeholder={
                      user
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    minLength={6}
                  />
                </div>

                {!user && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Confirm Password *
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!user}
                      placeholder="Confirm password"
                      minLength={6}
                    />
                  </div>
                )}
              </>
            )}
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
              {isLoading ? "Saving..." : user ? "Update" : "Create"} User
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
