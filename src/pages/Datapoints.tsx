import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { logInfo } from '@grafana/runtime';
import { InfoBox, Button } from '@grafana/ui';

import { DatapointSettings } from '../types';
import { getDatapoints } from 'utils/api';
import { goToAddDatapoint } from 'utils/navigation';
import { CardsList } from 'components/CardsList';

export const Datapoints: FC<AppRootProps> = ({ query, path, meta }) => {
  const projectName: string = query['project'];
  const subsystemName: string = query['subsystem'];

  const [datapoints, setDatapoints] = useState<DatapointSettings[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    logInfo('Trying to fetch datapoints.');
    loadProjects();
  }, []);

  const loadProjects = () => {
    setIsLoading(true);
    return getDatapoints()
      .then((datapoints) => {
        logInfo('Trying to convert json.');
        setDatapoints(datapoints);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteDatapoint = (name: string): Promise<void> => {
    console.log(`removing datapoint: ${name}`);
    return loadProjects();
  };

  return (
    <>
      <div className="page-action-bar">
        <div className="page-action-bar__spacer" />
        <Button icon="plus" variant="secondary" onClick={() => goToAddDatapoint(projectName, subsystemName)}>
          Add Datapoint
        </Button>
      </div>
      {datapoints.length === 0 ? (
        <InfoBox title="Please add datapoints." url={'https://sensetif.com/docs/projects-info.html'}>
          <p>
            A project contains N subsystems, and a subsystem typically represents one device or a collection of devices
            that perform a function together.
          </p>
        </InfoBox>
      ) : (
        <>
          <CardsList<DatapointSettings>
            isLoading={isLoading}
            elements={datapoints}
            onClick={(point) => {}}
            onEdit={(point) => {}}
            onDelete={(point) => deleteDatapoint(point.name)}
            getTitle={(point) => point.name}
          />
        </>
      )}
    </>
  );
};
