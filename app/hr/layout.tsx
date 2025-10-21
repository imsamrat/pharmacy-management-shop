import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}
