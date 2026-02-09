"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";

interface Subject {
  subjectId: string;
  code: string;
  nameEn: string;
  nameHi: string;
  totalQuestions: number;
  unitCount?: number;
  chapterCount?: number;
}

export default function TitleSubjectsPage() {
  const params = useParams();
  const titleId = params.titleId as string;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!titleId) return;
    const controller = new AbortController();
    fetchSubjects(controller.signal);
    return () => controller.abort();
  }, [titleId]);

  const fetchSubjects = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/subjects/list/${titleId}`, { signal });
      if (data?.subjects && Array.isArray(data.subjects)) {
        setSubjects(data.subjects);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Title subjects fetch error:", err);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-2">
      <style>{`
        .header h1 { font-size: 24px; font-weight: bold; color: var(--primary-blue); margin: 0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
        .card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); border-left: 4px solid #8e44ad; text-decoration: none; display: block; }
        .card:hover { transform: translateY(-2px); transition: transform .2s; }
        .code { position: absolute; top: 10px; right: 10px; font-size: 10px; background: #eee; padding: 2px 6px; border-radius: 4px; color: #555; }
        .value { font-size: 20px; font-weight: bold; color: var(--primary-blue); margin: 4px 0; }
        .desc { font-size: 11px; color: #888; }
        
        /* Loader Styles */
        .loader-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 200px;
            width: 100%;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid var(--primary-blue);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div className="header">
            <h1>Subjects by Source</h1>
            <p style={{ color: "#666", fontSize: 13, margin: "4px 0 0 0" }}>
            {loading ? "Loading..." : `${subjects.length} subjects available`}
            </p>
        </div>
        <Link href="/dashboard" className="back-btn">
             ← Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="loader-container">
            <div className="spinner"></div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="loading">No subjects found for this source</div>
      ) : (
        <div className="grid">
          {subjects.map((s) => (
            <Link
              key={s.subjectId}
              href={`/dashboard/titles/${titleId}/subjects/${s.subjectId}`}
              className="card"
            >
              <div style={{ position: 'relative' }}>
                <div className="code">{s.code}</div>
                <div className="stat-title">{s.nameEn}</div>
                <div className="desc">{s.nameHi}</div>
                <div className="value">{s.totalQuestions.toLocaleString()} Questions</div>
                <div className="desc">{s.chapterCount} Chapters • {s.unitCount} Units</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
