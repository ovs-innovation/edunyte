import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthAPI, clearToken, TOKEN_KEY } from "@/lib/api";
import { useRole } from "@/contexts/RoleContext";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentRole } = useRole();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      if (!token) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }
      try {
        const data = await AuthAPI.me();
        if (data.user?.role) {
          // Block student access to admin app
          if (data.user.role === "student") {
            clearToken();
            navigate("/login", { 
              replace: true, 
              state: { 
                from: location.pathname,
                message: "Students cannot access admin panel. Please use the student app." 
              } 
            });
            return;
          }
          setCurrentRole(data.user.role);
        }
        const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
        if (data.user?.email) {
          storage.setItem("user-email", data.user.email);
        }
        if (data.user?.name) {
          storage.setItem("user-name", data.user.name);
        }
        if (data.user?.id) {
          storage.setItem("user-id", data.user.id);
        }
        setReady(true);
      } catch {
        clearToken();
        navigate("/login", { replace: true, state: { from: location.pathname } });
      }
    };
    verify();
  }, [navigate, location.pathname, setCurrentRole]);

  if (!ready) return null;
  return <>{children}</>;
};

export default ProtectedRoute;

