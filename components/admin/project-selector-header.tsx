import { useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const projects = [
  {id: "12345", name: "MyDrive"},
  {id: "23456", name: "Sensio"},
  {id: "34567", name: "Custom 1"},
  {id: "45678", name: "Custom 2"},
]

export default function ProjectSelector() {
  const [selectedProject, setSelectedProject] = useState(projects[0].id)

  return (
    <Select defaultValue={selectedProject} onValueChange={setSelectedProject}>
      <SelectTrigger className="px-4 rounded-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {projects.map((project) => {
            return (
              <SelectItem 
                value={project.id} 
                key={project.id}
              > 
                {project.name} 
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}