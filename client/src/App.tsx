import { Navigate, Route, Routes } from "react-router-dom";
import Upload from "./components/layouts/Upload";
import Dashboard from "./components/layouts/Dashboard";
import { useState } from "react";
import LoginPage from "./components/layouts/Auth/login";
import RegisterPage from "./components/layouts/Auth/register";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const cookieString = document.cookie;
    const cookies = cookieString.split("; ").reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    return cookies.token !== undefined;
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="upload"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Upload />
          </ProtectedRoute>
        }
      ></Route>
      <Route
        path="login"
        element={
          <LoginPage
            handleLogin={handleLogin}
            isAuthenticated={isAuthenticated}
          />
        }
      />
      <Route
        path="register"
        element={
          <RegisterPage
            handleLogin={handleLogin}
            isAuthenticated={isAuthenticated}
          />
        }
      />
    </Routes>
  );
}

export default App;

function ProtectedRoute(props: {
  isAuthenticated: boolean;
  children: React.ReactNode;
}) {
  return props.isAuthenticated ? props.children : <Navigate to="/login" />;
}
