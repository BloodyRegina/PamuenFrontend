import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, CheckCircle2, ChevronDown, ChevronRight, FileText, CheckSquare, Target, BarChart3, X } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../utils/axios';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';

const EvaluationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('topics');

    // Data States
    const [evaluation, setEvaluation] = useState(null);
    const [topics, setTopics] = useState([]);
    const [expandedTopics, setExpandedTopics] = useState({});
    const [assignments, setAssignments] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // Loading States
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Modal & Inline States
    const [modalState, setModalState] = useState({ open: false, type: null }); // type: 'topic', 'assignment'
    const [inlineIndicatorFormTopicId, setInlineIndicatorFormTopicId] = useState(null); // Tracks which topic has the open inline form

    // Form Payloads
    const [topicForm, setTopicForm] = useState({ name: '', description: '' });
    const [indicatorForm, setIndicatorForm] = useState({ name: '', description: '', indicatorType: 'SCALE', requireEvidence: false, weight: '' });
    const [assignmentForm, setAssignmentForm] = useState({ evaluatorId: '', evaluateeId: '' });
    const [submitting, setSubmitting] = useState(false);

    // Computed Status logic
    const getComputedStatus = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        if (now < start) return 'Draft';
        if (now >= start && now <= end) return 'Active';
        if (now > end) return 'Completed';
        return 'Unknown';
    };

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Evaluation Details
            const evalsResponse = await api.get('/admin/evaluations');
            const foundEval = evalsResponse.data.data.find(e => e.id === id);

            if (!foundEval) {
                Swal.fire('Not Found', 'Evaluation period does not exist.', 'error');
                navigate('/admin/evaluations');
                return;
            }
            setEvaluation(foundEval);

            // 2. Fetch Topics & nested Indicators
            const topicsRes = await api.get(`/admin/topics?evaluationId=${id}`);
            // Auto expand all topics mapping by default
            const tData = topicsRes.data.data || [];
            const exMap = {};
            tData.forEach(t => exMap[t.id] = true);

            setExpandedTopics(prev => ({ ...exMap, ...prev })); // Merge so we don't collapse already open ones
            setTopics(tData);

            // 3. Fetch Assignments
            const assignsRes = await api.get(`/admin/assignments?evaluationId=${id}`);
            setAssignments(assignsRes.data.data || []);

        } catch (error) {
            console.error(error);
            Swal.fire('Fetch Error', 'Could not load detail data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadUsersForAssignments = async () => {
        if (allUsers.length > 0) return;
        try {
            setLoadingUsers(true);
            const res = await api.get('/admin/users');
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
        if (activeTab === 'assignments') {
            loadUsersForAssignments();
        }
    }, [activeTab]);

    const toggleTopic = (topicId) => {
        setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    };

    const openModal = (type) => {
        setModalState({ open: true, type });
        setTopicForm({ name: '', description: '' });
        setAssignmentForm({ evaluatorId: '', evaluateeId: '' });
    };

    const closeModal = () => setModalState({ open: false, type: null });

    // Open inline form per topic
    const openInlineIndicatorForm = (topicId) => {
        setInlineIndicatorFormTopicId(topicId);
        setIndicatorForm({ name: '', description: '', indicatorType: 'SCALE', requireEvidence: false, weight: '' });
        // Ensure topic is expanded when form opens
        setExpandedTopics(prev => ({ ...prev, [topicId]: true }));
    };

    const closeInlineIndicatorForm = () => {
        setInlineIndicatorFormTopicId(null);
    };

    // Submits
    const handleTopicSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/admin/topics', {
                evaluationId: id,
                name: topicForm.name,
                description: topicForm.description
            });
            Swal.fire('Success', 'Topic created.', 'success');
            closeModal();
            loadData();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Topic creation failed.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleIndicatorSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/admin/indicators', {
                topicId: inlineIndicatorFormTopicId,
                name: indicatorForm.name,
                description: indicatorForm.description,
                indicatorType: indicatorForm.indicatorType,
                requireEvidence: indicatorForm.requireEvidence,
                weight: parseFloat(indicatorForm.weight)
            });
            Swal.fire('Success', 'Indicator added.', 'success');
            closeInlineIndicatorForm();
            loadData();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Indicator creation failed.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/admin/assignments', {
                evaluationId: id,
                evaluatorId: assignmentForm.evaluatorId,
                evaluateeId: assignmentForm.evaluateeId
            });
            Swal.fire('Success', 'Assignment matched successfully.', 'success');
            closeModal();
            loadData();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Assignment failed.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading evaluation configuration...</div>;
    if (!evaluation) return null;

    const compStatus = getComputedStatus(evaluation.startDate, evaluation.endDate);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Top Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <div className="relative z-10">
                    <button
                        onClick={() => navigate('/admin/evaluations')}
                        className="flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Evaluations
                    </button>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">{evaluation.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
                                <span className="flex items-center">
                                    <span className="font-semibold mr-1">Start:</span>
                                    {new Date(evaluation.startDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                    <span className="font-semibold mr-1">End:</span>
                                    {new Date(evaluation.endDate).toLocaleDateString()}
                                </span>
                                <Badge variant={compStatus === 'Active' ? 'success' : compStatus === 'Draft' ? 'warning' : 'default'} className="ml-2">
                                    {compStatus}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modern Tabs UI (Phase 8 updated) */}
            <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-1">
                <button
                    onClick={() => setActiveTab('topics')}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'topics'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    <Target className="w-4 h-4 mr-2" />
                    Topics & Indicators (หัวข้อและตัวชี้วัด)
                </button>
                <button
                    onClick={() => setActiveTab('assignments')}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'assignments'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Assignments (การจับคู่ประเมิน)
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'results'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Results (ผลการประเมิน)
                </button>
            </div>

            {/* Tab 1 Content: Topics & Indicators */}
            {activeTab === 'topics' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => openModal('topic')}>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Create Topic
                        </Button>
                    </div>

                    {topics.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-500 italic shadow-sm w-full">
                            No topics created yet. Start by defining evaluation sections.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {topics.map(topic => (
                                <div key={topic.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all">
                                    {/* Topic Header (Collapsible) */}
                                    <div
                                        className="flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                                        onClick={() => toggleTopic(topic.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1 rounded-md transition-colors ${expandedTopics[topic.id] ? 'bg-primary/10 text-primary' : 'text-slate-400'}`}>
                                                {expandedTopics[topic.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">{topic.name}</h3>
                                                <p className="text-sm text-slate-500">{topic.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="secondary">{topic.indicators?.length || 0} Indicators</Badge>
                                        </div>
                                    </div>

                                    {/* Context Dropper Content */}
                                    {expandedTopics[topic.id] && (
                                        <div className="p-4 border-t border-slate-100 bg-white space-y-4">

                                            {/* Top Checklist Info */}
                                            <div className="flex justify-between items-center pl-8 mb-2">
                                                <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Indicators Checklist</h4>

                                                {/* Button to toggle inline form */}
                                                {inlineIndicatorFormTopicId !== topic.id && (
                                                    <Button variant="outline" size="sm" onClick={() => openInlineIndicatorForm(topic.id)}>
                                                        <PlusCircle className="w-3 h-3 mr-1" />
                                                        Add Indicator
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Existing Indicators map */}
                                            {(!topic.indicators || topic.indicators.length === 0) ? (
                                                <div className="text-sm text-slate-400 italic pl-8 pb-2">No indicators mapped to this topic yet.</div>
                                            ) : (
                                                <div className="space-y-2 pl-8">
                                                    {topic.indicators.map(ind => (
                                                        <div key={ind.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-slate-800 text-sm flex items-center gap-2">
                                                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                                                    {ind.name}
                                                                </span>
                                                                <span className="text-xs text-slate-500 mt-1 pl-6">{ind.description}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-2 sm:mt-0 text-xs shrink-0 pl-6 sm:pl-0 border-t sm:border-0 pt-2 sm:pt-0 border-slate-200">
                                                                <span className="px-2 py-1 bg-white border border-slate-200 rounded font-medium text-slate-600">
                                                                    Type: <span className="text-primary">{ind.indicatorType}</span>
                                                                </span>
                                                                <span className="px-2 py-1 bg-white border border-slate-200 rounded font-medium text-slate-600">
                                                                    Weight: {ind.weight}%
                                                                </span>
                                                                {ind.requireEvidence && (
                                                                    <span className="text-rose-500 flex items-center font-medium bg-rose-50 px-2 py-1 rounded">
                                                                        <FileText className="w-3 h-3 mr-1" />
                                                                        Proofs
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* INLINE INDICATOR FORM BUILDER (Appears securely inside the Topic bounding box) */}
                                            {inlineIndicatorFormTopicId === topic.id && (
                                                <div className="ml-8 mt-4 p-5 bg-primary-light/5 border border-primary-light/20 rounded-xl relative">
                                                    <button onClick={closeInlineIndicatorForm} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-white p-1 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                                                    <h5 className="font-semibold text-primary mb-4 text-sm flex items-center"><PlusCircle className="w-4 h-4 mr-1" /> Configure New Indicator</h5>

                                                    <form onSubmit={handleIndicatorSubmit} className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <InputField label="Indicator Name" value={indicatorForm.name} onChange={e => setIndicatorForm({ ...indicatorForm, name: e.target.value })} required />
                                                            <InputField label="Description" value={indicatorForm.description} onChange={e => setIndicatorForm({ ...indicatorForm, description: e.target.value })} required />
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                                                            <div className="flex flex-col gap-1 w-full">
                                                                <label className="text-sm font-medium text-slate-700">Evaluation Logic Type <span className="text-rose-500">*</span></label>
                                                                <select required className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                                    value={indicatorForm.indicatorType} onChange={e => setIndicatorForm({ ...indicatorForm, indicatorType: e.target.value })}>
                                                                    <option value="SCALE">Scale Rating (1-5)</option>
                                                                    <option value="YES_NO">Boolean (Yes_No)</option>
                                                                </select>
                                                            </div>

                                                            <InputField label="Weight Impact (%)" type="number" min="0" max="100" value={indicatorForm.weight} onChange={e => setIndicatorForm({ ...indicatorForm, weight: e.target.value })} required />

                                                            <div className="flex items-center gap-3 h-[42px] px-4 bg-white border border-slate-200 rounded-lg shrink-0">
                                                                <input type="checkbox" id={`reqEv-${topic.id}`} checked={indicatorForm.requireEvidence} onChange={e => setIndicatorForm({ ...indicatorForm, requireEvidence: e.target.checked })} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                                                                <label htmlFor={`reqEv-${topic.id}`} className="text-sm font-medium text-slate-700 cursor-pointer select-none">Require Documentation Proof</label>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end gap-3 pt-3 border-t border-primary-light/20 mt-2">
                                                            <Button type="button" variant="outline" size="sm" onClick={closeInlineIndicatorForm} className="bg-white">Cancel</Button>
                                                            <Button type="submit" size="sm" disabled={submitting}>
                                                                {submitting ? 'Saving...' : 'Save Indicator'}
                                                            </Button>
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

            {/* Tab 2 Content: Assignments */}
            {activeTab === 'assignments' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => openModal('assignment')}>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Assign Evaluator
                        </Button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <Table
                            headers={["Evaluator (ผู้ประเมิน)", "Evaluatee (ผู้ถูกประเมิน)", "Action"]}
                            data={assignments}
                            renderRow={(assignment, idx) => (
                                <tr key={assignment.id || idx} className="hover:bg-slate-50 transition-colors border-b border-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-slate-800">{assignment.evaluator?.name || 'Unknown'}</div>
                                        <div className="text-xs text-slate-500 mt-1 flex items-center">
                                            <Badge variant="secondary" className="mr-2 px-1.5 py-0.5 text-[10px]">{assignment.evaluator?.role || 'N/A'}</Badge>
                                            {assignment.evaluator?.empId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-slate-800">{assignment.evaluatee?.name || 'Unknown'}</div>
                                        <div className="text-xs text-slate-500 mt-1">{assignment.evaluatee?.empId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="danger" size="sm" onClick={() => Swal.fire('Notice', 'Delete endpoint logic goes here.', 'info')}>Delete</Button>
                                    </td>
                                </tr>
                            )}
                        />
                        {assignments.length === 0 && (
                            <div className="p-8 text-center text-slate-500 italic">No assignments active for this period. Use the button above to match Evaluators to Evaluatees.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab 3 Content: Results Placeholder */}
            {activeTab === 'results' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Results will be displayed here.</h3>
                    <p className="text-slate-500 max-w-md mx-auto">This dashboard will aggregate submitted peer grades, calculate finalized KPI points mapping to user scale weights, and output PDF reports eventually.</p>
                </div>
            )}

            {/* Universal Root Level Modals Frame (Reduced since Indicators moved inline) */}
            {modalState.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800">
                                {modalState.type === 'topic' && 'Create New Topic'}
                                {modalState.type === 'assignment' && 'Match Assignment Pair'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:bg-slate-50 p-1 rounded-md transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {/* TOPIC FORM MODAL CONTROLLER */}
                            {modalState.type === 'topic' && (
                                <form id="topicForm" onSubmit={handleTopicSubmit} className="space-y-4">
                                    <InputField label="Topic Name" value={topicForm.name} onChange={e => setTopicForm({ ...topicForm, name: e.target.value })} required />
                                    <div className="flex flex-col gap-1 w-full">
                                        <label className="text-sm font-medium text-slate-700">Description</label>
                                        <textarea
                                            required
                                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[80px]"
                                            value={topicForm.description} onChange={e => setTopicForm({ ...topicForm, description: e.target.value })}
                                        />
                                    </div>
                                </form>
                            )}

                            {/* ASSIGNMENT FORM MODAL CONTROLLER */}
                            {modalState.type === 'assignment' && (
                                <form id="assignmentForm" onSubmit={handleAssignmentSubmit} className="space-y-4">
                                    {loadingUsers ? (
                                        <div className="text-sm text-slate-500 italic text-center p-4">Loading users database...</div>
                                    ) : (
                                        <>
                                            <div className="flex flex-col gap-1 w-full">
                                                <label className="text-sm font-medium text-slate-700">Select Evaluator (ผู้ประเมิน) <span className="text-rose-500">*</span></label>
                                                <select required className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                    value={assignmentForm.evaluatorId} onChange={e => setAssignmentForm({ ...assignmentForm, evaluatorId: e.target.value })}>
                                                    <option value="" disabled>Choose Evaluator...</option>
                                                    {allUsers.filter(u => u.role === 'ADMIN' || u.role === 'EVALUATOR').map(u => (
                                                        <option key={u.id} value={u.id}>[{u.empId}] {u.name} - {u.role}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-1 w-full mt-4">
                                                <label className="text-sm font-medium text-slate-700">Select Evaluatee (ผู้ถูกประเมิน) <span className="text-rose-500">*</span></label>
                                                <select required className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                    value={assignmentForm.evaluateeId} onChange={e => setAssignmentForm({ ...assignmentForm, evaluateeId: e.target.value })}>
                                                    <option value="" disabled>Choose Evaluatee...</option>
                                                    {allUsers.filter(u => u.role !== 'ADMIN').map(u => (
                                                        <option key={u.id} value={u.id}>[{u.empId}] {u.name}</option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-slate-400 mt-1">Cannot map an Administrator to be graded directly here without evaluator overrides.</p>
                                            </div>
                                        </>
                                    )}
                                </form>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                            <Button type="button" variant="outline" onClick={closeModal} className="bg-white">Cancel</Button>
                            <Button type="submit" form={modalState.type + 'Form'} disabled={submitting}>
                                {submitting ? 'Saving...' : 'Confirm Action'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EvaluationDetail;
