import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { logInfo } from '@grafana/runtime';
import { Button, Alert, Icon } from '@grafana/ui';

import { DatapointSettings } from '../types';
import { deleteDatapoint, getDatapoints } from 'utils/api';
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
    Promise.all([loadDatapoints(projectName, subsystemName)]);
  }, [projectName, subsystemName]);

  const loadDatapoints = (projectName: string, subsystemName: string) => {
    setIsLoading(true);
    getDatapoints(projectName, subsystemName)
      .then((datapoints) => {
        logInfo('Trying to convert json.');
        setDatapoints(datapoints);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const removeDatapoint = (name: string): Promise<void> =>
    deleteDatapoint(projectName, subsystemName, name).then(() => loadDatapoints(projectName, subsystemName));

  return (
    <>
      <div className="page-action-bar">
        <div className="page-action-bar__spacer" />
        <Button icon="plus" variant="secondary" onClick={() => goToAddDatapoint(projectName, subsystemName)}>
          Add Datapoint
        </Button>
      </div>

      {!isLoading && datapoints.length === 0 && (
        <Alert severity="info" title="Please add datapoints.">
          <div>
            <p>
              A project contains N subsystems, and a subsystem typically represents one device or a collection of
              devices that perform a function together.
            </p>
          </div>
          <a href="https://sensetif.com/docs/projects-info.html" className="external-link">
            <Icon name="book" />
            Read more
          </a>
        </Alert>
      )}

      <CardsList<DatapointSettings>
        isLoading={isLoading}
        elements={datapoints}
        onClick={(point) => {}}
        onEdit={(point) => {}}
        onDelete={(point) => removeDatapoint(point.name)}
        getTitle={(point) => point.name}
      />
    </>
  );
};
