import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { SubsystemSettings } from 'types';
import { Alert, LoadingPlaceholder } from '@grafana/ui';
import { getSubsystem, upsertSubsystem } from 'api';
import { goToSubsystems } from 'navigation';
import { SubsystemForm } from 'forms/SubsystemForm';
import { logError } from '@grafana/runtime';

export const EditSubsystem: FC<AppRootProps> = ({ query }) => {
  const projectName: string = query['project'];
  const subsystemName: string = query['subsystem'];

  const [subsystem, setSubsystem] = useState<SubsystemSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchErr, setFetchErr] = useState(undefined);

  useEffect(() => {
    loadSubsystem(projectName, subsystemName);
  }, [projectName, subsystemName]);

  const loadSubsystem = (project: string, subsystem: string) => {
    setIsLoading(true);
    setFetchErr(undefined);
    return getSubsystem(project, subsystem)
      .then((sub) => setSubsystem(sub))
      .catch((err) => {
        logError(err);
        setFetchErr(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateSubsystem = (sub: SubsystemSettings) => {
    upsertSubsystem(projectName, sub)
      .then(() => goToSubsystems(projectName))
      .catch((err) => logError(err));
  };

  if (isLoading) {
    return <LoadingPlaceholder text="Loading..." />;
  }

  if (fetchErr) {
    return (
      <Alert title={'Fetch error'} severity={'error'}>
        {JSON.stringify(fetchErr, null, 2)}
      </Alert>
    );
  }

  return (
    <>
      <SubsystemForm
        subsystem={subsystem}
        projectName={projectName}
        onSubmit={(data) => updateSubsystem(data)}
        onCancel={() => goToSubsystems(projectName)}
      />
    </>
  );
};
