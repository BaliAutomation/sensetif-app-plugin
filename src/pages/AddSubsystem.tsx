import React, { FC } from 'react';
import { AppRootProps } from '@grafana/data';
import { SubsystemForm } from 'forms/SubsystemForm';
import { goToSubsystems } from 'utils/navigation';
import { upsertSubsystem } from 'utils/api';

export const AddSubsystem: FC<AppRootProps> = ({ query }) => {
  const projectName = query['project'];

  return (
    <>
      <SubsystemForm
        onSubmit={(subsystem) => {
          upsertSubsystem(projectName, subsystem).then(() => goToSubsystems(projectName));
        }}
        onCancel={() => goToSubsystems(projectName)}
      />
    </>
  );
};
