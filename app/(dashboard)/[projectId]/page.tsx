'use client'

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId;

  useEffect(() => {
    // Redirect to the info tab for this project
    if (projectId) {
      router.push(`/${projectId}/info`);
    }
  }, [projectId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
