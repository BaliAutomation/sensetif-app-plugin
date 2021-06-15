import React, { FC } from 'react';
import { ProjectForm } from 'forms/ProjectForm';
import { upsertProject } from '../utils/api';
import { goToProjects } from '../utils/navigation';

interface Props {}
export const AddProject: FC<Props> = () => {
  return (
    <>
      <ProjectForm
        onSubmit={(project) => {
          upsertProject(project).then(() => goToProjects());
        }}
      />
    </>
  );
};
