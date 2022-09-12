import React, { FC } from 'react';
import { AppRootProps } from '@grafana/data';
import { upsertResource } from 'api';
import { goToResources } from '../navigation';
import { MqttClientResourceForm } from '../forms/MqttClientResourceForm';
import { MqttClientSettings } from '../types';
import { logError } from '@grafana/runtime';

export const AddMqttClient: FC<AppRootProps> = ({ query }) => {
  const projectName = query['project'];

  const addMqttResource = (mqttResource: MqttClientSettings) => {
    upsertResource(projectName, mqttResource)
      .then(() => goToResources(projectName))
      .catch((err) => logError(err));
  };

  return (
    <>
      <MqttClientResourceForm
        onSubmit={(mqttResource: MqttClientSettings) => addMqttResource(mqttResource)}
        onCancel={() => goToResources(projectName)}
      />
    </>
  );
};
