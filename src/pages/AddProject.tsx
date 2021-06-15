import React, { FC } from 'react';
import { ProjectForm } from 'forms/ProjectForm';
import { addProject } from '../utils/api';
import { goToProjects } from '../utils/navigation';

interface Props {}
export const AddProject: FC<Props> = () => {
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
