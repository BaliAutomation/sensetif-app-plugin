import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { logInfo } from '@grafana/runtime';
import { Alert, Icon } from '@grafana/ui';

import { DatapointSettings, SubsystemSettings } from '../types';
import { deleteDatapoint, getDatapoints, getSubsystem } from 'utils/api';
import { goToAddDatapoint, goToEditDatapoint, goToSubsystems } from 'utils/navigation';
import { CardsList } from 'components/CardsList';
import { PageHeader } from 'components/PageTitle';

export const Datapoints: FC<AppRootProps> = ({ query, path, meta }) => {
  const projectName: string = query['project'];
  const subsystemName: string = query['subsystem'];

  const [datapoints, setDatapoints] = useState<DatapointSettings[]>([]);
  const [subsystem, setSubsystem] = useState<SubsystemSettings>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    logInfo('Trying to fetch datapoints.');
    Promise.all([loadSubsystem(projectName, subsystemName), loadDatapoints(projectName, subsystemName)]).then((_) =>
      setIsLoading(false)
    );
  }, [projectName, subsystemName]);

  const loadDatapoints = (projectName: string, subsystemName: string) =>
    getDatapoints(projectName, subsystemName).then((datapoints) => {
      logInfo('Trying to convert json.');
      setDatapoints(datapoints);
    });

  const loadSubsystem = (projectName: string, subsystemName: string) =>
    getSubsystem(projectName, subsystemName).then((res: SubsystemSettings) => {
      setSubsystem(res);
    });

  const removeDatapoint = (name: string): Promise<void> =>
    deleteDatapoint(projectName, subsystemName, name).then(() => loadDatapoints(projectName, subsystemName));

  return (
    <>
      <PageHeader
        title={subsystem?.title}
        subtitle={subsystem && `${projectName} - ${subsystemName}`}
        primaryText={'Add Datapoint'}
        onPrimaryClick={() => goToAddDatapoint(projectName, subsystemName)}
        secondaryText={'Back'}
        onSecondaryClick={() => goToSubsystems(projectName)}
      />

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
        onClick={(point) => {
          goToEditDatapoint(projectName, subsystemName, point.name);
        }}
        onEdit={(point) => {
          goToEditDatapoint(projectName, subsystemName, point.name);
        }}
        onDelete={(point) => removeDatapoint(point.name)}
        getTitle={(point) => point.name}
      />
    </>
  );
};
