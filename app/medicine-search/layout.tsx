import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

export default function MedicineSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
