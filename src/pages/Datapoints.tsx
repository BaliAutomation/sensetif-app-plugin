import React, { FC } from 'react';
import { AppRootProps } from '@grafana/data';
import { DatapointForm } from 'forms/DatapointForm';

export const Datapoints: FC<AppRootProps> = ({ query, path, meta }) => {
  return (
    <DatapointForm
      onSubmit={(data) => {
        console.log(data);
      }}
    />
  );
};
