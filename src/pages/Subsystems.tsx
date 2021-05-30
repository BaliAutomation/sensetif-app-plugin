import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { getBackendSrv, getLocationSrv } from '@grafana/runtime';
import { ProjectSettings, SubsystemSettings } from 'types';
import { SubsystemsList } from '../components/SubsystemsList';
import { Button, InfoBox, Legend, LoadingPlaceholder } from '@grafana/ui';
import { DeleteCardModal } from 'components/CardActions';
import { AddSubsystemPage } from 'pages';

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
    getBackendSrv()
      .get(`/api/plugin-proxy/sensetif-app/resources/projects/${name}`)
      .then((res: ProjectSettings) => {
        setProject(res);
      });

  const loadSubsystems = (name: string) =>
    getBackendSrv()
      .get(`/api/plugin-proxy/sensetif-app/resources/projects/${name}/subsystems`)
      .then((res: SubsystemSettings[]) => {
        setSubsystems(res);
      });

  const deleteSubsystem = (name: string): Promise<void> => {
    console.log(`removing subsystem: ${name}`);
    return loadSubsystems(projectName);
  };

  const goToAddNewSubsystem = () => {
    getLocationSrv().update({
      query: {
        tab: AddSubsystemPage.id,
        project: projectName,
      },
    });
  };

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
        <Button icon="plus" variant="secondary" onClick={() => goToAddNewSubsystem()}>
          Add Subsystem
        </Button>
      </div>
      {subsystems.length === 0 ? (
        <InfoBox title="Please add subsystems." url={'https://sensetif.com/docs/projects-info.html'}>
          <p>Subsystem typically represents one device or a collection of devices that perform a function together.</p>
        </InfoBox>
      ) : (
        <>
          <SubsystemsList subsystems={subsystems} />
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
              await deleteSubsystem(subsystemToBeDeleted!);
              setSubsystemToBeDeleted(undefined);
            }}
          />
        </>
      )}
    </>
  );
};
