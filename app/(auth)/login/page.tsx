import Login from "@/components/auth/Login";

// Force dynamic rendering - login page should never be statically generated
// This ensures URL parameters (like ?redirect=...) and session state work correctly
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <Login />;
}
