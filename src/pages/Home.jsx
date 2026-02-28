import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios"; 
import Swal from "sweetalert2";

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/me/dashboard");
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถดึงข้อมูล Dashboard ได้",
          confirmButtonColor: "#c084fc" // ปรับสีปุ่ม Alert ให้เข้าธีมม่วง
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-purple-400 font-sans">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-purple-900 mb-6">Dashboard</h1>
      
      {/* การแสดงผลสำหรับ ADMIN */}
      {role === "ADMIN" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => navigate("/admin/evaluations")}
            className="bg-white border-l-4 border-purple-500 shadow-sm rounded-lg p-6 cursor-pointer hover:shadow-md hover:bg-purple-50 transition duration-300"
          >
            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">การประเมินทั้งหมด</h2>
            <p className="text-4xl font-bold text-purple-800 mt-2">{stats.totalEvaluations || 0}</p>
            <p className="text-xs text-purple-300 mt-2">คลิกเพื่อจัดการการประเมิน</p>
          </div>

          <div className="bg-white border-l-4 border-pink-400 shadow-sm rounded-lg p-6">
            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">จำนวนผู้ประเมิน (Evaluator)</h2>
            <p className="text-4xl font-bold text-pink-600 mt-2">{stats.totalEvaluators || 0}</p>
            <p className="text-xs text-pink-300 mt-2">คน</p>
          </div>

          <div className="bg-white border-l-4 border-purple-300 shadow-sm rounded-lg p-6">
            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">จำนวนผู้รับการประเมิน (Evaluatee)</h2>
            <p className="text-4xl font-bold text-purple-600 mt-2">{stats.totalEvaluatees || 0}</p>
            <p className="text-xs text-purple-300 mt-2">คน</p>
          </div>
        </div>
      )}

      {/* การแสดงผลสำหรับ EVALUATOR */}
      {role === "EVALUATOR" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => navigate("/evaluator/evaluations")}
            className="bg-white border-l-4 border-pink-500 shadow-sm rounded-lg p-6 cursor-pointer hover:shadow-md hover:bg-pink-50 transition duration-300"
          >
            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">งานประเมินที่ได้รับมอบหมาย</h2>
            <p className="text-4xl font-bold text-pink-700 mt-2">{stats.totalAssignments || 0}</p>
            <p className="text-xs text-pink-300 mt-2">คลิกเพื่อเริ่มการประเมิน</p>
          </div>
        </div>
      )}

      {/* การแสดงผลสำหรับ EVALUATEE */}
      {role === "EVALUATEE" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => navigate("/me/evaluations")}
            className="bg-white border-l-4 border-purple-500 shadow-sm rounded-lg p-6 cursor-pointer hover:shadow-md hover:bg-purple-50 transition duration-300"
          >
            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">รายการประเมินของฉัน</h2>
            <p className="text-4xl font-bold text-purple-800 mt-2">{stats.totalEvaluations || 0}</p>
            <p className="text-xs text-purple-300 mt-2">คลิกเพื่อดูรายละเอียดผลประเมิน</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;