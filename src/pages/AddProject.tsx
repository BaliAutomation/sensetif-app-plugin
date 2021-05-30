import React, { FC } from 'react';
import { ProjectForm } from 'forms/ProjectForm';
import { getBackendSrv, getLocationSrv } from '@grafana/runtime';
import { ProjectsPage } from 'pages';
import { ProjectSettings } from 'types';

interface Props {}
export const AddProject: FC<Props> = () => {
  const addProject = (project: ProjectSettings) =>
    getBackendSrv().post(`/api/plugin-proxy/sensetif-app/resources/projects`, project);

  const goToProjects = () => {
    getLocationSrv().update({
      query: {
        tab: ProjectsPage.id,
      },
    });
  };

  return (
    <>
      <ProjectForm
        onSubmit={(project) => {
          addProject(project).then(() => goToProjects());
        }}
      />
    </>
  );
};
