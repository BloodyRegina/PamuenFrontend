import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import Button from '../../components/common/Button';
import Swal from 'sweetalert2';
import { Save, ArrowLeft, Info } from 'lucide-react';

const AssessmentForm = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [assignment, setAssignment] = useState(null);
    const [responses, setResponses] = useState({}); // เก็บค่าคะแนน { indicatorId: score }

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // ดึงรายละเอียดการจับคู่และหัวข้อประเมิน
                const res = await api.get(`/evaluator/assignments/${assignmentId}`);
                setAssignment(res.data.data);
                
                // เตรียม State สำหรับเก็บคำตอบ (ถ้าเคยทำค้างไว้)
                const initialResponses = {};
                res.data.data.results?.forEach(r => {
                    initialResponses[r.indicatorId] = r.score;
                });
                setResponses(initialResponses);
            } catch (error) {
                Swal.fire('Error', 'ไม่สามารถโหลดแบบประเมินได้', 'error');
                navigate('/evaluator/evaluations');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [assignmentId]);

    const handleScoreChange = (indicatorId, score) => {
        setResponses(prev => ({ ...prev, [indicatorId]: score }));
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                assignmentId,
                scores: Object.keys(responses).map(id => ({
                    indicatorId: id,
                    score: Number(responses[id])
                }))
            };

            await api.post('/evaluator/results', payload);
            await Swal.fire('สำเร็จ!', 'บันทึกผลการประเมินเรียบร้อยแล้ว', 'success');
            navigate('/evaluator/evaluations');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'บันทึกไม่สำเร็จ', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center">กำลังโหลดแบบประเมิน...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> กลับ
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800">แบบประเมินผลการปฏิบัติงาน</h1>
                <p className="text-slate-500 mt-1">ผู้ถูกประเมิน: <span className="text-primary font-semibold">{assignment?.evaluatee?.name}</span></p>
            </div>

            {assignment?.evaluation?.topics?.map(topic => (
                <div key={topic.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">{topic.name}</h3>
                        <p className="text-sm text-slate-500">{topic.description}</p>
                    </div>
                    <div className="p-4 space-y-6">
                        {topic.indicators?.map(ind => (
                            <div key={ind.id} className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <label className="text-sm font-medium text-slate-700">{ind.name}</label>
                                    <span className="text-xs text-slate-400">ค่าน้ำหนัก: {ind.weight}%</span>
                                </div>
                                
                                {ind.indicatorType === 'SCALE' ? (
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(score => (
                                            <button
                                                key={score}
                                                onClick={() => handleScoreChange(ind.id, score)}
                                                className={`flex-1 py-2 rounded-lg border transition-all ${responses[ind.id] === score 
                                                    ? 'bg-primary text-white border-primary shadow-md' 
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-primary'}`}
                                            >
                                                {score}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        {[ {l: 'ไม่ใช่/ไม่มี', v: 0}, {l: 'ใช่/มี', v: 5} ].map(opt => (
                                            <button
                                                key={opt.v}
                                                onClick={() => handleScoreChange(ind.id, opt.v)}
                                                className={`flex-1 py-2 rounded-lg border transition-all ${responses[ind.id] === opt.v 
                                                    ? 'bg-primary text-white border-primary shadow-md' 
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-primary'}`}
                                            >
                                                {opt.l}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-end pt-4">
                <Button onClick={handleSubmit} className="px-8">
                    <Save className="w-4 h-4 mr-2" /> บันทึกการประเมิน
                </Button>
            </div>
        </div>
    );
};

export default AssessmentForm;