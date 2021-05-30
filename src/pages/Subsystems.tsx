import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { ProjectSettings, SubsystemSettings } from 'types';
import { SubsystemsList } from '../components/SubsystemsList';
import { InfoBox, Legend, LoadingPlaceholder } from '@grafana/ui';

export const Subsystems: FC<AppRootProps> = ({ query }) => {
  const name: string = query['project'];

  const [project, setProject] = useState<ProjectSettings>();
  const [subsystems, setSubsystems] = useState<SubsystemSettings[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchErr, setFetchErr] = useState(undefined);

  useEffect(() => {
    setIsLoading(true);
    setFetchErr(undefined);
    Promise.all([
      getBackendSrv()
        .get(`/api/plugin-proxy/sensetif-app/resources/projects/${name}`)
        .then((res: ProjectSettings) => {
          setProject(res);
        }),
      getBackendSrv()
        .get(`/api/plugin-proxy/sensetif-app/resources/projects/${name}/subsystems`)
        .then((res: SubsystemSettings[]) => {
          setSubsystems(res);
        }),
    ])
      .catch((err) => {
        console.log('err:');
        console.log(err);
        setFetchErr(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [name]);

  if (isLoading) {
    return <LoadingPlaceholder text="Loading..." />;
  }

  if (fetchErr) {
    return (
      <InfoBox title={'Fetch error'} severity={'error'}>
        {JSON.stringify(fetchErr, null, 2)}
      </InfoBox>
    );
  }

  return (
    <>
      <Legend>
        <div>{project!.name} subsystems:</div>
      </Legend>
      <SubsystemsList subsystems={subsystems} />
    </>
  );
};
