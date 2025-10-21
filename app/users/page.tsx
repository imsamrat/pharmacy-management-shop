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
import { UserForm } from "../../components/UserForm";
import {
  Edit,
  Trash2,
  Plus,
  Users,
  Shield,
  User,
  Activity,
  Mail,
  Key,
} from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    sales: number;
    expenses: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
    isDeleting: false,
  });

  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
    customPassword: string;
    isResetting: boolean;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
    customPassword: "",
    isResetting: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 403) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to view users.",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(undefined);
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteDialog({
      isOpen: true,
      userId,
      userName,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.userId) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(`/api/users/${deleteDialog.userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        fetchUsers();
        toast({
          title: "Success",
          description: data.message || "User deleted successfully",
          variant: "success",
        });
        setDeleteDialog({
          isOpen: false,
          userId: null,
          userName: "",
          isDeleting: false,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || data.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the user",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      userId: null,
      userName: "",
      isDeleting: false,
    });
  };

  const handleResetPassword = (userId: string, userName: string) => {
    setResetPasswordDialog({
      isOpen: true,
      userId,
      userName,
      customPassword: "",
      isResetting: false,
    });
  };

  const handleConfirmResetPassword = async () => {
    if (!resetPasswordDialog.userId || !resetPasswordDialog.customPassword)
      return;

    if (resetPasswordDialog.customPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setResetPasswordDialog((prev) => ({ ...prev, isResetting: true }));

    try {
      const response = await fetch(
        `/api/users/${resetPasswordDialog.userId}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: resetPasswordDialog.customPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Reset Successful",
          description: `Password for ${resetPasswordDialog.userName} has been reset successfully`,
          variant: "success",
        });
        handleCloseResetPasswordDialog();
      } else {
        toast({
          title: "Error",
          description: data.message || data.error || "Failed to reset password",
          variant: "destructive",
        });
        setResetPasswordDialog((prev) => ({ ...prev, isResetting: false }));
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Error",
        description:
          "An unexpected error occurred while resetting the password",
        variant: "destructive",
      });
      setResetPasswordDialog((prev) => ({ ...prev, isResetting: false }));
    }
  };

  const handleCloseResetPasswordDialog = () => {
    setResetPasswordDialog({
      isOpen: false,
      userId: null,
      userName: "",
      customPassword: "",
      isResetting: false,
    });
  };

  const handleFormSuccess = () => {
    fetchUsers();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(undefined);
  };

  const getRoleIcon = (role: string) => {
    return role === "admin" ? (
      <Shield className="h-4 w-4 text-red-500" />
    ) : (
      <User className="h-4 w-4 text-blue-500" />
    );
  };

  const getRoleBadgeColor = (role: string) => {
    return role === "admin"
      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
  };

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="container mx-auto p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage user accounts and permissions
            </p>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inactive Users
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.status === "inactive").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Activity
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
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)}
                          <span className="ml-1 capitalize">{user.role}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                          }`}
                        >
                          <span className="capitalize">{user.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-1" />
                          <div>
                            <div>{user._count.sales} sales</div>
                            <div>{user._count.expenses} expenses</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditUser(user)}
                            size="sm"
                            variant="outline"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              handleResetPassword(user.id, user.name)
                            }
                            size="sm"
                            variant="outline"
                            title="Reset Password"
                            className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            size="sm"
                            variant="destructive"
                            title="Delete User"
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
          </CardContent>
        </Card>

        {showForm && (
          <UserForm
            user={editingUser}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}

        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title={`Delete ${deleteDialog.userName}`}
          description={`Are you sure you want to delete "${deleteDialog.userName}"? This action cannot be undone and will permanently remove their account.`}
          isLoading={deleteDialog.isDeleting}
        />

        {/* Reset Password Dialog */}
        {resetPasswordDialog.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Reset Password</h3>
                  <button
                    onClick={handleCloseResetPasswordDialog}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <Key className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">
                      Reset Password for {resetPasswordDialog.userName}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Enter a new password for this user. The current password
                      will be permanently lost.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={resetPasswordDialog.customPassword}
                      onChange={(e) =>
                        setResetPasswordDialog((prev) => ({
                          ...prev,
                          customPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter new password (min. 6 characters)"
                      minLength={6}
                      required
                    />
                    {resetPasswordDialog.customPassword &&
                      resetPasswordDialog.customPassword.length < 6 && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          Password must be at least 6 characters long
                        </p>
                      )}
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleCloseResetPasswordDialog}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmResetPassword}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                      disabled={
                        resetPasswordDialog.isResetting ||
                        !resetPasswordDialog.customPassword ||
                        resetPasswordDialog.customPassword.length < 6
                      }
                    >
                      {resetPasswordDialog.isResetting
                        ? "Resetting..."
                        : "Reset Password"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
}
