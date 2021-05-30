import React, { FC } from 'react';
import { ProjectForm } from 'forms/ProjectForm';
import { getLocationSrv } from '@grafana/runtime';
import { ProjectsPage } from 'pages';

interface Props {}
export const AddProject: FC<Props> = () => {
  return (
    <>
      <ProjectForm
        onSubmit={(project) => {
          console.log(project);
          getLocationSrv().update({
            query: {
              tab: ProjectsPage.id,
            },
          });
        }}
      />
    </>
  );
};
