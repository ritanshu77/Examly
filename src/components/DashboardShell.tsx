"use client";

import { useEffect, useState } from "react";
import axios from 'axios';
import Link from 'next/link';
// import { toast } from "./Toast";

import { getAuthToken } from "@/utils/auth";

interface Subject {
  totalQuestions: number;
  easy: number;
  medium: number;
  hard: number;
  subjectId: string;
  code: string;
  nameEn: string;
  nameHi: string;
  descriptionEn: string;
  descriptionHi: string;
  unitCount: number;
  chapterCount: number;
}

interface Title {
  _id: string;
  name: { en: string; hi: string };
  code: string;
  description?: { en: string; hi: string };
  aiGenerated?: boolean;
}

interface Exam {
  _id: string;
  name: { en: string; hi: string };
  code: string;
  year: number;
}

interface User {
  id?: string | number;
  name?: { en?: string; hi?: string };
}

export default function DashboardShell({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<'topics' | 'sources' | 'exams' | 'ai'>('topics');
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [titles, setTitles] = useState<Title[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    fetchSubjects();
    
    // sidebar logic
    try {
      console.log("document.cookie:", document.cookie);
    } catch (e) {
      console.log("Could not read document.cookie", e);
    }
    
    // Legacy sidebar logic removed - now handled by DashboardLayout
  }, []);

  useEffect(() => {
    if ((activeTab === 'sources' || activeTab === 'ai') && titles.length === 0) fetchTitles();
    if (activeTab === 'exams' && exams.length === 0) fetchExams();
  }, [activeTab]);

  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get(`/api/subjects/list`, {
        withCredentials: true,
        headers: getHeaders(),
      });

      if (data?.subjects && Array.isArray(data.subjects)) {
        setSubjects(data.subjects);
      }
    } catch (error: unknown) {
      console.error("Axios error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTitles = async () => {
    try {
      setLoadingExtras(true);
      const { data } = await axios.get(`/api/titles/list`, {
        withCredentials: true,
        headers: getHeaders(),
      });
      if (data?.success && Array.isArray(data.titles)) {
        setTitles(data.titles);
      }
    } catch (error) {
      console.error("Titles error:", error);
    } finally {
      setLoadingExtras(false);
    }
  };

  const fetchExams = async () => {
    try {
      setLoadingExtras(true);
      const { data } = await axios.get(`/api/exams/list`, {
        withCredentials: true,
        headers: getHeaders(),
      });
      if (data?.success && Array.isArray(data.exams)) {
        setExams(data.exams);
      }
    } catch (error) {
      console.error("Exams error:", error);
    } finally {
      setLoadingExtras(false);
    }
  };

  return (
    <div>
      <style>{`
        .welcome-msg { margin-bottom: 15px; }
        .welcome-msg h1 { margin: 0; color: var(--primary-blue); font-size: 1.4rem; }
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
          gap: 10px; 
          margin-bottom: 15px; 
          width: 100%; 
        }
        .stat-card { 
          background: white; 
          padding: 15px; 
          border-radius: 8px; 
          box-shadow: 0 2px 6px rgba(0,0,0,0.05); 
          border-left: 4px solid var(--primary-blue);
          transition: transform 0.2s;
          text-decoration: none;
          display: block;
          position: relative;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-title { font-size: 13px; color: #666; margin-bottom: 6px; font-weight: 600; }
        .stat-value { font-size: 20px; font-weight: bold; color: var(--primary-blue); margin: 0 0 4px 0; }
        .stat-desc { font-size: 11px; color: #888; }
        .loading { text-align: center; padding: 30px; color: #666; }
        
        /* Loader Styles */
        .loader-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100px;
            width: 100%;
        }
        .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid var(--primary-blue);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Tabs */
        .tabs { 
            display: flex; 
            gap: 8px; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #eee; 
            padding-bottom: 8px;
            overflow-x: auto;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }
        .tabs::-webkit-scrollbar {
            display: none;
        }
        .tab-btn {
            background: none; border: none; padding: 6px 12px; font-size: 13px; cursor: pointer;
            border-radius: 6px; color: #666; font-weight: 500;
            flex-shrink: 0;
        }
        .tab-btn.active { background: var(--primary-blue); color: white; }
        .tab-btn:hover:not(.active) { background: #f5f5f5; }
        
        .badge { 
            position: absolute; top: 10px; right: 10px; 
            background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 10px; color: #555; 
        }
      `}</style>

      <div className="welcome-msg">
        <h1>Welcome, {typeof user?.name === 'string' ? user.name : (user?.name?.en ?? user?.name?.hi ?? "Guest")}! 👋</h1>
        <p style={{ fontSize: 14, margin: "5px 0", color: "#666" }}>
          Select your preferred way to practice:
        </p>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'topics' ? 'active' : ''}`} onClick={() => setActiveTab('topics')}>
          📚 By Subject
        </button>
        <button className={`tab-btn ${activeTab === 'sources' ? 'active' : ''}`} onClick={() => setActiveTab('sources')}>
          🏛️ By Institute/Source
        </button>
        <button className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
          🤖 AI Generated
        </button>
        <button className={`tab-btn ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => setActiveTab('exams')}>
          📝 Previous Exams
        </button>
      </div>

      {/* TOPICS TAB */}
      {activeTab === 'topics' && (
        loading ? (
            <div className="loader-container"><div className="spinner"></div></div>
        ) : subjects.length === 0 ? (
            <div className="loading">No subjects available</div>
        ) : (
            <div className="stats-grid">
            {subjects.map((subject) => (
                <Link 
                key={subject.subjectId} 
                href={`/dashboard/subjects/${subject.subjectId}`}
                className="stat-card"
                >
                <div className="stat-title">{subject.nameEn}</div>
                <h3 className="stat-value">{subject.totalQuestions.toLocaleString()} Questions</h3>
                <p className="stat-desc">
                    {subject.easy} Easy • {subject.medium} Medium • {subject.hard} Hard
                </p>
                <p className="stat-desc" style={{ fontSize: 11 }}>
                    {subject.chapterCount} Chapters • {subject.unitCount} Units
                </p>
                </Link>
            ))}
            </div>
        )
      )}

      {/* SOURCES TAB */}
      {activeTab === 'sources' && (
        loadingExtras ? (
            <div className="loader-container"><div className="spinner"></div></div>
        ) : titles.filter(t => !t.aiGenerated).length === 0 ? (
            <div className="loading">No sources available</div>
        ) : (
            <div className="stats-grid">
            {titles.filter(t => !t.aiGenerated).map((title) => (
                <Link 
                key={title._id} 
                href={`/dashboard/titles/${title._id}`}
                className="stat-card"
                style={{ borderLeftColor: '#8e44ad' }}
                >
                <div className="stat-title">{title.name.en}</div>
                <div className="stat-desc">{title.name.hi}</div>
                <div className="badge">{title.code}</div>
                </Link>
            ))}
            </div>
        )
      )}

      {/* AI TAB */}
      {activeTab === 'ai' && (
        loadingExtras ? (
            <div className="loader-container"><div className="spinner"></div></div>
        ) : titles.filter(t => t.aiGenerated).length === 0 ? (
            <div className="loading">No AI generated content available</div>
        ) : (
            <div className="stats-grid">
            {titles.filter(t => t.aiGenerated).map((title) => (
                <Link 
                key={title._id} 
                href={`/dashboard/titles/${title._id}`}
                className="stat-card"
                style={{ borderLeftColor: '#2ecc71' }}
                >
                <div className="stat-title">{title.name.en}</div>
                <div className="stat-desc">{title.name.hi}</div>
                <div className="badge">AI Generated</div>
                </Link>
            ))}
            </div>
        )
      )}

      {/* EXAMS TAB */}
      {activeTab === 'exams' && (
        loadingExtras ? (
            <div className="loader-container"><div className="spinner"></div></div>
        ) : exams.length === 0 ? (
            <div className="loading">No exams available</div>
        ) : (
            <div className="stats-grid">
            {exams.map((exam) => (
                <Link 
                key={exam._id} 
                href={`/dashboard/exams/${exam._id}`}
                className="stat-card"
                style={{ borderLeftColor: '#e67e22' }}
                >
                <div className="stat-title">{exam.name.en}</div>
                <div className="stat-desc">{exam.name.hi}</div>
                <h3 className="stat-value" style={{color: '#e67e22'}}>{exam.year}</h3>
                <div className="badge">Full Paper</div>
                </Link>
            ))}
            </div>
        )
      )}

    </div>
  );
}
