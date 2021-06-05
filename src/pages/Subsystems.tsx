import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { ProjectSettings, SubsystemSettings } from 'types';
import { SubsystemsList } from '../components/SubsystemsList';
import { Button, InfoBox, Legend, LoadingPlaceholder } from '@grafana/ui';
import { DeleteCardModal } from 'components/CardActions';
import { goToAddSubsystem } from 'utils/navigation';
import { deleteSubsystem, getProject, getSubsystems } from 'utils/api';

export const Subsystems: FC<AppRootProps> = ({ query }) => {
  const projectName: string = query['project'];

  const [project, setProject] = useState<ProjectSettings>();
  const [subsystems, setSubsystems] = useState<SubsystemSettings[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchErr, setFetchErr] = useState(undefined);

  const [subsystemToBeDeleted, setSubsystemToBeDeleted] = useState<string>();

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
    deleteSubsystem(name).then(() => loadSubsystems(projectName));

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
      <div className="page-action-bar">
        <div className="page-action-bar__spacer" />
        <Legend>
          <div>Project: {project!.name}</div>
        </Legend>
        <Button icon="plus" variant="secondary" onClick={() => goToAddSubsystem(projectName)}>
          Add Subsystem
        </Button>
      </div>
      {subsystems.length === 0 ? (
        <InfoBox title="Please add subsystems." url={'https://sensetif.com/docs/projects-info.html'}>
          <p>Subsystem typically represents one device or a collection of devices that perform a function together.</p>
        </InfoBox>
      ) : (
        <>
          <SubsystemsList subsystems={subsystems} onClick={() => {}} onEdit={() => {}} onDelete={() => {}} />
          <DeleteCardModal
            isOpen={!!subsystemToBeDeleted}
            title={'Delete Subsystem'}
            body={
              <div>
                Are you sure you want to delete this subsystem? <br />
                <small>{"This affect also all subsystems' datapoints."}</small>
              </div>
            }
            onDismiss={() => setSubsystemToBeDeleted(undefined)}
            onConfirm={async () => {
              await removeSubsystem(subsystemToBeDeleted!);
              setSubsystemToBeDeleted(undefined);
            }}
          />
        </>
      )}
    </>
  );
};
