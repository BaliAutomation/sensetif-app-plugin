import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { getBackendSrv, getLocationSrv } from '@grafana/runtime';
import { ProjectForm } from 'forms/ProjectForm';
import { ProjectSettings } from 'types';
import { InfoBox, LoadingPlaceholder } from '@grafana/ui';
import { ProjectsPage } from 'pages';

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
    return getBackendSrv()
      .get(`/api/plugin-proxy/sensetif-app/resources/projects/${name}`)
      .then((res: ProjectSettings) => {
        setProject(res);
      })
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
    console.log('update');
    console.log(project);
    getLocationSrv().update({
      query: {
        tab: ProjectsPage.id,
      },
    });
  };

  if (isLoading) {
    return <LoadingPlaceholder text="Loading..." />;
  }

  if (fetchErr) {
    return (
      <InfoBox title={'Fetch error'} severity={'error'}>
        {JSON.stringify(fetchErr, null, 2)}
      </InfoBox>
    );
  }

  return (
    <>
      <ProjectForm editable project={project} onSubmit={(data) => updateProject(data)} />
    </>
  );
};
