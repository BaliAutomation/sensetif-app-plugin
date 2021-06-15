import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { ProjectForm } from 'forms/ProjectForm';
import { ProjectSettings } from 'types';
import { Alert, LoadingPlaceholder } from '@grafana/ui';
import { getProject, addProject } from 'utils/api';
import { goToProjects } from 'utils/navigation';

export const EditProject: FC<AppRootProps> = ({ query }) => {
  const name: string = query['project'];

  const [project, setProject] = useState<ProjectSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchErr, setFetchErr] = useState(undefined);

  useEffect(() => {
    loadProject(name);
  }, [name]);

  const loadProject = (name: string) => {
    setIsLoading(true);
    setFetchErr(undefined);
    return getProject(name)
      .then((project) => setProject(project))
      .catch((err) => {
        console.log('err:');
        console.log(err);
        setFetchErr(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateProject = (project: ProjectSettings) => {
    addProject(project)
      .then(() => goToProjects())
      .catch((err) => console.log(err));
  };

  if (isLoading) {
    return <LoadingPlaceholder text="Loading..." />;
  }

  if (fetchErr) {
    return (
      <Alert title={'Fetch error'} severity={'error'}>
        {JSON.stringify(fetchErr, null, 2)}
      </Alert>
    );
  }

  return (
    <>
      <ProjectForm project={project} onSubmit={(data) => updateProject(data)} />
    </>
  );
};
