import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

// Force Node.js runtime for database operations
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year =
      searchParams.get("year") || new Date().getFullYear().toString();

    // Get sales data for the year
    const sales = await db.sale.findMany({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${parseInt(year) + 1}-01-01`),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        user: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get expenses data for the year
    const expenses = await db.expense.findMany({
      where: {
        date: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${parseInt(year) + 1}-01-01`),
        },
      },
      include: {
        user: true,
      },
      orderBy: { date: "desc" },
    });

    // Get dues data (sales with outstanding payments)
    const dues = await db.sale.findMany({
      where: {
        hasDue: true,
        status: {
          in: ["pending", "partial"],
        },
      },
      include: {
        customer: true,
        duePayments: true,
      },
    });

    // Calculate dues totals
    const totalOutstanding = dues.reduce((sum, sale) => {
      return sum + (sale.total - sale.paidAmount);
    }, 0);

    const totalCollected = dues.reduce((sum, sale) => {
      return sum + sale.paidAmount;
    }, 0);

    // Calculate monthly data
    const monthlyData = [];
    const categoryData = new Map();

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(parseInt(year), month, 1);
      const monthEnd = new Date(parseInt(year), month + 1, 0, 23, 59, 59);

      // Filter sales for this month
      const monthSales = sales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= monthStart && saleDate <= monthEnd;
      });

      // Filter expenses for this month
      const monthExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.createdAt);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });

      const totalSales = monthSales.reduce((sum, sale) => sum + sale.total, 0);
      const totalExpenses = monthExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      // Calculate profit based on selling price - purchase price for each item
      const profit = monthSales.reduce((sum, sale) => {
        return (
          sum +
          sale.items.reduce((itemSum, item) => {
            const sellingValue = item.price * item.quantity;
            const purchaseValue = item.product.purchasePrice * item.quantity;
            return itemSum + (sellingValue - purchaseValue);
          }, 0)
        );
      }, 0);

      const profitPercentage = totalSales > 0 ? (profit / totalSales) * 100 : 0;

      monthlyData.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        sales: totalSales,
        expenses: totalExpenses,
        profit: profit,
        profitPercentage: profitPercentage,
      });

      // Collect category data
      monthSales.forEach((sale) => {
        sale.items.forEach((item) => {
          const categoryName = item.product.category?.name || "Uncategorized";
          const current = categoryData.get(categoryName) || 0;
          categoryData.set(categoryName, current + item.price * item.quantity);
        });
      });
    }

    // Convert category data to array and calculate percentages
    const totalSalesAll = sales.reduce((sum, sale) => sum + sale.total, 0);
    const categoryArray = Array.from(categoryData.entries())
      .map(([name, value]) => ({
        name,
        value:
          totalSalesAll > 0 ? Math.round((value / totalSalesAll) * 100) : 0,
        amount: value,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Get recent transactions (last 10)
    const recentTransactions = sales.slice(0, 10).map((sale) => ({
      id: sale.id,
      type: "sale" as const,
      description: `Sale to ${sale.customer?.name || "Customer"}`,
      amount: sale.total,
      user: sale.user.name || "Unknown",
      time: new Date(sale.createdAt).toLocaleString(),
      date: sale.createdAt.toISOString(),
    }));

    // Calculate totals
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Calculate total profit based on selling price - purchase price
    const totalProfit = sales.reduce((sum, sale) => {
      return (
        sum +
        sale.items.reduce((itemSum, item) => {
          const sellingValue = item.price * item.quantity;
          const purchaseValue = item.product.purchasePrice * item.quantity;
          return itemSum + (sellingValue - purchaseValue);
        }, 0)
      );
    }, 0);

    return NextResponse.json({
      monthlyData,
      categoryData: categoryArray,
      recentTransactions,
      totals: {
        sales: totalSales,
        expenses: totalExpenses,
        profit: totalProfit,
      },
      dues: {
        totalOutstanding,
        totalCollected,
        activeDuesCount: dues.length,
        collectionRate:
          totalCollected + totalOutstanding > 0
            ? (totalCollected / (totalCollected + totalOutstanding)) * 100
            : 0,
      },
      year: parseInt(year),
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
