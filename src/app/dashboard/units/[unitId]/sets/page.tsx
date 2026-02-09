"use client";

import UnitSetsView from "@/components/UnitSetsView";
import { useParams } from 'next/navigation';

export default function UnitSetsPage() {
    const params = useParams();
    const unitId = params.unitId as string;

    return (
        <div className="max-w-6xl mx-auto p-2 min-h-screen">
             <UnitSetsView unitId={unitId} />
        </div>
    );
}
