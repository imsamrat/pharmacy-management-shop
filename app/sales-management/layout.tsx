import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

export default function SalesManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
