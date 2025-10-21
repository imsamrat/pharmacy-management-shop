import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
