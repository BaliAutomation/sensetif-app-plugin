import React, { FC } from 'react';
import { AppRootProps } from '@grafana/data';
import { upsertDatapoint } from 'api';
import { DatapointForm } from 'forms/DatapointForm';
import { goToDatapoints } from '../navigation';

export const AddDatapoint: FC<AppRootProps> = ({ query }) => {
  const projectName = query['project'];
  const subsystemName = query['subsystem'];

  return (
    <>
      <DatapointForm
        projectName={projectName}
        subsystemName={subsystemName}
        onSubmit={(datapoint) => {
          upsertDatapoint(projectName, subsystemName, datapoint).then(() => goToDatapoints(projectName, subsystemName));
        }}
        onCancel={() => goToDatapoints(projectName, subsystemName)}
      />
    </>
  );
};
