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

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseFormProps {
  expense?: Expense;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExpenseForm({ expense, onClose, onSuccess }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      const expenseDate = expense.date ? new Date(expense.date) : new Date();
      const isValidDate = !isNaN(expenseDate.getTime());
      const dateString = isValidDate
        ? expenseDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        category: expense.category,
        date: dateString,
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = expense ? `/api/expenses/${expense.id}` : "/api/expenses";
      const method = expense ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: formData.description,
          amount: parseFloat(formData.amount),
          category: formData.category,
          date: formData.date
            ? new Date(formData.date).toISOString()
            : new Date().toISOString(),
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Error saving expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? value : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle>{expense ? "Edit Expense" : "Add Expense"}</CardTitle>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {expense
              ? "Update expense information"
              : "Add a new expense record"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Description *
              </label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount *</label>
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                <option value="utilities">Utilities</option>
                <option value="rent">Rent</option>
                <option value="supplies">Supplies</option>
                <option value="marketing">Marketing</option>
                <option value="equipment">Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <Input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </form>
        </CardContent>
        <div className="flex-shrink-0 p-6 pt-0">
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
              onClick={handleSubmit}
            >
              {isSubmitting ? "Saving..." : expense ? "Update" : "Add"} Expense
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
