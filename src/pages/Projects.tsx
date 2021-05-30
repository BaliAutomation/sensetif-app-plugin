import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { ProjectsList } from '../components/ProjectsList';
import { ProjectSettings } from '../types';
import { getBackendSrv, getLocationSrv, logInfo } from '@grafana/runtime';
import { InfoBox, Button, LoadingPlaceholder } from '@grafana/ui';
import { AddProjectPage } from 'pages';
import { DeleteCardModal } from 'components/CardActions';

export const Projects: FC<AppRootProps> = ({ query, path, meta }) => {
  console.log(query);
  console.log(path);
  const [projects, setProjects] = useState<ProjectSettings[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [projectToBeDeleted, setProjectToBeDeleted] = useState<string>();

  useEffect(() => {
    setIsLoading(true);
    logInfo('Trying to fetch Projects.');
    loadProjects();
  }, []);

  const loadProjects = () => {
    setIsLoading(true);
    return (
      getBackendSrv()
        // .get(`/api/plugins/bali-automation-sensetif-datasource-plugin/resources/projects`)
        .get('/api/plugin-proxy/sensetif-app/resources/projects')
        .then((res: ProjectSettings[]) => {
          logInfo('Trying to convert json.');
          setProjects(res);
        })
        .finally(() => {
          setIsLoading(false);
        })
    );
  };

  const deleteProject = (name: string): Promise<void> => {
    console.log(`removing project: ${name}`);
    return loadProjects();
  };

  const goToAddNewProject = () => {
    getLocationSrv().update({
      query: {
        tab: AddProjectPage.id,
      },
    });
  };

  if (isLoading) {
    return <LoadingPlaceholder text="Loading..." />;
  }

  return (
    <>
      <div className="page-action-bar">
        <div className="page-action-bar__spacer" />
        <Button icon="plus" variant="secondary" onClick={() => goToAddNewProject()}>
          Add Project
        </Button>
      </div>
      {projects.length === 0 ? (
        <InfoBox title="Please add projects." url={'https://sensetif.com/docs/projects-info.html'}>
          <p>
            A project contains N subsystems, and a subsystem typically represents one device or a collection of devices
            that perform a function together.
          </p>
        </InfoBox>
      ) : (
        <>
          <ProjectsList projects={projects} onDelete={(name) => setProjectToBeDeleted(name)} />
          <DeleteCardModal
            isOpen={!!projectToBeDeleted}
            title={'Delete Project'}
            body={
              <div>
                Are you sure you want to delete this project? <br />
                <small>{"This affect project's subsystems and all realted data."}</small>
              </div>
            }
            onDismiss={() => setProjectToBeDeleted(undefined)}
            onConfirm={async () => {
              await deleteProject(projectToBeDeleted!);
              setProjectToBeDeleted(undefined);
            }}
          />
        </>
      )}
    </>
  );
};
