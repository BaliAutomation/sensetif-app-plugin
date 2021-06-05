import React, { FC } from 'react';
import { AppRootProps } from '@grafana/data';
import { SubsystemForm } from 'forms/SubsystemForm';
import { goToProjects } from 'utils/navigation';
import { addSubsystem } from 'utils/api';

export const AddSubsystem: FC<AppRootProps> = ({ query }) => {
  const projectName = query['project'];

  return (
    <>
      <SubsystemForm
        onSubmit={(subsystem) => {
          addSubsystem(projectName, subsystem).then(() => goToProjects());
        }}
      />
    </>
  );
};
