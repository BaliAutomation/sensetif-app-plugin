import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { ProjectSettings, SubsystemSettings } from 'types';
import { Alert, Icon } from '@grafana/ui';
import { goToAddSubsystem, goToDatapoints, goToEditSubsystem, goToProjects } from 'navigation';
import { deleteSubsystem, getProject, getSubsystems } from 'api';
import { CardsList } from 'components/CardsList';
import { PageHeader } from 'components/PageTitle';

export const Subsystems: FC<AppRootProps> = ({ query }) => {
  const projectName: string = query['project'];

  const [project, setProject] = useState<ProjectSettings>();
  const [subsystems, setSubsystems] = useState<SubsystemSettings[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchErr, setFetchErr] = useState(undefined);

  useEffect(() => {
    setIsLoading(true);
    setFetchErr(undefined);
    Promise.all([loadProject(projectName), loadSubsystems(projectName)])
      .catch((err) => {
        setFetchErr(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [projectName]);

  const loadProject = (name: string) =>
    getProject(name).then((res: ProjectSettings) => {
      setProject(res);
    });

  const loadSubsystems = (projectName: string) =>
    getSubsystems(projectName).then((res: SubsystemSettings[]) => {
      setSubsystems(res);
    });

  const removeSubsystem = (name: string): Promise<void> =>
    deleteSubsystem(projectName, name).then(() => loadSubsystems(projectName));

  if (fetchErr) {
    return (
      <Alert title={'Fetch error'} severity={'error'}>
        {JSON.stringify(fetchErr, null, 2)}
      </Alert>
    );
  }

  return (
    <>
      <PageHeader
        title={project?.title}
        subtitle={project?.name}
        primaryText={'Add Subsystem'}
        onPrimaryClick={() => goToAddSubsystem(projectName)}
        secondaryText={'Back'}
        onSecondaryClick={() => goToProjects()}
      />

      {!isLoading && subsystems.length === 0 && (
        <Alert severity="info" title="Please add subsystems.">
          <div>
            <p style={{ marginBottom: '16px' }}>
              Subsystem typically represents one device or a collection of devices that perform a function together.
            </p>
          </div>
          <a href="https://sensetif.com/docs/projects-info.html" className="external-link">
            <Icon name="book" />
            Read more
          </a>
        </Alert>
      )}
      <CardsList<SubsystemSettings>
        isLoading={isLoading}
        elements={subsystems}
        onClick={(subsystem) => {
          goToDatapoints(projectName, subsystem.name);
        }}
        onEdit={(subsystem) => {
          goToEditSubsystem(projectName, subsystem.name);
        }}
        onDelete={(subsystem) => removeSubsystem(subsystem.name)}
        getTitle={(subsystem) => subsystem.title}
      />
    </>
  );
};
