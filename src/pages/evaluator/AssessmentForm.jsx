import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import Button from '../../components/common/Button';
import Swal from 'sweetalert2';
// เพิ่มนำเข้าไอคอน FileText
import { Save, ArrowLeft, BarChart3, CheckCircle, FileText } from 'lucide-react';

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

    // --- ฟังก์ชันคำนวณคะแนนรวม ---
    const calculateResults = () => {
        let totalEarned = 0;
        let totalWeight = 0;

        assignment?.evaluation?.topics?.forEach(topic => {
            topic.indicators?.forEach(ind => {
                totalWeight += ind.weight;
                const result = assignment.indicatorResults?.find(r => r.indicatorId === ind.id) || { score: responses[ind.id] };
                
                if (result && result.score !== undefined) {
                    if (ind.indicatorType === 'SCALE_1_4') {
                        totalEarned += (result.score / 4) * ind.weight;
                    } else if (ind.indicatorType === 'YES_NO') {
                        totalEarned += result.score * ind.weight;
                    }
                }
            });
        });

        return { earned: totalEarned.toFixed(2), total: totalWeight };
    };

    if (loading) return <div className="p-8 text-center">กำลังโหลดแบบประเมิน...</div>;

    const isCompleted = assignment?.status === 'COMPLETED';
    const scoreData = isCompleted ? calculateResults() : null;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-purple-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> กลับไปหน้ารายการ
            </button>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">แบบประเมินผลการปฏิบัติงาน</h1>
                    <p className="text-slate-500 mt-1">ผู้ถูกประเมิน: <span className="text-purple-600 font-semibold">{assignment?.evaluatee?.name}</span></p>
                </div>
                {isCompleted && (
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl flex items-center font-semibold">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        ประเมินเสร็จสิ้น
                    </div>
                )}
            </div>

            {/* แสดงการ์ดผลคะแนน ถ้าประเมินเสร็จแล้ว */}
            {isCompleted && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-purple-100 text-center animate-fadeIn">
                    <div className="flex justify-center mb-4 text-purple-600"><BarChart3 className="w-12 h-12" /></div>
                    <h2 className="text-lg font-bold text-slate-600 mb-2">สรุปผลคะแนนที่ประเมิน</h2>
                    <div className="text-5xl font-black text-purple-600 mb-4">{scoreData.earned} <span className="text-2xl text-slate-400">/ {scoreData.total}%</span></div>
                    <div className="w-full max-w-md mx-auto bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
                        <div className="bg-purple-600 h-4 rounded-full transition-all duration-1000" style={{ width: `${(scoreData.earned / scoreData.total) * 100}%` }}></div>
                    </div>
                </div>
            )}

            {assignment?.evaluation?.topics?.map(topic => (
                <div key={topic.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">{topic.name}</h3>
                        <p className="text-sm text-slate-500">{topic.description}</p>
                    </div>
                    <div className="p-4 space-y-6">
                        {topic.indicators?.map(ind => {
                            // 🟢 ดึงข้อมูล object ของไฟล์หลักฐานออกมา
                            const evidence = assignment?.evaluatee?.evidences?.find(e => e.indicatorId === ind.id);
                            const hasEvidence = !ind.requireEvidence || !!evidence;
                            const isMissingEvidence = ind.requireEvidence && !evidence;

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
                                            
                                            {isMissingEvidence && !isCompleted && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                                    ⏳ รอผู้รับการประเมินแนบหลักฐาน
                                                </span>
                                            )}

                                            {/* 🟢 ปุ่มดูไฟล์หลักฐาน (แสดงเฉพาะข้อที่บังคับแนบและมีไฟล์แล้ว) */}
                                            {ind.requireEvidence && evidence && (
                                                <div className="mt-2 block">
                                                    <a
                                                        href={`${api.defaults.baseURL.replace('/api', '')}/uploads/${evidence.filename}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors"
                                                    >
                                                        <FileText className="w-3 h-3 mr-1.5" />
                                                        คลิกดูไฟล์หลักฐาน
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded shrink-0">น้ำหนัก: {ind.weight}%</span>
                                    </div>
                                    
                                    {ind.indicatorType === 'SCALE_1_4' ? (
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4].map(score => (
                                                <button
                                                    key={score}
                                                    disabled={isMissingEvidence || isCompleted} 
                                                    onClick={() => handleScoreChange(ind.id, score)}
                                                    className={`flex-1 py-2 rounded-lg border transition-all font-medium ${
                                                        (isMissingEvidence && !isCompleted)
                                                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                                            : responses[ind.id] === score 
                                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                                                                : isCompleted 
                                                                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
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
                                                    disabled={isMissingEvidence || isCompleted} 
                                                    onClick={() => handleScoreChange(ind.id, opt.value)}
                                                    className={`flex-1 py-2 rounded-lg border transition-all font-medium ${
                                                        (isMissingEvidence && !isCompleted)
                                                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                                            : responses[ind.id] === opt.value 
                                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                                                                : isCompleted 
                                                                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
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
            
            {!isCompleted && (
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSubmit} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white">
                        <Save className="w-5 h-5 mr-2" /> บันทึกผลการประเมิน
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AssessmentForm;