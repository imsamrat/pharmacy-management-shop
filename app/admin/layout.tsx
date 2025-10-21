import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
