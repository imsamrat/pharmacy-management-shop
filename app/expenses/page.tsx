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
import { ExpenseForm } from "../../components/ExpenseForm";
import { Edit, Trash2, Plus } from "lucide-react";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date?: string | null;
  user: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Safe date formatter: returns a localized date string or 'N/A' when invalid/missing
const formatDate = (d?: string | null) => {
  if (!d) return "N/A";
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString();
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses");
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(undefined);
    setShowForm(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchExpenses();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Error deleting expense");
    }
  };

  const handleFormSuccess = () => {
    fetchExpenses();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Expense Tracking
        </h1>
        <Button onClick={handleAddExpense}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>Manage your business expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
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
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {expense.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ৳{expense.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {expense.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <Button
                        onClick={() => handleEditExpense(expense)}
                        size="sm"
                        variant="outline"
                        className="mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteExpense(expense.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
