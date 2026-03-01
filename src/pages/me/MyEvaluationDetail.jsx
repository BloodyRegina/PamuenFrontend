import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import Button from "../../components/common/Button";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Upload,
  FileCheck,
  CheckCircle,
  BarChart3,
  ListTodo,
} from "lucide-react";

const MyEvaluationDetail = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [evidences, setEvidences] = useState([]);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get("/me/evaluations");
        const found = res.data.data.find((a) => a.id === assignmentId);
        if (!found) {
          Swal.fire("ไม่พบข้อมูล", "ไม่พบการประเมินที่คุณต้องการ", "error");
          navigate("/me/evaluations");
          return;
        }
        setAssignment(found);

        // <-- 2. เพิ่มการดึงข้อมูลไฟล์หลักฐานที่เคยอัปโหลดไว้แล้ว
        const evRes = await api.get("/me/evidence");
        if (evRes.data && evRes.data.data) {
          setEvidences(evRes.data.data);
        }
      } catch (error) {
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลได้", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [assignmentId, navigate]);

  const handleFileUpload = async (indicatorId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("document", file);
    formData.append("indicatorId", indicatorId);

    try {
      setUploading(true);
      await api.post("/me/evidence", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("สำเร็จ", "อัปโหลดไฟล์หลักฐานเรียบร้อยแล้ว", "success");
      window.location.reload();
    } catch (error) {
      const status = error.response?.status;
      if (status === 409) {
        Swal.fire("ล้มเหลว", "คุณได้แนบหลักฐานสำหรับตัวชี้วัดนี้ไปแล้ว", "error");
      } else if (status === 413) {
        Swal.fire("ล้มเหลว", "ขนาดไฟล์เกิน 10MB", "error");
      } else if (status === 415) {
        Swal.fire("ล้มเหลว", "ไม่อนุญาตให้อัปโหลดไฟล์ .exe", "error");
      } else {
        Swal.fire(
          "ล้มเหลว",
          error.response?.data?.message || "ไม่สามารถอัปโหลดไฟล์ได้",
          "error",
        );
      }
    } finally {
      setUploading(false);
    }
  };
  const handleDeleteEvidence = async (evidenceId) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบไฟล์?",
      text: "ระบบจะลบไฟล์หลักฐานนี้ออกจากระบบ",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899",
      confirmButtonText: "ลบไฟล์",
    });

    if (confirm.isConfirmed) {
      try {
        setUploading(true);
        await api.delete(`/me/evidence/${evidenceId}`);
        Swal.fire("สำเร็จ", "ลบไฟล์หลักฐานเรียบร้อยแล้ว", "success");
        window.location.reload(); // รีเฟรชหน้าเพื่ออัปเดตข้อมูลล่าสุด
      } catch (error) {
        Swal.fire("ล้มเหลว", "ไม่สามารถลบไฟล์ได้", "error");
      } finally {
        setUploading(false);
      }
    }
  };
  // --- ฟังก์ชันดึงรายงานจาก Backend ---
  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/evaluation/${assignment.evaluationId}/result`);
      // Since it's EVALUATEE, filteredAssignments contains only 1 assignment
      const data = res.data.data;
      if (data && data.length > 0) {
        setReportData(data[0]);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        Swal.fire("ยังไม่สามารถดูได้", "การประเมินยังไม่เสร็จสมบูรณ์ ยังไม่สามารถดูผลคะแนนได้", "info");
        setActiveTab("details");
      } else {
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูลผลการประเมินได้", "error");
        setActiveTab("details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "results" && assignment && assignment.status === "COMPLETED") {
      fetchReport();
    }
  }, [activeTab]);

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
    );
  if (!assignment) return null;

  const isCompleted = assignment.status === "COMPLETED"; // เช็กว่าประเมินเสร็จหรือยัง

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> กลับไปหน้ารายการ
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">
          {assignment.evaluation?.name}
        </h1>
        <p className="text-slate-500 mt-1">
          ผู้ประเมินของคุณคือ:{" "}
          <span className="font-semibold text-blue-600">
            {assignment.evaluator?.name}
          </span>
        </p>
        <div className="mt-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${isCompleted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
          >
            {isCompleted ? "ประเมินเสร็จสิ้นแล้ว" : "อยู่ระหว่างรอการประเมิน"}
          </span>
        </div>
      </div>

      {/* ระบบ Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("details")}
          className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "details" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <ListTodo className="w-4 h-4 mr-2" /> รายละเอียดและแนบไฟล์
        </button>
        <button
          onClick={() => {
            if (isCompleted) { 
              setActiveTab("results");
            } else {
              Swal.fire(
                "ยังไม่สามารถดูได้",
                'การประเมินยังไม่เสร็จสมบูรณ์ ยังไม่สามารถดูผลคะแนนได้',
                "info",
              );
            }
          }}
          className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "results" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"} ${!isCompleted && "opacity-50 cursor-not-allowed"}`}
        >
          <BarChart3 className="w-4 h-4 mr-2" /> ผลการประเมิน
        </button>
      </div>

      {/* แท็บ 1: รายละเอียดและแนบไฟล์ */}
      {activeTab === "details" && (
        <div className="space-y-4 animate-fadeIn">
          <h2 className="text-lg font-bold text-slate-800 px-2">
            ตัวชี้วัดและหลักฐานที่ต้องแนบ
          </h2>
          {assignment.evaluation?.topics?.map((topic) => (
            <div
              key={topic.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="bg-slate-50 p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">{topic.name}</h3>
              </div>
              <div className="p-4 space-y-4">
                {topic.indicators?.map((ind) => (
                  <div
                    key={ind.id}
                    className="p-4 border border-slate-100 rounded-xl bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div>
                      <div className="font-medium text-slate-700">
                        {ind.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        ค่าน้ำหนัก: {ind.weight}% | ประเภท:{" "}
                        {ind.indicatorType === "SCALE_1_4"
                          ? "ระดับ 1-4"
                          : "ใช่/ไม่ใช่"}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {ind.requireEvidence ? (
                        (() => {
                          // เช็กว่าตัวชี้วัดข้อนี้ มีไฟล์ที่อัปโหลดไว้แล้วหรือไม่
                          const uploadedFile = evidences?.find(
                            (e) => e.indicatorId === ind.id,
                          );

                          if (uploadedFile) {
                            // 🟢 สร้าง URL สำหรับเปิดไฟล์ (ตัด /api ออกจาก Base URL)
                            const baseUrl = api.defaults.baseURL.replace(
                              "/api",
                              "",
                            );
                            const fileUrl = `${baseUrl}/uploads/${uploadedFile.filename}`;

                            // ถ้ามีไฟล์แล้ว -> แสดงปุ่มดูไฟล์ และ ลบไฟล์
                            return (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center font-medium border border-green-200">
                                  <FileCheck className="w-4 h-4 mr-2" />
                                  แนบไฟล์แล้ว
                                </span>

                                {/* 🟢 เพิ่มปุ่ม "ดูไฟล์" ตรงนี้ */}
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center"
                                >
                                  ดูไฟล์แนบ
                                </a>

                                {!isCompleted && (
                                  <button
                                    onClick={() =>
                                      handleDeleteEvidence(uploadedFile.id)
                                    }
                                    disabled={uploading}
                                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                  >
                                    ลบไฟล์
                                  </button>
                                )}
                              </div>
                            );
                          } else {
                            // ถ้ายังไม่มีไฟล์ -> แสดงปุ่มอัปโหลดแบบเดิม
                            return (
                              <label
                                className={`flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer transition-colors text-sm font-medium ${
                                  uploading
                                    ? "bg-purple-100 text-purple-400"
                                    : "bg-white text-purple-600 border-purple-300 hover:bg-purple-50"
                                }`}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                อัปโหลดไฟล์หลักฐาน
                                <input
                                  type="file"
                                  className="hidden"
                                  disabled={uploading || isCompleted}
                                  onChange={(e) =>
                                    handleFileUpload(ind.id, e.target.files[0])
                                  }
                                  accept=".pdf,.jpg,.png"
                                />
                              </label>
                            );
                          }
                        })()
                      ) : (
                        <span className="text-xs text-purple-400 bg-purple-50 px-3 py-1.5 rounded-lg flex items-center">
                          <FileCheck className="w-3 h-3 mr-1" />{" "}
                          ไม่ต้องแนบหลักฐาน
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* แท็บ 2: ผลการประเมิน (โชว์คะแนนรวม + Progress Bar) */}
      {activeTab === "results" && isCompleted && reportData && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
            <h2 className="text-lg font-bold text-slate-600 mb-2">
              คะแนนการประเมินของคุณ
            </h2>
            <div className="text-5xl font-black text-blue-600 mb-4">
              {reportData.totalAdjustedScore}{" "}
              <span className="text-2xl text-slate-400">
                / 100%
              </span>
            </div>

            {/* Progress Bar ตาม Spec */}
            <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                style={{
                  width: `${reportData.totalAdjustedScore}%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-slate-500">
              ผ่านการคำนวณน้ำหนักตามเกณฑ์มาตรฐานแล้ว
            </p>
          </div>

          {/* แสดงรายละเอียดคะแนนรายข้อ */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-800">
              รายละเอียดคะแนนรายข้อ
            </div>
            <div className="p-4 space-y-4">
              {reportData.results && (() => {
                // Group results by topic
                const topicsMap = {};
                reportData.results.forEach(res => {
                  if(!topicsMap[res.topicName]) topicsMap[res.topicName] = [];
                  topicsMap[res.topicName].push(res);
                });
                
                return Object.keys(topicsMap).map(topicName => (
                  <div key={topicName} className="space-y-2">
                    <h4 className="font-semibold text-slate-700 border-b pb-1">
                      {topicName}
                    </h4>
                    {topicsMap[topicName].map((ind) => {
                      return (
                        <div
                          key={ind.id}
                          className="flex justify-between items-center text-sm py-2 px-2 hover:bg-slate-50 rounded"
                        >
                          <div className="text-slate-600 flex-1 pr-4">
                            {ind.indicatorName}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-slate-800">
                              {ind.adjustedScore.toFixed(2)} %
                            </div>
                            <div className="text-xs text-slate-400">
                              (จาก {ind.weight}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvaluationDetail;
