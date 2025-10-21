import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
