"use client";

import { useProject } from "@/hooks/useProject";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";

export default function ProjectSelector() {
  const { projects, selectedProject, isLoadingList, selectProject } = useProject();

  console.log(projects)

  // ── Loading skeleton ───────────────────────────────────────
  if (isLoadingList) {
    return <Skeleton className="h-8 w-36 rounded-full" />;
  }
  
  // ── No projects yet ────────────────────────────────────────
  if (projects.length === 0) {
    return (
      <span className="text-sm text-muted-foreground px-2">
        No projects
      </span>
    );
  }

  return (
    <Select
      value={selectedProject?.project_id ?? ""}
      onValueChange={(id) => selectProject(id)}
    >
      <SelectTrigger className="pl-3 pr-2 rounded-full">
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {projects.map((project) => (
            <SelectItem
              value={project.project_id}
              key={project.project_id}
            >
              {project.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}