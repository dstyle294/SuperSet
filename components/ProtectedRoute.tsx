import { useAuthStore } from "@/store/authStore";
import Loader from "./loader";
import { routePatternToRegex } from "expo-router/build/fork/getStateFromPath-forks";
import { router } from "expo-router";

type ProtectedRouteProps = React.PropsWithChildren<{}>;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, user, isInitialized, isLoading } = useAuthStore();

  console.log(token, user, isInitialized, isLoading)
  if (isLoading) {
    return <Loader size="large" />; 
  }

  if (!token || !user) {
    router.replace('/(auth)')
    return ;
  }

  return children;
};