import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { ThingsNetworkApplicationSettings } from 'types';
import { Alert, LoadingPlaceholder } from '@grafana/ui';
import { goToResources } from '../utils/navigation';
import { TtnResourceForm } from 'forms/TtnResourceForm';
import { logError } from '@grafana/runtime';
import { getResource, upsertResource } from '../utils//api';

export const EditThingsNetworkApplication: FC<AppRootProps> = ({ query }) => {
  const projectName: string = query['project'];
  const resourceName: string = query['resource'];

  const [ttnResource, setTtnResource] = useState<ThingsNetworkApplicationSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchErr, setFetchErr] = useState(undefined);

  useEffect(() => {
    loadTtnResource(projectName, resourceName);
  }, [projectName, resourceName]);

  const loadTtnResource = (project: string, ttnResourceName: string) => {
    setIsLoading(true);
    setFetchErr(undefined);
    return getResource(project, ttnResourceName)
      .then((resource) => setTtnResource(resource as ThingsNetworkApplicationSettings))
      .catch((err) => {
        logError(err);
        setFetchErr(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateTtnResource = (projectName: string, ttnResource: ThingsNetworkApplicationSettings) => {
    upsertResource(projectName, ttnResource)
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
      <TtnResourceForm
        ttn={ttnResource}
        onSubmit={(data) => updateTtnResource(projectName, data)}
        onCancel={() => goToResources(projectName)}
      />
    </>
  );
};
