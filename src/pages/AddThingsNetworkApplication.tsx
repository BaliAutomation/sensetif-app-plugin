import React, { FC } from 'react';
import { goToResources } from '../utils/navigation';
import { TtnResourceForm } from '../forms/TtnResourceForm';
import { AppRootProps } from '@grafana/data';

export const AddThingsNetworkApplication: FC<AppRootProps> = ({ query }) => {
  const projectName = query['project'];

  return (
    <>
      <TtnResourceForm
        onCancel={() => goToResources(projectName)}
      />
    </>
  );
};
