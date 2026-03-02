import React, { useState, useEffect } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import api from "../../utils/axios";
import IndicatorTypeBadge from "../../components/common/IndicatorTypeBadge";

const EvaluatorResult = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [evaluationName, setEvaluationName] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // 1. Fetch assignment details to get evaluationId
        const assignRes = await api.get(`/evaluator/assignments/${assignmentId}`);
        const evaluationId = assignRes.data.data.evaluationId;
        setEvaluationName(assignRes.data.data.evaluation?.name || "การประเมินผล");

        // 2. Fetch reports for that evaluation
        const reportRes = await api.get(`/reports/evaluation/${evaluationId}/result`);
        const reports = reportRes.data.data;

        // 3. Find the report for this specific assignment
        const currentReport = reports.find(r => r.assignmentId === assignmentId);
        
        if (currentReport) {
          setReportData(currentReport);
        } else {
          setReportData(null);
        }
      } catch (error) {
        console.error("Failed to fetch evaluator results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [assignmentId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;
  }

  if (!reportData) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-xl mb-4">ไม่พบข้อมูลผลการประเมิน</h2>
        <Button onClick={() => navigate(-1)}>กลับ</Button>
      </div>
    );
  }

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
        <h2 className="text-xl font-semibold text-slate-800 mb-1">{evaluationName}</h2>
        <p className="text-slate-600 mb-4">ผู้รับการประเมิน: <span className="font-medium text-slate-800">{reportData.evaluatee?.name || "ไม่ทราบชื่อ"}</span></p>
        
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-medium text-slate-700">คะแนนรวมทั้งหมด</span>
            <span className="text-lg font-bold text-primary">{reportData.totalAdjustedScore}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full" 
              style={{ width: `${reportData.totalAdjustedScore}%`, backgroundColor: '#4f46e5' }}
            ></div>
          </div>
        </div>
      </div>

      {/* ส่วนตารางตัวชี้วัด */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">รายละเอียดผลการประเมิน</h3>
        
        {(() => {
          // Group by topic
          const topicsMap = {};
          reportData.results.forEach(res => {
            if(!topicsMap[res.topicName]) topicsMap[res.topicName] = [];
            topicsMap[res.topicName].push(res);
          });

          return Object.keys(topicsMap).map(topicName => (
            <div key={topicName} className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-2">หัวข้อ: {topicName}</h4>
              <table className="w-full text-left border-collapse border border-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="border p-2 w-12 text-center">ลำดับ</th>
                    <th className="border p-2">ชื่อตัวชี้วัด</th>
                    <th className="border p-2 w-32 text-center">ประเภท</th>
                    <th className="border p-2 w-20 text-center">น้ำหนัก</th>
                    <th className="border p-2 w-24 text-center">คะแนนดิบ</th>
                    <th className="border p-2 w-24 text-center">คิดเป็น %</th>
                  </tr>
                </thead>
                <tbody>
                  {topicsMap[topicName].map((ind, idx) => (
                    <tr key={ind.id}>
                      <td className="border p-2 text-center">{idx + 1}</td>
                      <td className="border p-2">{ind.indicatorName}</td>
                      <td className="border p-2 text-center">
                        <IndicatorTypeBadge type={ind.indicatorType} />
                      </td>
                      <td className="border p-2 text-center">{ind.weight}</td>
                      <td className="border p-2 text-center">{ind.rawScore}</td>
                      <td className="border p-2 text-center font-semibold text-primary">{ind.adjustedScore.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ));
        })()}
        
      </div>
    </div>
  );
};

export default EvaluatorResult;