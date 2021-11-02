import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { DatapointSettings } from 'types';
import { Alert, LoadingPlaceholder } from '@grafana/ui';
import { getDatapoint, upsertDatapoint } from 'utils/api';
import { goToDatapoints } from 'utils/navigation';
import { DatapointForm } from 'forms/DatapointForm';
import { logError } from '@grafana/runtime';

export const EditDatapoint: FC<AppRootProps> = ({ query }) => {
  const projectName: string = query['project'];
  const subsystemName: string = query['subsystem'];
  const datapointName: string = query['datapoint'];

  const [datapoint, setDatapoint] = useState<DatapointSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchErr, setFetchErr] = useState(undefined);

  useEffect(() => {
    loadDatapoint(projectName, subsystemName, datapointName);
  }, [projectName, subsystemName, datapointName]);

  const loadDatapoint = (project: string, subsystem: string, datapoint: string) => {
    setIsLoading(true);
    setFetchErr(undefined);
    return getDatapoint(project, subsystem, datapoint)
      .then((dp) => setDatapoint(dp))
      .catch((err) => {
        logError(err);
        setFetchErr(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateDatapoint = (datapoint: DatapointSettings) => {
    upsertDatapoint(projectName, subsystemName, datapoint)
      .then(() => goToDatapoints(projectName, subsystemName))
      .catch((err) => logError(err));
  };

  if (isLoading) {
    return <LoadingPlaceholder text="Loading..."/>;
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
      <DatapointForm
        datapoint={datapoint}
        subsystemName={subsystemName}
        projectName={projectName}
        onSubmit={(data) => updateDatapoint(data)}
        onCancel={() => goToDatapoints(projectName, subsystemName)}
      />
    </>
  );
};
