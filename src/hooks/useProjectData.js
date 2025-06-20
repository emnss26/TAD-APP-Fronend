import { useState, useEffect } from "react";

export default function useProjectData({
  accountId,
  projectId,
  fetchProjects,
  fetchProject,
}) {
  const [projectsData, setProjectsData] = useState(null);
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (fetchProjects) {
      fetchProjects()
        .then(setProjectsData)
        .catch((err) => console.error("Error fetching projects:", err));
    }
  }, [fetchProjects]);

  useEffect(() => {
    if (fetchProject && projectId && accountId) {
      fetchProject(projectId, accountId)
        .then(setProject)
        .catch((err) => console.error("Error fetching project:", err));
    }
  }, [fetchProject, projectId, accountId]);

  return { projectsData, project };
}
