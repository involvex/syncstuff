import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export default function LogoutRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear session from localStorage
    localStorage.removeItem("session");
    localStorage.removeItem("user");

    // Redirect to home
    navigate("/", { replace: true });
  }, [navigate]);

  return <div>Logging out...</div>;
}
