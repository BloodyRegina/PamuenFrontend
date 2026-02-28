import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import Button from '../../components/common/Button';
import Swal from 'sweetalert2';
import { Save, ArrowLeft } from 'lucide-react';

const AssessmentForm = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [assignment, setAssignment] = useState(null);
    const [responses, setResponses] = useState({}); 

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/evaluator/assignments/${assignmentId}`);
                setAssignment(res.data.data);
                
                const initialResponses = {};
                res.data.data.indicatorResults?.forEach(r => {
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
    }, [assignmentId, navigate]);

    const handleScoreChange = (indicatorId, score) => {
        setResponses(prev => ({ ...prev, [indicatorId]: score }));
    };

    const handleSubmit = async () => {
        try {
            // นับจำนวนข้อที่ "พร้อมให้คะแนน" (ไม่ติดล็อก)
            let scorableIndicators = 0;
            assignment.evaluation?.topics?.forEach(t => {
                t.indicators?.forEach(ind => {
                    const hasEvidence = !ind.requireEvidence || assignment?.evaluatee?.evidences?.some(e => e.indicatorId === ind.id);
                    if (hasEvidence) scorableIndicators++;
                });
            });

            if (Object.keys(responses).length < scorableIndicators) {
                const confirm = await Swal.fire({
                    title: 'ยังประเมินไม่ครบ',
                    text: 'คุณยังให้คะแนนไม่ครบทุกข้อ (ที่สามารถให้คะแนนได้) ต้องการบันทึกฉบับร่างไว้ก่อนหรือไม่?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'บันทึกฉบับร่าง',
                    cancelButtonText: 'กลับไปทำต่อ'
                });
                if (!confirm.isConfirmed) return;
            }

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
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-purple-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> กลับ
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800">แบบประเมินผลการปฏิบัติงาน</h1>
                <p className="text-slate-500 mt-1">ผู้ถูกประเมิน: <span className="text-purple-600 font-semibold">{assignment?.evaluatee?.name}</span></p>
            </div>

            {assignment?.evaluation?.topics?.map(topic => (
                <div key={topic.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">{topic.name}</h3>
                        <p className="text-sm text-slate-500">{topic.description}</p>
                    </div>
                    <div className="p-4 space-y-6">
                        {topic.indicators?.map(ind => {
                            // ✅ ลอจิกสำคัญ: เช็กว่าข้อนี้บังคับแนบไฟล์ไหม แล้วผู้ถูกประเมินอัปโหลดไฟล์มาหรือยัง?
                            const hasEvidence = !ind.requireEvidence || assignment?.evaluatee?.evidences?.some(e => e.indicatorId === ind.id);
                            const isMissingEvidence = ind.requireEvidence && !hasEvidence;

                            return (
                                <div key={ind.id} className="space-y-3 p-4 border border-slate-50 rounded-xl bg-slate-50/30">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <label className="text-sm font-medium text-slate-700">{ind.name}</label>
                                            {ind.requireEvidence && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">
                                                    *ต้องมีหลักฐาน
                                                </span>
                                            )}
                                            {isMissingEvidence && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                                    ⏳ รอผู้รับการประเมินแนบหลักฐาน
                                                </span>
                                            )}
                                            {ind.requireEvidence && hasEvidence && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    ✓ มีหลักฐานแล้ว
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">น้ำหนัก: {ind.weight}%</span>
                                    </div>
                                    
                                    {ind.indicatorType === 'Scale 1-4' ? (
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4].map(score => (
                                                <button
                                                    key={score}
                                                    disabled={isMissingEvidence}
                                                    onClick={() => handleScoreChange(ind.id, score)}
                                                    className={`flex-1 py-2 rounded-lg border transition-all font-medium ${
                                                        isMissingEvidence 
                                                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                                            : responses[ind.id] === score 
                                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                                                                : 'bg-white text-slate-500 border-slate-200 hover:border-purple-600 hover:text-purple-600'
                                                    }`}
                                                >
                                                    ระดับ {score}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            {[ {label: 'ไม่ใช่/ไม่มี', value: 0}, {label: 'ใช่/มี', value: 1} ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    disabled={isMissingEvidence}
                                                    onClick={() => handleScoreChange(ind.id, opt.value)}
                                                    className={`flex-1 py-2 rounded-lg border transition-all font-medium ${
                                                        isMissingEvidence 
                                                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                                            : responses[ind.id] === opt.value 
                                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                                                                : 'bg-white text-slate-500 border-slate-200 hover:border-purple-600 hover:text-purple-600'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="flex justify-end pt-4">
                <Button onClick={handleSubmit} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white">
                    <Save className="w-5 h-5 mr-2" /> บันทึกผลการประเมิน
                </Button>
            </div>
        </div>
    );
};

export default AssessmentForm;