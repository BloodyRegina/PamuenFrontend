import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import Button from '../../components/common/Button';
import Swal from 'sweetalert2';
import { ArrowLeft, Upload, FileCheck } from 'lucide-react';

const MyEvaluationDetail = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // ดึงข้อมูลการประเมินทั้งหมดของฉัน
                const res = await api.get('/me/evaluations');
                // หาเฉพาะอันที่ตรงกับ URL Parameter
                const found = res.data.data.find(a => a.id === assignmentId);
                if (!found) {
                    Swal.fire('ไม่พบข้อมูล', 'ไม่พบการประเมินที่คุณต้องการ', 'error');
                    navigate('/me/evaluations');
                    return;
                }
                setAssignment(found);
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [assignmentId, navigate]);

    const handleFileUpload = async (indicatorId, file) => {
        if (!file) return;
        
        const formData = new FormData();
        formData.append('document', file);
        formData.append('indicatorId', indicatorId);

        try {
            setUploading(true);
            await api.post('/me/evidence', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Swal.fire('สำเร็จ', 'อัปโหลดไฟล์หลักฐานเรียบร้อยแล้ว', 'success');
            // รีโหลดข้อมูลเพื่ออัปเดตสถานะ
            window.location.reload(); 
        } catch (error) {
            Swal.fire('ล้มเหลว', error.response?.data?.message || 'ไม่สามารถอัปโหลดไฟล์ได้', 'error');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;
    if (!assignment) return null;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> กลับไปหน้ารายการ
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800">{assignment.evaluation?.name}</h1>
                <p className="text-slate-500 mt-1">ผู้ประเมินของคุณคือ: <span className="font-semibold">{assignment.evaluator?.name}</span></p>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 px-2">ตัวชี้วัดและหลักฐานที่ต้องแนบ</h2>
                
                {assignment.evaluation?.topics?.map(topic => (
                    <div key={topic.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">{topic.name}</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {topic.indicators?.map(ind => (
                                <div key={ind.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="font-medium text-slate-700">{ind.name}</div>
                                        <div className="text-xs text-slate-500 mt-1">{ind.description}</div>
                                    </div>
                                    
                                    <div className="shrink-0 w-full sm:w-auto">
                                        {ind.requireEvidence ? (
                                            <div className="flex items-center gap-2">
                                                <label className={`flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer transition-colors text-sm font-medium ${uploading ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'}`}>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    อัปโหลดไฟล์
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        disabled={uploading}
                                                        onChange={(e) => handleFileUpload(ind.id, e.target.files[0])}
                                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    />
                                                </label>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center">
                                                <FileCheck className="w-3 h-3 mr-1" /> ไม่ต้องแนบหลักฐาน
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!topic.indicators || topic.indicators.length === 0) && (
                                <p className="text-sm text-slate-400 italic">ไม่มีตัวชี้วัดในหัวข้อนี้</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyEvaluationDetail;