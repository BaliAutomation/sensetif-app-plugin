import React, { FC } from 'react';
import { AppRootProps } from '@grafana/data';
import { SubsystemForm } from 'forms/SubsystemForm';
import { goToSubsystems } from 'navigation';
import { upsertSubsystem } from 'api';

export const AddSubsystem: FC<AppRootProps> = ({ query }) => {
  const projectName = query['project'];

  return (
    <>
      <SubsystemForm
        projectName={projectName}
        onSubmit={(subsystem) => {
          upsertSubsystem(projectName, subsystem).then(() => goToSubsystems(projectName));
        }}
        onCancel={() => goToSubsystems(projectName)}
      />
    </>
  );
};
