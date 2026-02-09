"use client";

import { useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';

export default function SubjectUnitsPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.subjectId as string;

    useEffect(() => {
        if (subjectId) {
            router.replace(`/dashboard/subjects/${subjectId}`);
        }
    }, [subjectId, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
             <p className="text-gray-500">Redirecting to dashboard...</p>
        </div>
    );
}
