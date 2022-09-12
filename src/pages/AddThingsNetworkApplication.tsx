import React, { FC } from 'react';
import { upsertResource } from 'api';
import { goToResources } from '../navigation';
import { TtnResourceForm } from '../forms/TtnResourceForm';
import { DatasourceType, ThingsNetworkApplicationSettings } from '../types';
import { AppRootProps } from '@grafana/data';

export const AddThingsNetworkApplication: FC<AppRootProps> = ({ query }) => {
  const projectName = query['project'];
  let defaultTtn: ThingsNetworkApplicationSettings = {
    type: DatasourceType.ttnv3,
    zone: 'eu1',
    application: '',
    name: '',
    authorizationKey: '',
  };
  return (
    <>
      <TtnResourceForm
        ttn={defaultTtn}
        onSubmit={(ttnResource) => {
          upsertResource(projectName, ttnResource).then(() => goToResources(projectName));
        }}
        onCancel={() => goToResources(projectName)}
      />
    </>
  );
};
