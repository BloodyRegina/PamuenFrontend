import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import UserManage from "./pages/admin/UserManage";
import EvaluationList from "./pages/admin/EvaluationList";
import EvaluationDetail from "./pages/admin/EvaluationDetail";
import MyEvaluations from "./pages/me/MyEvaluations";
import EvaluatorTasks from "./pages/evaluator/EvaluatorTasks";

// Private Route Wrapper
const PrivateRoute = ({ children, auth }) => {
  const location = useLocation();
  if (!auth) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Redirect based on auth state
const AuthRoute = ({ children, auth }) => {
  if (auth) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children, auth }) => {
  if (!auth || auth.role !== "ADMIN") {
    return <Navigate to="/home" replace />;
  }
  return children;
};

function App() {
  // Simple mock auth state for phase 2
  const [auth, setAuth] = useState(null);

  const handleLogout = () => {
    setAuth(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <AuthRoute auth={auth}>
              <Login setAuth={setAuth} />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute auth={auth}>
              <Register />
            </AuthRoute>
          }
        />

        {/* Private Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute auth={auth}>
              <MainLayout user={auth} onLogout={handleLogout} />
            </PrivateRoute>
          }
        >
          {/* Default redirect from / to /home */}
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home user={auth} />} />

          {/* Admin Routes */}
          <Route
            path="admin/users"
            element={
              <AdminRoute auth={auth}>
                <UserManage />
              </AdminRoute>
            }
          />
          <Route
            path="admin/evaluations"
            element={
              <AdminRoute auth={auth}>
                <EvaluationList />
              </AdminRoute>
            }
          />
          <Route
            path="admin/evaluations/:id"
            element={
              <AdminRoute auth={auth}>
                <EvaluationDetail />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="/me/evaluations" element={<MyEvaluations />} />
        <Route path="/evaluator/evaluations" element={<EvaluatorTasks />} />
        {/* Catch all */}
        <Route
          path="*"
          element={<Navigate to={auth ? "/home" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
