import React from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

const EvaluatorResult = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  // ข้อมูลจำลอง (Mock Data)
  const resultData = {
    evaluationName: "การประเมินผลการปฏิบัติงาน ไตรมาส 1/2567",
    evaluateeName: "สมหญิง รักงาน",
    totalScorePercent: 85,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ส่วนหัว */}
      <div className="flex items-center gap-4 mb-6">
         <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          &larr; กลับ
        </Button>
        <h1 className="text-2xl font-bold text-slate-800">ผลการประเมิน</h1>
      </div>

      {/* สรุปข้อมูล */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-1">{resultData.evaluationName}</h2>
        <p className="text-slate-600 mb-4">ผู้รับการประเมิน: <span className="font-medium text-slate-800">{resultData.evaluateeName}</span></p>
        
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-medium text-slate-700">คะแนนรวมทั้งหมด</span>
            <span className="text-lg font-bold text-primary">{resultData.totalScorePercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full" 
              style={{ width: `${resultData.totalScorePercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ส่วนตารางตัวชี้วัด (ทำโครงร่างไว้ให้พัฒนาต่อตามสเปก) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">รายละเอียดผลการประเมิน</h3>
        <p className="text-sm text-slate-500 italic mb-4">** ส่วนตารางตัวชี้วัดแยกตามหัวข้อ รอรับข้อมูลจาก Backend **</p>
        
        {/* ตัวอย่างโครงสร้างตารางหัวข้อ */}
        <div className="mb-6">
          <h4 className="font-semibold text-slate-700 mb-2">หัวข้อ: ความรับผิดชอบต่อหน้าที่</h4>
          <table className="w-full text-left border-collapse border border-slate-200 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th className="border p-2 w-12 text-center">ลำดับ</th>
                <th className="border p-2">ชื่อตัวชี้วัด</th>
                <th className="border p-2 w-32 text-center">ประเภท</th>
                <th className="border p-2 w-20 text-center">น้ำหนัก</th>
                <th className="border p-2 w-24 text-center">คะแนนที่ได้</th>
                <th className="border p-2 w-24 text-center">คิดเป็น %</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 text-center">1</td>
                <td className="border p-2">ส่งงานตรงเวลา</td>
                <td className="border p-2 text-center"><Badge variant="primary">ระดับ 1-4</Badge></td>
                <td className="border p-2 text-center">50</td>
                <td className="border p-2 text-center">4</td>
                <td className="border p-2 text-center">50%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorResult;