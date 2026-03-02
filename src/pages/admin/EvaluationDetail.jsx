import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PlusCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckSquare,
  Target,
  BarChart3,
  X,
  Trash2,
  Edit
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../utils/axios";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";
import IndicatorTypeBadge from "../../components/common/IndicatorTypeBadge";

const EvaluationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("topics");

  const [evaluation, setEvaluation] = useState(null);
  const [topics, setTopics] = useState([]);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [modalState, setModalState] = useState({ open: false, type: null }); 
  const [inlineIndicatorFormTopicId, setInlineIndicatorFormTopicId] = useState(null); 

  const [topicForm, setTopicForm] = useState({ id: null, name: "", description: "" });
  const [indicatorForm, setIndicatorForm] = useState({
    description: "",
    indicatorType: "SCALE_1_4",
    requireEvidence: false,
    weight: "",
  });
  const [assignmentForm, setAssignmentForm] = useState({
    evaluatorId: "",
    evaluateeId: "",
  });

  const getComputedStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    if (now < start) return "Draft";
    if (now >= start && now <= end) return "Active";
    if (now > end) return "Completed";
    return "Unknown";
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const evalsResponse = await api.get("/admin/evaluations");
      const foundEval = evalsResponse.data.data.find((e) => e.id === id);

      if (!foundEval) {
        Swal.fire("Not Found", "ไม่พบข้อมูลการประเมิน", "error");
        navigate("/admin/evaluations");
        return;
      }
      setEvaluation(foundEval);

      const topicsRes = await api.get(`/admin/topics?evaluationId=${id}`);
      const tData = topicsRes.data.data || [];
      const exMap = {};
      tData.forEach((t) => (exMap[t.id] = true));

      setExpandedTopics((prev) => ({ ...exMap, ...prev })); 
      setTopics(tData);

      const assignsRes = await api.get(`/admin/assignments?evaluationId=${id}`);
      setAssignments(assignsRes.data.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Fetch Error", "ไม่สามารถดึงข้อมูลได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadUsersForAssignments = async () => {
    if (allUsers.length > 0) return;
    try {
      setLoadingUsers(true);
      const res = await api.get("/admin/users");
      setAllUsers(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (activeTab === "assignments") {
      loadUsersForAssignments();
    } else if (activeTab === "results") {
      loadReportsForResults();
    }
  }, [activeTab]);

  const loadReportsForResults = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/evaluation/${id}/result`);
      setReportData(res.data.data || []);
    } catch (e) {
      console.error(e);
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลรายงานได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const openModal = (type, data = null) => {
    setModalState({ open: true, type });
    if (type === "topic" && data) {
      setTopicForm({ id: data.id, name: data.name, description: data.description });
    } else {
      setTopicForm({ id: null, name: "", description: "" });
      setAssignmentForm({ evaluatorId: "", evaluateeId: "" });
    }
  };

  const closeModal = () => setModalState({ open: false, type: null });

  const openInlineIndicatorForm = (topicId, data = null) => {
    setInlineIndicatorFormTopicId(topicId);
    if (data) {
      setIndicatorForm({
        id: data.id,
        name: data.name,
        description: data.description,
        indicatorType: data.indicatorType,
        requireEvidence: data.requireEvidence,
        weight: data.weight,
      });
    } else {
      setIndicatorForm({
        id: null,
        name: "",
        description: "",
        indicatorType: "SCALE_1_4",
        requireEvidence: false,
        weight: "",
      });
    }
    setExpandedTopics((prev) => ({ ...prev, [topicId]: true }));
  };

  const closeInlineIndicatorForm = () => {
    setInlineIndicatorFormTopicId(null);
  };

  // --- API Handlers (เชื่อมต่อ Backend) ---
  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (topicForm.id) {
        await api.put(`/admin/topics/${topicForm.id}`, topicForm);
        Swal.fire("สำเร็จ", "แก้ไขหัวข้อเรียบร้อย", "success");
      } else {
        await api.post("/admin/topics", { evaluationId: id, ...topicForm });
        Swal.fire("สำเร็จ", "สร้างหัวข้อเรียบร้อย", "success");
      }
      closeModal();
      loadData();
    } catch (err) {
      Swal.fire("ข้อผิดพลาด", err.response?.data?.message || "ไม่สามารถบันทึกได้", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบหัวข้อนี้ (ตัวชี้วัดภายในจะถูกลบทั้งหมด)?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899", // สีชมพูอ่อน
      confirmButtonText: "ลบข้อมูล"
    });
    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/topics/${topicId}`);
        Swal.fire("สำเร็จ", "ลบหัวข้อแล้ว", "success");
        loadData();
      } catch (err) {
        Swal.fire("ข้อผิดพลาด", "ไม่สามารถลบหัวข้อได้", "error");
      }
    }
  };

  const handleIndicatorSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        topicId: inlineIndicatorFormTopicId,
        name: indicatorForm.name,
        description: indicatorForm.description,
        indicatorType: indicatorForm.indicatorType,
        requireEvidence: indicatorForm.requireEvidence,
        weight: parseFloat(indicatorForm.weight),
      };

      if (indicatorForm.id) {
        await api.put(`/admin/indicators/${indicatorForm.id}`, payload);
        Swal.fire("สำเร็จ", "แก้ไขตัวชี้วัดเรียบร้อย", "success");
      } else {
        await api.post("/admin/indicators", payload);
        Swal.fire("สำเร็จ", "เพิ่มตัวชี้วัดเรียบร้อย", "success");
      }
      closeInlineIndicatorForm();
      loadData();
    } catch (err) {
      Swal.fire("ข้อผิดพลาด", err.response?.data?.message || "น้ำหนักรวมอาจเกิน 100% หรือข้อมูลไม่ถูกต้อง", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIndicator = async (indicatorId) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบตัวชี้วัดนี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899", 
      confirmButtonText: "ลบข้อมูล"
    });
    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/indicators/${indicatorId}`);
        Swal.fire("สำเร็จ", "ลบตัวชี้วัดแล้ว", "success");
        loadData();
      } catch (err) {
        Swal.fire("ข้อผิดพลาด", "ไม่สามารถลบตัวชี้วัดได้", "error");
      }
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/assignments", {
        evaluationId: id,
        evaluatorId: assignmentForm.evaluatorId,
        evaluateeId: assignmentForm.evaluateeId,
      });
      Swal.fire("สำเร็จ", "จับคู่การประเมินเรียบร้อย", "success");
      closeModal();
      loadData();
    } catch (err) {
      if (err.response?.status === 409) {
        Swal.fire("ไม่สามารถจับคู่ได้", "ไม่สามารถมอบหมายได้ เนื่องจากมีการมอบหมายผู้ประเมินรายนี้ให้บุคลากรคนนี้ไปแล้ว", "error");
      } else {
        Swal.fire("ข้อผิดพลาด", err.response?.data?.message || "ไม่สามารถจับคู่ได้", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    const confirm = await Swal.fire({
      title: "ยกเลิกการจับคู่?",
      text: "คุณต้องการลบข้อมูลการจับคู่นี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899", 
      confirmButtonText: "ลบข้อมูล"
    });
    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/assignments/${assignmentId}`);
        Swal.fire("สำเร็จ", "ลบการจับคู่แล้ว", "success");
        loadData();
      } catch (err) {
        Swal.fire("ข้อผิดพลาด", "ไม่สามารถลบการจับคู่ได้", "error");
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-purple-400">Loading evaluation configuration...</div>;
  if (!evaluation) return null;

  const compStatus = getComputedStatus(evaluation.startDate, evaluation.endDate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans bg-white min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        <div className="relative z-10">
          <button onClick={() => navigate("/admin/evaluations")} className="flex items-center text-sm font-medium text-purple-400 hover:text-purple-600 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Evaluations
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-purple-900">{evaluation.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-purple-500">
                <span className="flex items-center"><span className="font-semibold mr-1">Start:</span>{new Date(evaluation.startDate).toLocaleDateString()}</span>
                <span className="flex items-center"><span className="font-semibold mr-1">End:</span>{new Date(evaluation.endDate).toLocaleDateString()}</span>
                <Badge variant={compStatus === "Active" ? "success" : compStatus === "Draft" ? "warning" : "default"} className="ml-2">
                  {compStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-purple-100 overflow-x-auto pb-1">
        <button onClick={() => setActiveTab("topics")} className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === "topics" ? "border-purple-600 text-purple-600" : "border-transparent text-purple-400 hover:text-purple-600"}`}>
          <Target className="w-4 h-4 mr-2" /> หัวข้อและตัวชี้วัด
        </button>
        <button onClick={() => setActiveTab("assignments")} className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === "assignments" ? "border-purple-600 text-purple-600" : "border-transparent text-purple-400 hover:text-purple-600"}`}>
          <CheckSquare className="w-4 h-4 mr-2" /> การจับคู่ประเมิน
        </button>
        <button onClick={() => setActiveTab("results")} className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === "results" ? "border-purple-600 text-purple-600" : "border-transparent text-purple-400 hover:text-purple-600"}`}>
          <BarChart3 className="w-4 h-4 mr-2" /> ผลการประเมิน
        </button>
      </div>

      {activeTab === "topics" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal("topic")} className="bg-purple-600 hover:bg-purple-700 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              สร้างหัวข้อ (Topic)
            </Button>
          </div>

          {topics.length === 0 ? (
            <div className="bg-white rounded-xl border border-purple-100 p-8 text-center text-purple-400 italic shadow-sm w-full">
              ยังไม่มีหัวข้อ เริ่มสร้างหัวข้อการประเมินได้เลย
            </div>
          ) : (
            <div className="space-y-6">
              {topics.map((topic) => (
                <div key={topic.id} className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden transition-all">
                  <div className="flex justify-between items-center p-4 bg-purple-50/50 hover:bg-purple-50 cursor-pointer">
                    <div className="flex items-center gap-3" onClick={() => toggleTopic(topic.id)}>
                      <div className={`p-1 rounded-md transition-colors ${expandedTopics[topic.id] ? "text-purple-600" : "text-purple-400"}`}>
                        {expandedTopics[topic.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-purple-900 text-lg">{topic.name}</h3>
                        <p className="text-sm text-purple-500">{topic.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-white text-purple-600 border-purple-200">{topic.indicators?.length || 0} ตัวชี้วัด</Badge>
                      <button onClick={(e) => { e.stopPropagation(); openModal("topic", topic); }} className="text-purple-400 hover:text-purple-600 p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.id); }} className="text-pink-400 hover:text-pink-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {expandedTopics[topic.id] && (
                    <div className="p-4 border-t border-purple-50 bg-white space-y-4">
                      <div className="flex justify-between items-center pl-8 mb-2">
                        <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">รายการตัวชี้วัด</h4>
                        {inlineIndicatorFormTopicId !== topic.id && (
                          <Button variant="outline" size="sm" onClick={() => openInlineIndicatorForm(topic.id)} className="text-purple-600 border-purple-200 hover:bg-purple-50">
                            <PlusCircle className="w-3 h-3 mr-1" /> Add Indicator
                          </Button>
                        )}
                      </div>

                      {!topic.indicators || topic.indicators.length === 0 ? (
                        <div className="text-sm text-purple-300 italic pl-8 pb-2">ยังไม่มีตัวชี้วัดในหัวข้อนี้</div>
                      ) : (
                        <div className="space-y-2 pl-8">
                          {topic.indicators.map((ind) => (
                            <div key={ind.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-purple-50 bg-white shadow-sm">
                              <div className="flex flex-col">
                                <span className="font-medium text-purple-800 text-sm flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-purple-500" /> {ind.name}
                                </span>
                                <span className="text-xs text-purple-400 mt-1 pl-6">{ind.description}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2 sm:mt-0 text-xs shrink-0 pl-6 sm:pl-0">
                                <IndicatorTypeBadge type={ind.indicatorType} />
                                <span className="px-2 py-1 bg-purple-50 rounded text-purple-600">Weight: {ind.weight}%</span>
                                {ind.requireEvidence && <span className="text-pink-500 bg-pink-50 px-2 py-1 rounded flex items-center"><FileText className="w-3 h-3 mr-1" /> Evidence</span>}
                                <button onClick={() => openInlineIndicatorForm(topic.id, ind)} className="text-purple-400 hover:text-purple-600"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteIndicator(ind.id)} className="text-pink-400 hover:text-pink-600"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {inlineIndicatorFormTopicId === topic.id && (
                        <div className="ml-8 mt-4 p-5 bg-purple-50 rounded-xl relative">
                          <button onClick={closeInlineIndicatorForm} className="absolute top-4 right-4 text-purple-400 hover:text-purple-600"><X className="w-4 h-4" /></button>
                          <h5 className="font-semibold text-purple-700 mb-4 text-sm flex items-center"><PlusCircle className="w-4 h-4 mr-1" /> {indicatorForm.id ? "แก้ไขตัวชี้วัด" : "สร้างตัวชี้วัดใหม่"}</h5>
                          <form onSubmit={handleIndicatorSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="ชื่อตัวชี้วัด" value={indicatorForm.name} onChange={(e) => setIndicatorForm({ ...indicatorForm, name: e.target.value })} required />
                              <InputField label="รายละเอียด" value={indicatorForm.description} onChange={(e) => setIndicatorForm({ ...indicatorForm, description: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                              <div className="flex flex-col gap-1 w-full">
                                <label className="text-sm font-medium text-purple-700">ประเภท <span className="text-pink-500">*</span></label>
                                <select required className="px-4 py-2 border rounded-lg" value={indicatorForm.indicatorType} onChange={(e) => setIndicatorForm({ ...indicatorForm, indicatorType: e.target.value })}>
                                  <option value="SCALE_1_4">ระดับ (1-4)</option>
                                  <option value="YES_NO">ใช่/ไม่ใช่</option>
                                </select>
                              </div>
                              <InputField label="น้ำหนัก (%)" type="number" min="0" max="100" value={indicatorForm.weight} onChange={(e) => setIndicatorForm({ ...indicatorForm, weight: e.target.value })} required />
                              <div className="flex items-center gap-3 h-[42px] px-4 bg-white border rounded-lg">
                                <input type="checkbox" id={`reqEv-${topic.id}`} checked={indicatorForm.requireEvidence} onChange={(e) => setIndicatorForm({ ...indicatorForm, requireEvidence: e.target.checked })} className="w-4 h-4 text-purple-600" />
                                <label htmlFor={`reqEv-${topic.id}`} className="text-sm font-medium text-purple-700 cursor-pointer select-none">บังคับแนบหลักฐาน</label>
                              </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-3">
                              <Button type="button" variant="outline" size="sm" onClick={closeInlineIndicatorForm}>ยกเลิก</Button>
                              <Button type="submit" size="sm" disabled={submitting} className="bg-purple-600 text-white">{submitting ? "กำลังบันทึก..." : "บันทึก"}</Button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* แท็บ Assignments และ Results ใช้โครงสร้างเดิมของคุณ แต่เปลี่ยนปุ่ม Delete เป็น handleDeleteAssignment */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openModal("assignment")} className="bg-purple-600 hover:bg-purple-700 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              จับคู่ผู้ประเมิน
            </Button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
            <Table
              headers={["Evaluator (ผู้ประเมิน)", "Evaluatee (ผู้ถูกประเมิน)", "Action"]}
              data={assignments}
              renderRow={(assignment, idx) => (
                <tr key={assignment.id || idx} className="hover:bg-purple-50 transition-colors border-b border-purple-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-purple-900">{assignment.evaluator?.name || "Unknown"}</div>
                    <div className="text-xs text-purple-500 mt-1">{assignment.evaluator?.role}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-purple-900">{assignment.evaluatee?.name || "Unknown"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDeleteAssignment(assignment.id)} className="text-pink-500 hover:text-pink-700 flex items-center bg-pink-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                      <Trash2 className="w-4 h-4 mr-1" /> ลบ
                    </button>
                  </td>
                </tr>
              )}
            />
          </div>
        </div>
      )}
      {/* แท็บ Results: แสดงผลคะแนนของผู้ถูกประเมิน */}
      {activeTab === "results" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-purple-900">สรุปผลคะแนนการประเมิน</h2>
              <p className="text-sm text-purple-500 mt-1">
                แสดงคะแนนรวมของผู้ถูกประเมินทั้งหมด (คำนวณจากค่าน้ำหนักตัวชี้วัด)
              </p>
            </div>
            <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
              <span className="text-sm text-purple-700 font-medium">
                จำนวนผู้ถูกประเมิน: <span className="font-bold text-purple-900">{assignments.length}</span> คน
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
            {reportData.length === 0 ? (
              <div className="p-8 text-center text-purple-400 italic">
                ยังไม่มีข้อมูลผลการประเมินที่พร้อมแสดง
              </div>
            ) : (
              <Table
                headers={["ผู้ถูกประเมิน", "ผู้ประเมิน", "สถานะ", "คะแนนรวม (%)"]}
                headerClassName="bg-purple-50 text-purple-800"
                data={reportData}
                renderRow={(assignment, idx) => {
                  const isCompleted = assignment.status === "COMPLETED";

                  return (
                    <tr key={assignment.assignmentId || idx} className="hover:bg-purple-50/50 border-b border-purple-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-purple-900">
                          {assignment.evaluatee?.name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-purple-600">
                          {assignment.evaluator?.name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={isCompleted ? "success" : "warning"}
                          className={isCompleted ? "bg-green-100 text-green-700 border border-green-200" : "bg-yellow-100 text-yellow-700 border border-yellow-200"}
                        >
                          {isCompleted ? "ประเมินเสร็จสิ้น" : "รอประเมิน"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <div className="text-sm font-black text-purple-700 bg-purple-100 inline-block px-3 py-1 rounded-md">
                            {assignment.totalAdjustedScore.toFixed(2)} <span className="text-xs text-purple-500 font-medium">/ 100%</span>
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-slate-400">
                            ยังไม่สามารถคำนวณได้
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Modal สำหรับสร้าง/แก้ไข Topic และ Assignment */}
      {modalState.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-purple-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-purple-100 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-purple-50">
              <h3 className="text-xl font-bold text-purple-900">{modalState.type === "topic" ? (topicForm.id ? "แก้ไขหัวข้อ" : "สร้างหัวข้อใหม่") : "จับคู่การประเมิน"}</h3>
              <button onClick={closeModal} className="text-purple-400 hover:bg-purple-50 p-1 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              {modalState.type === "topic" && (
                <form id="topicForm" onSubmit={handleTopicSubmit} className="space-y-4">
                  <InputField label="ชื่อหัวข้อ" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} required />
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-medium text-purple-700">คำอธิบาย</label>
                    <textarea required className="px-4 py-2 border rounded-lg focus:ring-purple-500" value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} />
                  </div>
                </form>
              )}
              {modalState.type === "assignment" && (
                <form id="assignmentForm" onSubmit={handleAssignmentSubmit} className="space-y-4">
                  <select required className="px-4 py-2 w-full border rounded-lg" value={assignmentForm.evaluatorId} onChange={(e) => setAssignmentForm({ ...assignmentForm, evaluatorId: e.target.value })}>
                    <option value="" disabled>เลือกผู้ประเมิน...</option>
                    {allUsers.filter((u) => u.role === "ADMIN" || u.role === "EVALUATOR").map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
                  </select>
                  <select required className="px-4 py-2 w-full border rounded-lg" value={assignmentForm.evaluateeId} onChange={(e) => setAssignmentForm({ ...assignmentForm, evaluateeId: e.target.value })}>
                    <option value="" disabled>เลือกผู้ถูกประเมิน...</option>
                    {allUsers.filter((u) => u.role !== "ADMIN").map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
                  </select>
                </form>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-purple-50 bg-purple-50/50 rounded-b-2xl">
              <Button type="button" variant="outline" onClick={closeModal}>ยกเลิก</Button>
              <Button type="submit" form={modalState.type + "Form"} disabled={submitting} className="bg-purple-600 text-white">บันทึกข้อมูล</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationDetail;