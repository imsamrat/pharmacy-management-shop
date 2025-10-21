import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

export const metadata = {
  title: "Dues Management - Pharmacy Shop",
  description: "Track and manage customer payment dues",
};

export default function DuesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
