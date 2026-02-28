import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

const EvaluatorPairList = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  // ข้อมูลจำลอง (Mock Data) สำหรับรอเชื่อมต่อ Backend
  const evaluationInfo = {
    name: "การประเมินผลการปฏิบัติงาน ไตรมาส 1/2567",
    period: "1 ม.ค. 2567 - 31 มี.ค. 2567"
  };

  const evaluatees = [
    {
      assignmentId: 1,
      name: "สมชาย ใจดี",
      progress: { current: 5, total: 10 },
      status: "PENDING" // ยังไม่เสร็จ
    },
    {
      assignmentId: 2,
      name: "สมหญิง รักงาน",
      progress: { current: 10, total: 10 },
      status: "COMPLETED" // เสร็จสิ้นแล้ว
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ส่วนหัวแสดงข้อมูลการประเมิน */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{evaluationInfo.name}</h1>
        <p className="text-slate-600">รอบการประเมิน: {evaluationInfo.period}</p>
      </div>

      {/* ตารางรายชื่อผู้รับการประเมิน */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <th className="p-4 w-16 text-center">ลำดับ</th>
              <th className="p-4">ชื่อผู้รับการประเมิน</th>
              <th className="p-4 w-64">ความคืบหน้า</th>
              <th className="p-4 w-48 text-center">สถานะการประเมิน</th>
            </tr>
          </thead>
          <tbody>
            {evaluatees.map((person, index) => (
              <tr key={person.assignmentId} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-center">{index + 1}</td>
                <td className="p-4 font-medium text-slate-800">{person.name}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${person.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${(person.progress.current / person.progress.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-600 whitespace-nowrap">
                      {person.progress.current} / {person.progress.total}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  {person.status === "COMPLETED" ? (
                    <button 
                      onClick={() => navigate(`/evaluator/assignment/${person.assignmentId}/result`)}
                      className="inline-flex items-center justify-center text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                    >
                      <span className="mr-1">✓</span> ประเมินเสร็จสิ้น
                    </button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/evaluator/assignment/${person.assignmentId}`)}
                    >
                      เริ่มการประเมิน
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EvaluatorPairList;