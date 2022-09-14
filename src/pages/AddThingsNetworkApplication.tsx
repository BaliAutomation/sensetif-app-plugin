import React, { FC } from 'react';
import { upsertResource } from '../utils/api';
import { goToResources } from '../utils/navigation';
import { TtnResourceForm } from '../forms/TtnResourceForm';
import { AppRootProps } from '@grafana/data';

export const AddThingsNetworkApplication: FC<AppRootProps> = ({ query }) => {
  const projectName = query['project'];

  return (
    <>
      <TtnResourceForm
        onSubmit={(ttnResource) => {
          upsertResource(projectName, ttnResource).then(() => goToResources(projectName));
        }}
        onCancel={() => goToResources(projectName)}
      />
    </>
  );
};
