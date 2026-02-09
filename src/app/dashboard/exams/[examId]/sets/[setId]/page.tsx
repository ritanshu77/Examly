"use client";

import SetQuestionsView from "@/components/SetQuestionsView";
import { useParams } from "next/navigation";

export default function ExamSetQuestionsPage() {
  const params = useParams();
  const examId = params.examId as string;
  const setId = params.setId as string;

  return (
    <SetQuestionsView 
      setId={setId} 
      unitId={examId} 
      backPath={`/dashboard/exams/${examId}`} 
    />
  );
}
