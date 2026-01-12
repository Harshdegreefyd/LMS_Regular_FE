import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../network/auth";

const AuthChecker = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role, user } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (isCheckingAuth) return;

      if (!role) {
        setIsChecking(false);
        return;
      }

      setIsCheckingAuth(true);

      try {
        const data = await getUserDetails(role);
        if (data?.user?.is_logout) {
          dispatch(logout());
          sessionStorage.clear();
          navigate("/login");
        } else {
          if (!user) {
            dispatch(login({
              user: data.user,
              role: role
            }));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch(logout());
        sessionStorage.clear();
        navigate("/login");
      } finally {
        setIsCheckingAuth(false);
        setIsChecking(false);
      }
    };

    checkUserStatus();
  }, [role]); 

  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return null;
};

export default AuthChecker;