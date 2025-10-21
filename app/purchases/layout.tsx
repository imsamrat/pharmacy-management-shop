import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

export default function PurchasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
