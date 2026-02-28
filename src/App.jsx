import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Swal from "sweetalert2"; // นำเข้า SweetAlert2
import MainLayout from "./components/layout/MainLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

// Admin Pages
import UserManage from "./pages/admin/UserManage";
import EvaluationList from "./pages/admin/EvaluationList";
import EvaluationDetail from "./pages/admin/EvaluationDetail";

// Evaluatee Pages
import MyEvaluations from "./pages/me/MyEvaluations";
import MyEvaluationDetail from "./pages/me/MyEvaluationDetail";

// Evaluator Pages
import EvaluatorTasks from "./pages/evaluator/EvaluatorTasks";
import AssessmentForm from "./pages/evaluator/AssessmentForm";
import EvaluatorPairList from "./pages/evaluator/EvaluatorPairList";
import EvaluatorResult from "./pages/evaluator/EvaluatorResult";

// Private Route Wrapper (บังคับ Login)
const PrivateRoute = ({ children, auth }) => {
  const location = useLocation();
  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Auth Route (ถ้า Login แล้วให้ไปหน้า Home)
const AuthRoute = ({ children, auth }) => {
  if (auth) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

// Role Protected Route Wrapper (ตรวจสิทธิ์พร้อมแจ้งเตือนด้วย SweetAlert2)
const RoleProtectedRoute = ({ children, auth, allowedRole }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (auth && auth.role !== allowedRole) {
      Swal.fire({
        icon: "warning",
        title: "ปฏิเสธการเข้าถึง",
        text: "คุณไม่มีสิทธิ์เข้าใช้งานหน้านี้",
        confirmButtonColor: "#dc2626", // ใช้สีแดงให้เข้ากับตีม
      }).then(() => {
        navigate("/home", { replace: true });
      });
    }
  }, [auth, allowedRole, navigate]);

  // ซ่อนเนื้อหาระหว่างตรวจสอบ หรือถ้าสิทธิ์ไม่ตรง
  if (!auth || auth.role !== allowedRole) {
    return null;
  }

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

        {/* Private Routes (ครอบด้วย MainLayout ทั้งหมด) */}
        <Route
          path="/"
          element={
            <PrivateRoute auth={auth}>
              <MainLayout user={auth} onLogout={handleLogout} />
            </PrivateRoute>
          }
        >
          {/* Default redirect จาก / ไป /home */}
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home user={auth} />} />

          {/* === ADMIN ROUTES === */}
          <Route
            path="admin/users"
            element={
              <RoleProtectedRoute auth={auth} allowedRole="ADMIN">
                <UserManage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="admin/evaluations"
            element={
              <RoleProtectedRoute auth={auth} allowedRole="ADMIN">
                <EvaluationList />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="admin/evaluations/:id"
            element={
              <RoleProtectedRoute auth={auth} allowedRole="ADMIN">
                <EvaluationDetail />
              </RoleProtectedRoute>
            }
          />

          {/* === EVALUATOR ROUTES === */}
          <Route
            path="evaluator/evaluations"
            element={
              <RoleProtectedRoute auth={auth} allowedRole="EVALUATOR">
                <EvaluatorTasks />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="evaluator/evaluations/:id"
            element={
              <RoleProtectedRoute auth={auth} allowedRole="EVALUATOR">
                <EvaluatorPairList />
              </RoleProtectedRoute>
            }
          />
          {/* เปลี่ยนตรงนี้จาก :id เป็น :assignmentId เพื่อให้ตรงกับโค้ดเก่าของคุณ */}
          <Route
            path="evaluator/assignment/:assignmentId"
            element={
              <RoleProtectedRoute auth={auth} allowedRole="EVALUATOR">
                <AssessmentForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="evaluator/assignment/:assignmentId/result"
            element={
              <RoleProtectedRoute auth={auth} allowedRole="EVALUATOR">
                <EvaluatorResult />
              </RoleProtectedRoute>
            }
          />

          {/* === EVALUATEE ROUTES === */}
          <Route
            path="me/evaluations"
            element={
              <RoleProtectedRoute auth={auth} allowedRole="EVALUATEE">
                <MyEvaluations />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="me/evaluations/:id"
            element={
              <RoleProtectedRoute auth={auth} allowedRole="EVALUATEE">
                <MyEvaluationDetail />
              </RoleProtectedRoute>
            }
          />
        </Route>

        {/* Catch all (หน้าไหนไม่ตรงเงื่อนไขเลย) */}
        <Route
          path="*"
          element={<Navigate to={auth ? "/home" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
