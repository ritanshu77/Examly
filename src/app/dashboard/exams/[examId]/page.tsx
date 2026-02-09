"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";

interface Set {
  _id: string;
  name: { en: string; hi: string };
  totalQuestions: number;
  setNumber: number;
  isActive: boolean;
}

export default function ExamSetsPage() {
  const params = useParams();
  const examId = params.examId as string;
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!examId) return;
    const controller = new AbortController();
    fetchSets(controller.signal);
    return () => controller.abort();
  }, [examId]);

  const fetchSets = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`/api/sets`, {
        examId: examId as string,
        quizType: 'exam'
      });
      if (data && Array.isArray(data)) {
        setSets(data);
      } else if (data?.success && Array.isArray(data?.data)) {
        setSets(data.data);
      } else {
        setSets([]);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Exam sets fetch error:", err);
      setSets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-2 min-h-screen">
      <style>{`
        .header h1 { font-size: 24px; font-weight: bold; color: var(--primary-blue); margin: 0 0 4px 0; }
        .sets-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .set-card { background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); border-left: 4px solid #e67e22; text-decoration: none; display: block; }
        .set-card:hover { transform: translateY(-2px); transition: transform .2s; }
        
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

      <div className="header">
        <h1>Exam Sets</h1>
        <p style={{ color: "#666", fontSize: 13, margin: "0 0 10px 0" }}>
          {loading ? "Loading..." : `${sets.length} sets available`}
        </p>
      </div>

      {loading ? (
        <div className="loader-container">
            <div className="spinner"></div>
        </div>
      ) : sets.length === 0 ? (
        <div className="loading">No exam sets available</div>
      ) : (
        <div className="sets-grid">
          {sets.map((set) => (
            <Link
              key={set._id}
              href={`/dashboard/exams/${examId}/sets/${set._id}`}
              className="set-card"
            >
              <div className="stat-title">{set.name?.en || set.name?.hi || `Set ${set.setNumber}`}</div>
              <h3 className="stat-value" style={{ color: "var(--primary-blue)" }}>
                {set.totalQuestions} Questions
              </h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
