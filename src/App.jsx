import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";
import Swal from "sweetalert2";
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
import AssessmentForm from "./pages/evaluator/AssessmentForm";
import MyEvaluationDetail from "./pages/me/MyEvaluationDetail";

// Private Route Wrapper (บังคับ Login)
const PrivateRoute = ({ children, auth }) => {
  const location = useLocation();
  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Auth Route (ถ้า Login แล้วไม่ให้เข้าหน้า Login/Register อีก)
const AuthRoute = ({ children, auth }) => {
  if (auth) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

// Role Route Wrapper (เช็คสิทธิ์แบบ Case-Insensitive พร้อม Alert)
const RoleRoute = ({ children, auth, allowedRoles }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (auth && auth.role) {
      const userRole = auth.role.toUpperCase();
      const isAllowed = allowedRoles.some(role => role.toUpperCase() === userRole);
      
      if (!isAllowed) {
        Swal.fire({
          icon: "error",
          title: "ปฏิเสธการเข้าถึง",
          text: `บัญชีของคุณ (Role: ${auth.role}) ไม่มีสิทธิ์เข้าใช้งานหน้านี้`,
          confirmButtonColor: "#8b5cf6"
        }).then(() => {
          navigate("/home", { replace: true });
        });
      }
    }
  }, [auth, allowedRoles, navigate]);

  if (!auth || !auth.role) return null;

  const userRole = auth.role.toUpperCase();
  const isAllowed = allowedRoles.some(role => role.toUpperCase() === userRole);
  if (!isAllowed) return null;

  return children;
};

function App() {
  const [auth, setAuth] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthRoute auth={auth}><Login setAuth={setAuth} /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute auth={auth}><Register /></AuthRoute>} />

        {/* Private Routes (ครอบด้วย MainLayout และ PrivateRoute ทั้งหมด) */}
        <Route path="/" element={<PrivateRoute auth={auth}><MainLayout user={auth} onLogout={handleLogout} /></PrivateRoute>}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home user={auth} />} />

          {/* === ADMIN ROUTES === */}
          <Route path="admin/users" element={<RoleRoute auth={auth} allowedRoles={['ADMIN']}><UserManage /></RoleRoute>} />
          <Route path="admin/evaluations" element={<RoleRoute auth={auth} allowedRoles={['ADMIN']}><EvaluationList /></RoleRoute>} />
          <Route path="admin/evaluations/:id" element={<RoleRoute auth={auth} allowedRoles={['ADMIN']}><EvaluationDetail /></RoleRoute>} />

          {/* === EVALUATOR ROUTES === */}
          {/* อนุญาตให้ ADMIN เข้ามาดูด้วยได้เผื่อไว้ แต่หลักๆ คือ EVALUATOR */}
          <Route path="evaluator/evaluations" element={<RoleRoute auth={auth} allowedRoles={['EVALUATOR', 'ADMIN']}><EvaluatorTasks /></RoleRoute>} />
          
          {/* แก้ไข Path ให้ตรงสเปก PDF: ใช้คำว่า assignment แทน assess */}
          <Route path="evaluator/assignment/:assignmentId" element={<RoleRoute auth={auth} allowedRoles={['EVALUATOR', 'ADMIN']}><AssessmentForm /></RoleRoute>} />

          {/* === EVALUATEE ROUTES === */}
          <Route path="me/evaluations" element={<RoleRoute auth={auth} allowedRoles={['EVALUATEE', 'ADMIN']}><MyEvaluations /></RoleRoute>} />
          <Route path="me/evaluations/:assignmentId" element={<RoleRoute auth={auth} allowedRoles={['EVALUATEE', 'ADMIN']}><MyEvaluationDetail /></RoleRoute>} />
        </Route>

        {/* Catch all (ถ้า Path ไม่ตรงกับด้านบนเลย ให้กลับไปหน้า Home) */}
        <Route path="*" element={<Navigate to={auth ? "/home" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;