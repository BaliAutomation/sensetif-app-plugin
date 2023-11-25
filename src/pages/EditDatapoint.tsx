import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { DatapointSettings, DatasourceType, Ttnv3Datasource } from 'types';
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
    // NOTE: This is while we are ONLY doing POLL types from TTN.
    if (datapoint.datasourcetype === DatasourceType.ttnv3) {
      let ds = datapoint.datasource as Ttnv3Datasource;
      ds.poll = true;
      ds.webhook = false;
      ds.subscribe = false;
    }
    upsertDatapoint(projectName, subsystemName, datapoint)
      .then(() => goToDatapoints(projectName, subsystemName))
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
      {/* TODO: projectName and subsystemName SHOULD use their Title rather than Name. But that will incur 2 extra queries to backend,
                so perhaps wait with this until there is a solid client-side caching for project/subsystem defintions.
      */}
      <DatapointForm
        datapoint={datapoint}
        subsystemTitle={subsystemName}
        projectTitle={projectName}
        onSubmit={(data) => updateDatapoint(data)}
        onCancel={() => goToDatapoints(projectName, subsystemName)}
      />
    </>
  );
};
