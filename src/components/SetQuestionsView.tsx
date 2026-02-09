"use client";

import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from './Toast';
import { getAuthToken } from "@/utils/auth";

interface QuestionOption {
    key: string;
    text: {
        en: string;
        hi: string;
    };
}

interface Question {
    _id: string;
    questionNumber: number;
    questionText: {
        en: string;
        hi: string;
    };
    options: QuestionOption[];
    difficulty: string;
    correctAnswer?: string;
    correctOptionKey?: string;
    correctOption?: string;
    explanation?: {
        en: string;
        hi: string;
    };
    previousExamCode?: string;
    subjectDetails?: {
        _id: string;
        name: { en: string; hi: string };
        code: string;
    };
    unitDetails?: {
        _id: string;
        name: { en: string; hi: string };
        code: string;
    };
    chapterDetails?: {
        _id: string;
        name: { en: string; hi: string };
        code: string;
    };
    marks?: number;
    negativeMarks?: number;
}

interface SetDetails {
    _id: string;
    setNumber: number;
    setName: {
        en: string;
        hi: string;
    };
    totalQuestions: number;
    questions: Question[];
}

interface SetQuestionsViewProps {
    setId: string;
    unitId: string;
    backPath?: string;
}

export default function SetQuestionsView({ setId, unitId, backPath }: SetQuestionsViewProps) {
    const router = useRouter();
    const [setDetails, setSetDetails] = useState<SetDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Quiz State
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({}); // questionId -> optionKey
    const [questionTimes, setQuestionTimes] = useState<{ [key: string]: number }>({}); // questionId -> timeInSeconds
    const [showResultModal, setShowResultModal] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [user, setUser] = useState<{ id: string; name: string } | null>(null);
    const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set());

    // Fetch User
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = getAuthToken();
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const { data } = await axios.get('/api/auth/me', { headers });
                if (data?.success && data?.user) {
                    setUser(data.user);
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        try {
            const key = `quiz_exited_${setId}`;
            if (typeof window !== 'undefined' && localStorage.getItem(key) === '1') {
                router.replace(backPath || `/dashboard/units/${unitId}/sets`);
            }
        } catch {}
    }, [router, setId, unitId]);

    // Fetch Progress
    useEffect(() => {
        const fetchProgress = async () => {
            if (!user || !setId) return;
            try {
                const token = getAuthToken();
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const { data } = await axios.get(`/api/attempts/progress?userId=${user.id}&questionSetId=${setId}`, { headers });
                if (data?.success && data?.data) {
                    const { userAnswers: savedAnswers, questionTimes: savedTimes, testDuration } = data.data;
                    if (savedAnswers) {
                        setUserAnswers(savedAnswers);
                    }
                    if (savedTimes) {
                        setQuestionTimes(savedTimes);
                    }
                    if (testDuration?.timeTaken) {
                        setTimer(testDuration.timeTaken);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch progress:", err);
            }
        };
        fetchProgress();
    }, [user, setId]);

    const fetchSetDetails = useCallback(async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            console.log("SetQuestionsView token:", token ? "FOUND" : "MISSING");
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const { data } = await axios.get(`/api/sets/${setId}`, { headers });
            
            let fetchedSet: SetDetails | null = null;
            if (data?.data?.data) {
                fetchedSet = data.data.data;
            } else if (data?.data) {
                fetchedSet = data.data;
            } else if (data?.success && data?.questions) {
                 fetchedSet = data as unknown as SetDetails;
            }

            if (fetchedSet && fetchedSet.questions) {
                setSetDetails(fetchedSet);
            } else {
                setError("Set details not found");
            }

        } catch (err) {
            console.error("Error fetching set details:", err);
            setError("Failed to load questions. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [setId]);

    // Timer Effect
    useEffect(() => {
        if (!setDetails || isSubmitted) return;
        const interval = setInterval(() => {
            setTimer(prev => prev + 1);
            
            // Update current question time
            if (setDetails.questions && setDetails.questions.length > currentIdx) {
                const currentQ = setDetails.questions[currentIdx];
                if (currentQ && currentQ._id) {
                    setQuestionTimes(prev => ({
                        ...prev,
                        [currentQ._id]: (prev[currentQ._id] || 0) + 1
                    }));
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [setDetails, isSubmitted, currentIdx]);



    useEffect(() => {
        fetchSetDetails();
    }, [setId, fetchSetDetails]);
    
    useEffect(() => {
        if (setDetails && setDetails.questions[currentIdx]) {
            const currentQId = setDetails.questions[currentIdx]._id;
            setVisitedQuestions(prev => {
                const newSet = new Set(prev);
                newSet.add(currentQId);
                return newSet;
            });
        }
    }, [currentIdx, setDetails]);

    useEffect(() => {
        setCurrentIdx(0);
    }, [setDetails]);

    const formatTime = (totalSeconds: number) => {
        const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        return `${hrs} : ${mins} : ${secs}`;
    };

    const saveProgress = async (questionId: string, answerKey: string) => {
        try {
            const question = setDetails?.questions.find(q => q._id === questionId);
            if (!question || !user) return;

            const payload = {
                userId: user.id,
                questionSetId: setId,
                questionId,
                answerKey,
                questionTime: questionTimes[questionId] || 0,
                totalTime: timer
            };
            
            await axios.post('/api/attempts/progress', payload, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
        } catch (e) {
            console.error("Error saving progress:", e);
        }
    };

    const handleOptionSelect = (questionId: string, optionKey: string) => {
        if (isSubmitted) return;
        
        // Prevent changing answer if already answered
        if (userAnswers[questionId]) {
            toast("Answer cannot be changed once selected.", "info");
            return;
        }

        setUserAnswers(prev => ({
            ...prev,
            [questionId]: optionKey
        }));
        saveProgress(questionId, optionKey);
    };

    const submitFeedback = async () => {
        if (!feedbackText.trim() || !currentQuestion || !user) {
            toast("Please enter feedback text.", "error");
            return;
        }

        setIsSubmittingFeedback(true);
        try {
            await axios.post('/api/feedback', {
                userId: user.id,
                questionId: currentQuestion._id,
                feedback: feedbackText
            }, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            
            toast("Feedback submitted successfully!", "success");
            setFeedbackText('');
            setShowFeedbackModal(false);
        } catch (e) {
            console.error("Error submitting feedback:", e);
            toast("Failed to submit feedback. Please try again.", "error");
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    const getCorrectKey = (q: Question) => q.correctOptionKey || q.correctOption || q.correctAnswer;

    const calculateScore = () => {
        if (!setDetails) return { answered: 0, total: 0, score: 0, correct: 0, wrong: 0 };
        
        let correct = 0;
        let wrong = 0;
        let answered = 0;
        let currentScore = 0;

        Object.entries(userAnswers).forEach(([qId, answerKey]) => {
            answered++;
            const question = setDetails.questions.find(q => q._id === qId);
            if (question) {
                const correctKey = getCorrectKey(question);
                const qMarks = typeof question.marks === 'number' ? question.marks : 1;
                const qNeg = typeof question.negativeMarks === 'number' ? question.negativeMarks : 0.33;

                if (correctKey === answerKey) {
                    correct++;
                    currentScore += qMarks;
                } else {
                    wrong++;
                    currentScore -= qNeg;
                }
            }
        });

        return {
            answered,
            total: setDetails.questions.length,
            score: Number(currentScore.toFixed(2)),
            correct,
            wrong
        };
    };

    const handleExit = () => {
        // Save current progress before exiting? 
        // Maybe optional, but let's just go back for now.
        // If we want to save state on exit without submitting, we'd need an API for that.
        // Currently we only save on submit or next/prev (if implemented).
        
        // Actually, we should probably mark "exited" in local storage so we don't auto-restore next time?
        // Or just keep it.
        
        localStorage.setItem(`quiz_exited_${setId}`, 'true');

        if (backPath) {
            router.push(backPath);
        } else {
            router.push(`/dashboard/units/${unitId}/sets`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#f4f7f6]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008ecc]"></div>
            </div>
        );
    }

    if (error || !setDetails) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#f4f7f6]">
                <div className="text-center p-8 text-[#ff5252] bg-white rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold">Error</h3>
                    <p>{error || "Set not found"}</p>
                </div>
            </div>
        );
    }

    if (setDetails.questions.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#f4f7f6]">
                <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold">No Questions Available</h3>
                    <p>This set does not contain any questions.</p>
                </div>
            </div>
        );
    }

    const currentQuestion = setDetails.questions[Math.max(0, Math.min(currentIdx, setDetails.questions.length - 1))];
    const stats = calculateScore();
    const currentQTime = currentQuestion ? (questionTimes[currentQuestion._id] || 0) : 0;
    
    const correctKey = currentQuestion ? getCorrectKey(currentQuestion) : null;
    const isAnswered = currentQuestion && !!userAnswers[currentQuestion._id];
    const userAnswer = currentQuestion && userAnswers[currentQuestion._id];

    return (
        <div className="quiz-container">
            <style jsx>{`
                :root {
                    --primary-blue: #008ecc;
                    --success-green: #2e7d32;
                    --error-red: #c62828;
                    --bg-gray: #f4f7f6;
                    --topbar: 60px;
                }
                :global(html, body, #__next) { height: 100%; }
                :global(body) { margin: 0; background: var(--bg-gray); font-family: sans-serif; }
                .quiz-container { height: 100vh; display: flex; flex-direction: column; }
                .top-nav {
                    background: white; height: var(--topbar); display: flex; align-items: center;
                    justify-content: space-between; padding: 0 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    position: sticky; top: 0; z-index: 1000;
                }
                .toggle-btn { font-size: 24px; cursor: pointer; border: none; background: none; display: none; color: #333; }
                .quiz-wrapper { display: flex; padding: 10px; gap: 10px; width: 100%; margin: 0; flex: 1; flex-direction: row; }
                .quiz-main { flex: 3; min-width: 0; }
                .card { background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 12px; }
                .option { padding: 12px; border: 1px solid #ddd; border-radius: 6px; margin-top: 8px; cursor: pointer; transition: 0.2s; font-weight: 500; }
                .option:hover { background: #f9f9f9; }
                
                /* Darker Answer Feedback Colors */
                .option.correct { 
                    background: var(--success-green) !important; 
                    border-color: #1b5e20; 
                    color: white !important; 
                }
                .option.wrong { 
                    background: var(--error-red) !important; 
                    border-color: #b71c1c; 
                    color: white !important; 
                }

                .quiz-sidebar { 
                    flex: 1; 
                    min-width: 280px; 
                    transition: right 0.3s ease;
                    display: flex; 
                    flex-direction: column; 
                    max-height: 72vh;
                    overflow: hidden;
                    position: sticky;
                    top: 70px;
                    scrollbar-width: thin;
                }
                .mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 998; }
                .palette { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 10px; }
                .palette-scroll { padding-right: 4px; flex: 1; overflow-y: auto; min-height: 0; }
                .q-box { height: 40px; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; font-weight: bold; }
                .q-box.right { background: var(--success-green); color: white; border: none; }
                .q-box.wrong { background: var(--error-red); color: white; border: none; }
                .q-box.seen { background: var(--primary-blue); color: white; border: none; }
                .q-box.current { box-shadow: 0 0 0 3px #ff9800; transform: scale(1.05); z-index: 1; position: relative; } 
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .modal-box { background: white; padding: 30px; border-radius: 15px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                .res-item { padding: 15px; border-radius: 10px; font-weight: bold; }
                .btn-full { width: 100%; padding: 12px; background: var(--primary-blue); color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px; font-weight: bold;}
                .btn-full:disabled { background: #ccc; cursor: not-allowed; }
                .palette-card { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }
                .explanation-box { margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; border-left: 5px solid #2196f3; }
                
                @media (max-width: 992px) {
                    .toggle-btn { display: block; }
                    .quiz-wrapper { flex-direction: column; padding: 0px; gap: 8px; }
                    .quiz-main { width: 100%; max-width: none; margin: 0; }
                    .quiz-sidebar { 
                        position: fixed; 
                        top: var(--topbar); 
                        right: -100%; 
                        left: auto;
                        height: 80vh; 
                        max-height: none;
                        background: white; 
                        z-index: 999; 
                        box-shadow: -5px 0 15px rgba(0,0,0,0.1); 
                        width: 300px; 
                        max-width: 85vw; 
                        padding: 12px; 
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        border-bottom-left-radius: 8px;
                    }
                    .quiz-sidebar.active { right: 0; }
                    .palette-scroll { height: auto; overflow-y: auto; flex: 1; min-height: 0; }
                    .palette { grid-template-columns: repeat(5, 1fr); }
                }
            `}</style>
            <nav className="top-nav">
                <div style={{ fontWeight: 'bold', color: 'var(--primary-blue)' }}>QUIZ PORTAL</div>
                <div>Time : {formatTime(timer)}</div>
                <button className="toggle-btn" onClick={() => setMobilePanelOpen(!mobilePanelOpen)}>☰</button>
            </nav>
            {mobilePanelOpen && <div className="mobile-overlay" onClick={() => setMobilePanelOpen(false)} />}

            <div className="quiz-wrapper">
                <div className="quiz-main" onClick={() => { if (mobilePanelOpen) setMobilePanelOpen(false); }}>
                        {currentQuestion && (
                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                <span>{currentQuestion.subjectDetails?.name?.en || ''}</span>
                                {currentQuestion.unitDetails?.name?.en && <span> &gt; {currentQuestion.unitDetails.name.en}</span>}
                                {currentQuestion.chapterDetails?.name?.en && <span> &gt; {currentQuestion.chapterDetails.name.en}</span>}
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong id="q-number">Q-{currentIdx + 1}</strong>
                                {currentQuestion.difficulty && (
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        backgroundColor: 
                                             currentQuestion.difficulty.toLowerCase() === 'easy' ? '#4caf50' : 
                                             ['medium', 'moderate'].includes(currentQuestion.difficulty.toLowerCase()) ? '#ff9800' : 
                                             '#f44336'
                                     }}>
                                        {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                {isAnswered && (
                                    <button 
                                        onClick={() => setShowFeedbackModal(true)}
                                        className="bg-[#c3cacfff] border-none text-[#67818fff] cursor-pointer rounded font-semibold text-[10px] px-2 py-0.5 md:text-xs md:px-2.5 md:py-1"
                                    >
                                        Report Issue?
                                    </button>
                                )}
                                <span id="q-status" style={{ color: '#2e7d32', fontWeight: 'bold' }}>Time: {formatTime(currentQTime)}</span>
                            </div>
                        </div>
                        <div style={{ margin: '20px 0' }}>
                            <p style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#111', fontWeight: '600' }}>{currentQuestion.questionText.en}</p>
                            {currentQuestion.questionText.hi && (
                                <p style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>{currentQuestion.questionText.hi}</p>
                            )}

                        <div id="options-container">
                            {Array.isArray(currentQuestion?.options) && currentQuestion.options.length > 0 ? (
                                currentQuestion.options.map((opt) => {
                                    const isSelected = userAnswer === opt.key;
                                    const isCorrectOption = correctKey === opt.key;
                                    let optionClass = 'option';
                                    
                                    if (isAnswered) {
                                        if (isCorrectOption) {
                                            optionClass += ' correct';
                                        } else if (isSelected) {
                                            optionClass += ' wrong';
                                        }
                                    }

                                    return (
                                        <div 
                                            key={opt.key}
                                            className={optionClass}
                                            onClick={() => handleOptionSelect(currentQuestion._id, opt.key)}
                                        >
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <span style={{ fontWeight: 'bold' }}>{opt.key}.</span>
                                                <div>
                                                    <div>{opt.text?.en ?? ''}</div>
                                                    {opt.text?.hi && <div style={{ fontSize: '0.9em', opacity: 0.9 }}>{opt.text.hi}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-slate-500">No options available for this question.</div>
                            )}
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button 
                            className="btn-full btn-secondary" 
                            style={{ width: 'auto' }} 
                            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                            disabled={currentIdx === 0}
                        >
                            Previous
                        </button>

                        <button 
                            className="btn-full" 
                            style={{ width: 'auto' }} 
                            onClick={() => {
                                if (currentIdx === setDetails.questions.length - 1) {
                                    setShowResultModal(true);
                                    setIsSubmitted(true);
                                    try { localStorage.setItem(`quiz_exited_${setId}`, '1'); } catch {}
                                } else {
                                    setCurrentIdx(prev => Math.min(setDetails.questions.length - 1, prev + 1));
                                }
                            }}
                        >
                            {currentIdx === setDetails.questions.length - 1 ? "Submit Test" : "Next Question"}
                        </button>
                    </div>

                    {isAnswered && (
                        <div className="explanation-box">
                            <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Explanation:</h4>
                            <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                {currentQuestion.explanation?.en ? (
                                    <>
                                        <p>{currentQuestion.explanation.en}</p>
                                        {currentQuestion.explanation.hi && (
                                            <p style={{ marginTop: '8px', color: '#333' }}>{currentQuestion.explanation.hi}</p>
                                        )}
                                    </>
                                ) : (
                                    <p>No explanation available.</p>
                                )}
                            </div>
                        </div>
                    )}

                </div>
                <div className={`quiz-sidebar ${mobilePanelOpen ? 'active' : ''}`}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: '35px', height: '35px', background: '#ff5252', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {user ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <strong>{user ? user.name : 'User'}</strong>
                        </div>
                        <p>Marks Scored: <span>{stats.score}</span></p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span style={{ color: '#ff5252' }}>{stats.wrong} Incorrect</span>
                            <span style={{ color: '#2e7d32' }}>{stats.correct} Correct</span>
                        </div>
                    </div>

                    <div className="card palette-card">
                        <center><strong>Question Palette</strong></center>
                        <div className="palette-scroll">
                            <div className="palette">
                                {setDetails.questions.map((q, i) => {
                                    const isSelected = !!userAnswers[q._id];
                                    const correctKey = getCorrectKey(q);
                                    const isCorrect = isSelected && userAnswers[q._id] === correctKey;
                                    const isWrong = isSelected && !isCorrect;
                                    const isSeen = visitedQuestions.has(q._id) && !isSelected;
                                    
                                    let statusClass = '';
                                    if (isCorrect) statusClass = 'right';
                                    else if (isWrong) statusClass = 'wrong';
                                    else if (isSeen) statusClass = 'seen';

                                    return (
                                        <div 
                                            key={q._id}
                                            className={`q-box ${statusClass} ${currentIdx === i ? 'current' : ''}`}
                                            onClick={() => {
                                                setCurrentIdx(i);
                                                if (window.innerWidth <= 992) setMobilePanelOpen(false);
                                            }}
                                        >
                                            {i + 1}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <button 
                            className="btn-full" 
                            style={{ marginTop: 20 }} 
                            onClick={() => {
                                setShowResultModal(true);
                                setIsSubmitted(true);
                                try { localStorage.setItem(`quiz_exited_${setId}`, '1'); } catch {}
                            }}
                        >
                            Submit Test
                        </button>
                    </div>
                </div>
            </div>
            {showResultModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2 style={{ margin: 0, color: '#008ecc' }}>Test Summary </h2>
                        <div className="result-grid">
                            <div className="res-item" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                                <div style={{ fontSize: '24px' }}>{stats.answered}</div> Answered
                            </div>
                            <div className="res-item" style={{ background: '#ffebee', color: '#c62828' }}>
                                <div style={{ fontSize: '24px' }}>{stats.total - stats.answered}</div> Skipped
                            </div>
                        </div>
                        <p>Total Questions: <strong>{stats.total}</strong></p>
                        <button
                            className="btn-full"
                            onClick={() => {
                                console.log("[Exit Quiz] Button clicked");
                                try { localStorage.setItem(`quiz_exited_${setId}`, '1'); } catch {}
                                
                                router.replace(backPath || `/dashboard/units/${unitId}/sets`);
                            }}
                        >
                            Exit Quiz
                        </button>
                    </div>
                </div>
            )}

            {showFeedbackModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: '500px' }}>
                        <h2 style={{ margin: 0, color: '#008ecc', marginBottom: '15px' }}>Question Feedback</h2>
                        <p style={{ textAlign: 'left', fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                            Report an error or provide feedback for this question.
                        </p>
                        <textarea
                            style={{
                                width: '100%',
                                height: '120px',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                marginBottom: '15px',
                                resize: 'none',
                                fontFamily: 'inherit'
                            }}
                            placeholder="Write your feedback here...in 200 words max"
                            value={feedbackText}
                            maxLength={200}
                            onChange={(e) => setFeedbackText(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn-full"
                                style={{ background: '#91c75fff', marginTop: 0 }}
                                onClick={() => {
                                    setShowFeedbackModal(false);
                                    setFeedbackText('');
                                }}
                            >
                                Close
                            </button>
                            <button
                                className="btn-full"
                                style={{ background: '#5b80c5ff', marginTop: 0 }}
                                onClick={submitFeedback}
                                disabled={isSubmittingFeedback || !feedbackText.trim()}
                            >
                                {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
