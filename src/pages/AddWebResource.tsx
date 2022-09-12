import React, { FC } from 'react';
import { AppRootProps } from '@grafana/data';
import { upsertResource } from 'api';
import { goToResources } from '../navigation';
import { WebResourceForm } from '../forms/WebResourceForm';

export const AddWebResource: FC<AppRootProps> = ({ query }) => {
  const projectName = query['project'];

  return (
    <>
      <WebResourceForm
        project={projectName}
        onSubmit={(webResource) => {
          upsertResource(projectName, webResource).then(() => goToResources(projectName));
        }}
        onCancel={() => goToResources(projectName)}
      />
    </>
  );
};
