import React, { useState, useEffect } from "react";
import api from "../../utils/axios";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

const MyEvaluations = () => {
  const [myEvaluations, setMyEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchMyEvaluations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/me/evaluations");
      // Data structure from backend: { evaluation: {...}, evaluator: {...}, status, ... }
      setMyEvaluations(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch my evaluations", error);
      Swal.fire(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถดึงข้อมูลการประเมินของคุณได้",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvaluations();
  }, []);

  const tableHeaders = [
    "รอบการประเมิน",
    "ผู้ประเมิน (Evaluator)",
    "วันที่เริ่มต้น - สิ้นสุด",
    "สถานะ",
    "จัดการ",
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            การประเมินของฉัน
          </h1>
          <p className="text-slate-500 mt-1">
            ดูรายการที่คุณต้องรับการประเมินและแนบไฟล์หลักฐาน
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex items-center justify-center h-full">
            กำลังโหลดข้อมูลการประเมิน...
          </div>
        ) : (
          <Table
            headers={tableHeaders}
            data={myEvaluations}
            renderRow={(assignment, idx) => (
              <tr
                key={assignment.id || idx}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  {assignment.evaluation?.name || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {assignment.evaluator?.name || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(
                    assignment.evaluation?.startDate,
                  ).toLocaleDateString("th-TH")}{" "}
                  -{" "}
                  {new Date(assignment.evaluation?.endDate).toLocaleDateString(
                    "th-TH",
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      assignment.status === "COMPLETED" ? "success" : "warning"
                    }
                  >
                    {assignment.status === "COMPLETED"
                      ? "ประเมินแล้ว"
                      : "รอการประเมิน"}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/me/evaluations/${assignment.id}`)}
                  >
                    ดูรายละเอียด / แนบไฟล์
                  </Button>
                </td>
              </tr>
            )}
          />
        )}
        {!loading && myEvaluations.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            ยังไม่มีรอบการประเมินที่ถูกมอบหมายให้คุณ
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvaluations;
