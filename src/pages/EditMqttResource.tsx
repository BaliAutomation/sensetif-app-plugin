import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { MqttClientSettings } from 'types';
import { Alert, LoadingPlaceholder } from '@grafana/ui';
import { goToResources } from 'navigation';
import { MqttClientResourceForm } from '../forms/MqttClientResourceForm';
import { logError } from '@grafana/runtime';
import { getResource, upsertResource } from '../api';

export const EditMqttClient: FC<AppRootProps> = ({ query }) => {
  const projectName: string = query['project'];
  const resourceName: string = query['resource'];

  const [mqttResource, setMqttResource] = useState<MqttClientSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchErr, setFetchErr] = useState(undefined);

  useEffect(() => {
    loadMqttResource(projectName, resourceName);
  }, [projectName, resourceName]);

  const loadMqttResource = (project: string, mqttResourceName: string) => {
    setIsLoading(true);
    setFetchErr(undefined);
    return getResource(project, mqttResourceName)
      .then((resource) => setMqttResource(resource as MqttClientSettings))
      .catch((err) => {
        logError(err);
        setFetchErr(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateMqttResource = (mqttResource: MqttClientSettings) => {
    upsertResource(projectName, mqttResource)
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
      <MqttClientResourceForm
        mqtt={mqttResource}
        onSubmit={(data) => updateMqttResource(data)}
        onCancel={() => goToResources(projectName)}
      />
    </>
  );
};
