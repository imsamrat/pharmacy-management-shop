"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  DollarSign,
  Package,
  CreditCard,
  TrendingUp,
  Users,
  ShoppingCart,
  BarChart3,
  PieChart,
  Activity,
  Plus,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Target,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import { useRouter } from "next/navigation";

interface DashboardData {
  monthlyData: Array<{
    month: string;
    sales: number;
    expenses: number;
    profit: number;
    profitPercentage: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
    amount: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: "sale" | "product" | "expense" | "employee";
    description: string;
    amount?: number;
    user: string;
    time: string;
    date: string;
  }>;
  totals: {
    sales: number;
    expenses: number;
    profit: number;
  };
  year: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
    fetchInventoryCount();
  }, [selectedYear]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics?year=${selectedYear}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventoryCount = async () => {
    try {
      const response = await fetch("/api/inventory");
      if (response.ok) {
        const inventory = await response.json();
        setInventoryCount(inventory.length);
      }
    } catch (error) {
      console.error("Error fetching inventory count:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <ShoppingCart className="h-4 w-4" />;
      case "product":
        return <Package className="h-4 w-4" />;
      case "expense":
        return <CreditCard className="h-4 w-4" />;
      case "employee":
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "sale":
        return "text-green-600 bg-green-100";
      case "product":
        return "text-blue-600 bg-blue-100";
      case "expense":
        return "text-red-600 bg-red-100";
      case "employee":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="animate-pulse space-y-6 sm:space-y-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 sm:w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64 sm:w-96"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="xl:col-span-2 h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Pharmacy Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your pharmacy.
          </p>
        </div>
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:gap-3 sm:space-y-0">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-0"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
              Total Sales
            </CardTitle>
            <div className="p-2 bg-green-500 rounded-full flex-shrink-0">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(data.totals.sales)}
            </div>
            <div className="flex items-center text-xs text-green-700 dark:text-green-300 mt-1">
              <TrendingUpIcon className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Revenue for {selectedYear}</span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-green-400/10 rounded-full -mr-8 -mt-8"></div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">
              Inventory Items
            </CardTitle>
            <div className="p-2 bg-blue-500 rounded-full flex-shrink-0">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
              {inventoryCount}
            </div>
            <div className="flex items-center text-xs text-blue-700 dark:text-blue-300 mt-1">
              <Activity className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {inventoryCount > 50 ? "Well stocked" : "Low stock alert"}
              </span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-blue-400/10 rounded-full -mr-8 -mt-8"></div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200 truncate">
              Total Expenses
            </CardTitle>
            <div className="p-2 bg-red-500 rounded-full flex-shrink-0">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100">
              {formatCurrency(data.totals.expenses)}
            </div>
            <div className="flex items-center text-xs text-red-700 dark:text-red-300 mt-1">
              <TrendingDown className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Costs for {selectedYear}</span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-red-400/10 rounded-full -mr-8 -mt-8"></div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200 truncate">
              Total Profit
            </CardTitle>
            <div className="p-2 bg-purple-500 rounded-full flex-shrink-0">
              <Target className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">
              {formatCurrency(data.totals.profit)}
            </div>
            <div className="flex items-center text-xs text-purple-700 dark:text-purple-300 mt-1">
              <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {data.totals.sales > 0
                  ? `${((data.totals.profit / data.totals.sales) * 100).toFixed(
                      1
                    )}% margin`
                  : "No sales yet"}
              </span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-purple-400/10 rounded-full -mr-8 -mt-8"></div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales vs Profit Combo Chart */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Sales vs Profit %
                </CardTitle>
                <CardDescription className="text-sm">
                  Monthly sales performance and profit margins for{" "}
                  {selectedYear}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="self-start sm:self-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="sales"
                    orientation="left"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                    width={60}
                  />
                  <YAxis
                    yAxisId="profit"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "sales")
                        return [formatCurrency(value), "Sales"];
                      if (name === "profitPercentage")
                        return [`${value.toFixed(1)}%`, "Profit %"];
                      return [value, name];
                    }}
                  />
                  <Bar
                    yAxisId="sales"
                    dataKey="sales"
                    fill="#8884d8"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    yAxisId="profit"
                    type="monotone"
                    dataKey="profitPercentage"
                    stroke="#ff7300"
                    strokeWidth={2}
                    dot={{ fill: "#ff7300", strokeWidth: 2, r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChart className="h-5 w-5" />
              Sales by Category
            </CardTitle>
            <CardDescription className="text-sm">
              Product category performance for {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${index * 45}, 70%, 50%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Percentage"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
              {data.categoryData.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center gap-1 sm:gap-2">
                  <div
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `hsl(${index * 45}, 70%, 50%)`,
                    }}
                  ></div>
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-20 sm:max-w-none">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Transactions */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ShoppingCart className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription className="text-sm">
                  Latest sales and activities
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/sales-management")}
                className="self-start sm:self-auto"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {data.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors gap-2 sm:gap-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${getActivityColor(
                        transaction.type
                      )}`}
                    >
                      {getActivityIcon(transaction.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {transaction.user} •{" "}
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {transaction.amount && (
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-green-600 dark:text-green-400 text-sm sm:text-base">
                        +{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {data.recentTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No transactions found for {selectedYear}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-sm">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start text-sm sm:text-base"
              variant="outline"
              onClick={() => router.push("/inventory")}
            >
              <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Add New Product</span>
            </Button>
            <Button
              className="w-full justify-start text-sm sm:text-base"
              variant="outline"
              onClick={() => router.push("/users")}
            >
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Manage Users</span>
            </Button>
            <Button
              className="w-full justify-start text-sm sm:text-base"
              variant="outline"
              onClick={() => router.push("/categories")}
            >
              <BarChart3 className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Manage Categories</span>
            </Button>
            <Button
              className="w-full justify-start text-sm sm:text-base"
              variant="outline"
              onClick={() => router.push("/expenses")}
            >
              <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Add Expense</span>
            </Button>
            <Button
              className="w-full justify-start text-sm sm:text-base"
              variant="outline"
              onClick={() => router.push("/sales-management")}
            >
              <ShoppingCart className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">View Sales</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
