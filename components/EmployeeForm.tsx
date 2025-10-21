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

interface EmployeeFormProps {
  employee?: Employee;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmployeeForm({
  employee,
  onClose,
  onSuccess,
}: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    salary: "",
    hireDate: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      const hireDate = employee.hireDate
        ? new Date(employee.hireDate)
        : new Date();
      const isValidDate = !isNaN(hireDate.getTime());
      const dateString = isValidDate
        ? hireDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || "",
        position: employee.position,
        salary: employee.salary.toString(),
        hireDate: dateString,
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = employee ? `/api/hr/${employee.id}` : "/api/hr";
      const method = employee ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          position: formData.position,
          salary: parseFloat(formData.salary),
          hireDate: formData.hireDate
            ? new Date(formData.hireDate).toISOString()
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
      console.error("Error saving employee:", error);
      alert("Error saving employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salary" ? value : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle>{employee ? "Edit Employee" : "Add Employee"}</CardTitle>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {employee
              ? "Update employee information"
              : "Add a new employee record"}
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
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Position *
              </label>
              <Input
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Salary *</label>
              <Input
                name="salary"
                type="number"
                step="0.01"
                min="0"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Hire Date *
              </label>
              <Input
                name="hireDate"
                type="date"
                value={formData.hireDate}
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
              {isSubmitting ? "Saving..." : employee ? "Update" : "Add"}{" "}
              Employee
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
