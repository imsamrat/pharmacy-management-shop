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
import { EmployeeForm } from "../../components/EmployeeForm";
import { Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { useSession } from "next-auth/react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  salary: number;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<
    Employee | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { data: session } = useSession();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    employeeId: string | null;
    employeeName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    employeeId: null,
    employeeName: "",
    isDeleting: false,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/hr");
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(undefined);
    setShowForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDeleteEmployee = (employeeId: string, employeeName: string) => {
    setDeleteDialog({
      isOpen: true,
      employeeId,
      employeeName,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.employeeId) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(`/api/hr/${deleteDialog.employeeId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        fetchEmployees();
        toast({
          title: "Success",
          description: data.message || "Employee deleted successfully",
          variant: "success",
        });
        setDeleteDialog({
          isOpen: false,
          employeeId: null,
          employeeName: "",
          isDeleting: false,
        });
      } else {
        toast({
          title: "Error",
          description:
            data.message || data.error || "Failed to delete employee",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the employee",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      employeeId: null,
      employeeName: "",
      isDeleting: false,
    });
  };

  const handleFormSuccess = () => {
    fetchEmployees();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEmployee(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Human Resources
        </h1>
        <Button
          onClick={handleAddEmployee}
          disabled={session?.user?.role !== "admin"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>Manage your employee records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hire Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {employee.salary ? `৳${employee.salary}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(employee.hireDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <Button
                        onClick={() => handleEditEmployee(employee)}
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
                            handleDeleteEmployee(employee.id, employee.name)
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
        <EmployeeForm
          employee={editingEmployee}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteDialog.employeeName}`}
        description={`Are you sure you want to delete "${deleteDialog.employeeName}"? This action cannot be undone.`}
        isLoading={deleteDialog.isDeleting}
      />
    </div>
  );
}
