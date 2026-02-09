"use client";

import { useState, useEffect, useRef } from "react";
import UnitsView from "@/components/UnitsView";
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { getAuthToken } from "@/utils/auth";

interface SubjectResponse {
  _id: string;
  code: string;
  name: {
    en: string;
    hi: string;
  };
}

export default function TitleSubjectUnitsPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const titleId = params.titleId as string;

  const [subjectName, setSubjectName] = useState<string>('');
  const [subjectNameHi, setSubjectNameHi] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const didFetchSubjectRef = useRef(false);
  useEffect(() => {
    if (!subjectId || didFetchSubjectRef.current) return;
    didFetchSubjectRef.current = true;
    fetchSubjectName();
  }, [subjectId]);

  const fetchSubjectName = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get<SubjectResponse>(`/api/subjects/${subjectId}`, {
        withCredentials: true,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      setSubjectName(data.name?.en || 'Subject');
      setSubjectNameHi(data.name?.hi || '');
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Server error';
        setError(status === 404 ? `Subject not found (ID: ${subjectId})` : message);
      } else if (error.request) {
        setError('Cannot connect to server. Check your internet connection');
      } else {
        setError('Something went wrong. Please try again');
      }
      setSubjectName('Subject Not Found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subject...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-2 min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      <UnitsView
        subjectId={subjectId}
        subjectName={subjectName}
        subjectNameHi={subjectNameHi}
        onBack={() => router.push(`/dashboard/titles/${titleId}`)}
        titleId={titleId}
      />
    </div>
  );
}
