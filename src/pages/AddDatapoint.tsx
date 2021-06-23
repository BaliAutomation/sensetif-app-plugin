import React, { FC } from 'react';
import { AppRootProps } from '@grafana/data';
import { upsertDatapoint } from 'utils/api';
import { DatapointForm } from 'forms/DatapointForm';
import { goToDatapoints } from '../utils/navigation';

export const AddDatapoint: FC<AppRootProps> = ({ query }) => {
  const projectName = query['project'];
  const subsystemName = query['subsystem'];

  return (
    <>
      <DatapointForm
        onSubmit={(datapoint) => {
          upsertDatapoint(projectName, subsystemName, datapoint).then(() => goToDatapoints(projectName, subsystemName));
        }}
      />
    </>
  );
};
