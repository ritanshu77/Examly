"use client";

import SetQuestionsView from "@/components/SetQuestionsView";
import { useParams, useSearchParams } from "next/navigation";

export default function SetQuestionsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const unitId = params.unitId as string;
    const setId = params.setId as string;

    const titleId = searchParams.get('titleId');
    const backPath = titleId 
        ? `/dashboard/units/${unitId}/sets?titleId=${titleId}`
        : `/dashboard/units/${unitId}/sets`;

    return (
        <SetQuestionsView 
            setId={setId} 
            unitId={unitId} 
            backPath={backPath}
        />
    );
}
