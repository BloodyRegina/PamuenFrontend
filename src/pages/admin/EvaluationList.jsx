import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Edit, Trash2, FileText, Check, X } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../utils/axios";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import InputField from "../../components/common/InputField";

const EvaluationList = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [users, setUsers] = useState([]); // เพิ่ม State สำหรับเก็บรายชื่อผู้ใช้ทั้งหมด
  const [loading, setLoading] = useState(true);

  // Modal State สำหรับการเพิ่ม
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Inline Form State สำหรับการแก้ไข
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // โหลดข้อมูลแบบประเมินและรายชื่อผู้ใช้งานพร้อมกัน
      const [evalsRes, usersRes] = await Promise.all([
        api.get("/admin/evaluations"),
        api.get("/admin/users").catch(() => ({ data: { data: [] } })) // ถ้าดึง user พลาดให้คืนค่าอาเรย์ว่าง
      ]);
      
      setEvaluations(evalsRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (error) {
      Swal.fire({
        title: "ข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลได้",
        icon: "error",
        confirmButtonColor: "#c084fc",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ฟังก์ชันแปลง ID ผู้สร้างให้เป็นชื่อ
  const getCreatorName = (item) => {
    // กรณี 1: ถ้า Backend ส่งมาเป็น Object ที่มี name อยู่แล้ว
    if (item.creator?.name) return item.creator.name;
    if (item.createdBy?.name) return item.createdBy.name;
    
    // กรณี 2: ถ้า Backend ส่งมาเป็นแค่ ID (String) ให้เอาไปเทียบใน users array
    if (typeof item.createdBy === 'string') {
      const foundUser = users.find(u => u.id === item.createdBy);
      if (foundUser) return foundUser.name;
    }
    
    return "-";
  };

  // --- ฟังก์ชันสำหรับการเพิ่ม (Modal) ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/evaluations", formData);
      Swal.fire({
        title: "สำเร็จ",
        text: "เพิ่มการประเมินเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonColor: "#c084fc",
      });
      setIsModalOpen(false);
      setFormData({ name: "", startDate: "", endDate: "" });
      fetchData(); // ดึงข้อมูลใหม่เพื่ออัปเดตตาราง
    } catch (error) {
      Swal.fire({
        title: "ล้มเหลว",
        text: error.response?.data?.message || "ไม่สามารถเพิ่มข้อมูลได้",
        icon: "error",
        confirmButtonColor: "#c084fc",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --- ฟังก์ชันสำหรับการลบ (ลบด้วย SweetAlert Confirm) ---
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบแบบประเมินนี้ใช่หรือไม่? ข้อมูลที่เกี่ยวข้องจะถูกลบทั้งหมด",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899", // สีชมพู
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "ยืนยันการลบ",
      cancelButtonText: "ยกเลิก"
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/evaluations/${id}`);
        Swal.fire({
          title: "สำเร็จ",
          text: "ลบแบบประเมินเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonColor: "#c084fc",
        });
        fetchData(); 
      } catch (error) {
        Swal.fire({
          title: "ข้อผิดพลาด",
          text: "ไม่สามารถลบแบบประเมินได้",
          icon: "error",
          confirmButtonColor: "#c084fc",
        });
      }
    }
  };

  // --- ฟังก์ชันสำหรับการแก้ไข (Inline Edit) ---
  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditFormData({
      name: item.name,
      startDate: new Date(item.startDate).toISOString().split('T')[0],
      endDate: new Date(item.endDate).toISOString().split('T')[0],
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/admin/evaluations/${id}`, editFormData);
      Swal.fire({
        title: "สำเร็จ",
        text: "แก้ไขการประเมินเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonColor: "#c084fc",
      });
      setEditingId(null);
      fetchData(); 
    } catch (error) {
      Swal.fire({
        title: "ล้มเหลว",
        text: error.response?.data?.message || "ไม่สามารถแก้ไขข้อมูลได้",
        icon: "error",
        confirmButtonColor: "#c084fc",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-fuchsia-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายการแบบประเมิน</h1>
          <p className="text-sm text-slate-500 mt-1">จัดการกำหนดการและรอบการประเมินทั้งหมด</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          เพิ่มการประเมิน
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-fuchsia-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : (
          <Table
            headers={[
              "ลำดับที่",
              "ชื่อแบบประเมิน",
              "วันที่สร้าง",
              "วันเปิด",
              "วันปิดประเมิน",
              "ชื่อผู้สร้าง",
              "Action"
            ]}
            headerClassName="bg-fuchsia-50"
            data={evaluations}
            renderRow={(item, idx) => {
              const isEditing = editingId === item.id;
              const creatorName = getCreatorName(item); // ดึงชื่อผู้สร้างตรงนี้

              if (isEditing) {
                // --- โหมดแก้ไข (Inline Form) ---
                return (
                  <tr key={item.id} className="bg-fuchsia-50/50">
                    <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        className="w-full px-3 py-1.5 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500 text-sm"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="date"
                        className="w-full px-3 py-1.5 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500 text-sm"
                        value={editFormData.startDate}
                        onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="date"
                        className="w-full px-3 py-1.5 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500 text-sm"
                        value={editFormData.endDate}
                        onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                      />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {creatorName}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <button onClick={() => handleSaveEdit(item.id)} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors" title="บันทึก">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={handleCancelEdit} className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors" title="ยกเลิก">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              }

              // --- โหมดแสดงผลปกติ ---
              return (
                <tr key={item.id} className="hover:bg-purple-50 border-b border-fuchsia-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4 text-purple-600 font-medium">
                    {new Date(item.startDate).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4 text-fuchsia-600 font-medium">
                    {new Date(item.endDate).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {creatorName}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/admin/evaluations/${item.id}`)}
                      className="p-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors flex items-center text-xs font-medium"
                    >
                      <FileText className="w-4 h-4 mr-1" /> รายละเอียด
                    </button>
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="p-1.5 text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 rounded transition-colors"
                      title="แก้ไข"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-pink-600 bg-pink-50 hover:bg-pink-100 rounded transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            }}
          />
        )}
      </div>

      {/* Modal เพิ่มการประเมิน */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-fuchsia-100 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-fuchsia-100 bg-fuchsia-50/50">
              <h3 className="text-xl font-bold text-slate-800">สร้างแบบประเมินใหม่</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <InputField 
                label="ชื่อแบบประเมิน" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
                className="border-purple-300 focus:ring-purple-500 focus:border-purple-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-medium text-slate-700">วันเปิดประเมิน</label>
                  <input 
                    type="date" 
                    required 
                    className="px-4 py-2 border border-purple-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    value={formData.startDate} 
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-medium text-slate-700">วันปิดประเมิน</label>
                  <input 
                    type="date" 
                    required 
                    className="px-4 py-2 border border-fuchsia-300 rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500"
                    value={formData.endDate} 
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-fuchsia-100 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-slate-300 hover:bg-slate-50">
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationList;