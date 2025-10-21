import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { Card } from "../../components/ui/Card";
import { db } from "../../lib/db";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { SaleForm } from "../../components/SaleForm";

export default async function SalesDashboard() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  // Fetch dashboard data
  const totalSales = await db.sale.aggregate({
    _sum: { total: true },
  });

  const todaySales = await db.sale.aggregate({
    _sum: { total: true },
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  const inventoryCount = await db.product.count();

  const recentSales = await db.sale.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      customer: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Today's Sales"
          value={`৳${todaySales._sum.total?.toFixed(2) || 0}`}
          icon={DollarSign}
        />
        <Card
          title="Total Sales"
          value={`৳${totalSales._sum.total?.toFixed(2) || 0}`}
          icon={ShoppingCart}
        />
        <Card
          title="Available Products"
          value={inventoryCount.toString()}
          icon={Package}
        />
        <Card
          title="Recent Transactions"
          value={recentSales.length.toString()}
          icon={TrendingUp}
        />
      </div>

      <SaleForm />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Sales
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cashier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentSales.map((sale: any) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {sale.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {sale.customer ? (
                      <div>
                        <div className="font-medium">
                          {sale.customer.name || "N/A"}
                        </div>
                        <div className="text-xs">{sale.customer.phone}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Walk-in</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {sale.user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ৳{sale.discount?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ৳{sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {sale.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
