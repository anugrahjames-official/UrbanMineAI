import OEMDashboard from "../dashboard/page";

// Explicit component wrapper to resolve Turbopack module instantiation issues
export default async function CompliancePage() {
  return <OEMDashboard />;
}
