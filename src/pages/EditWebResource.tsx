import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { WebResourceSettings } from 'types';
import { Alert, LoadingPlaceholder } from '@grafana/ui';
import { goToResources } from 'navigation';
import { WebResourceForm } from 'forms/WebResourceForm';
import { logError } from '@grafana/runtime';
import { getResource, upsertResource } from '../api';

export const EditWebResource: FC<AppRootProps> = ({ query }) => {
  const projectName: string = query['project'];
  const resourceName: string = query['resource'];

  const [webResource, setWebResource] = useState<WebResourceSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchErr, setFetchErr] = useState(undefined);

  useEffect(() => {
    loadWebResource(projectName, resourceName);
  }, [projectName, resourceName]);

  const loadWebResource = (project: string, webResourceName: string) => {
    setIsLoading(true);
    setFetchErr(undefined);
    return getResource(project, webResourceName)
      .then((resource) => setWebResource(resource as WebResourceSettings))
      .catch((err) => {
        logError(err);
        setFetchErr(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateWebResource = (projectName: string, webResource: WebResourceSettings) => {
    upsertResource(projectName, webResource)
      .then(() => goToResources(projectName))
      .catch((err) => logError(err));
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
      <WebResourceForm
        resource={webResource}
        onSubmit={(data) => updateWebResource(projectName, data)}
        onCancel={() => goToResources(projectName)}
        project={projectName}
      />
    </>
  );
};
