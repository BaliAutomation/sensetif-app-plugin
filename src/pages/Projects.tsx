import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { logInfo } from '@grafana/runtime';
import { Button, Alert, Icon } from '@grafana/ui';
import { ProjectSettings } from '../types';
import { goToAddProject, goToEditProject, goToSubsystems } from 'utils/navigation';
import { deleteProject, getProjects } from 'utils/api';
import { CardsList } from 'components/CardsList';

export const Projects: FC<AppRootProps> = ({ query, path, meta }) => {
  const [projects, setProjects] = useState<ProjectSettings[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    logInfo('Trying to fetch Projects.');
    loadProjects();
  }, []);

  const loadProjects = () => {
    setIsLoading(true);
    return getProjects()
      .then((projects) => {
        logInfo('Trying to convert json.');
        setProjects(projects);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const removeProject = (name: string): Promise<void> => {
    logInfo("Deleting project: " + name);
    return deleteProject(name).then(() => loadProjects());
  };

  return (
    <>
      <div className="page-action-bar">
        <div className="page-action-bar__spacer" />
        <Button icon="plus" variant="secondary" onClick={() => goToAddProject()}>
          Add Project
        </Button>
      </div>

      {!isLoading && projects.length === 0 && (
        <Alert severity={'info'} title="Please add projects.">
          <div>
            <p style={{ marginBottom: '16px' }}>
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

      <CardsList<ProjectSettings>
        isLoading={isLoading}
        elements={projects}
        onClick={(project) => goToSubsystems(project.name)}
        onEdit={(project) => goToEditProject(project.name)}
        onDelete={(project) => removeProject(project.name)}
        getSubtitle={(project) => (project.city ? project.city : 'Not specified')}
        getTitle={(project) => project.title}
        getRightSideText={(project) => (project.subsystems?.length ? `${project.subsystems?.length}` : 'No subsystems')}
      />
    </>
  );
};
