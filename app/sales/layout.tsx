import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
