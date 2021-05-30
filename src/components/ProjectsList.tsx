import React, { FC } from 'react';
import { Container, HorizontalGroup, VerticalGroup } from '@grafana/ui';
import { ProjectSettings } from '../types';
import { EditProjectPage, SubsystemsPage } from 'pages';
import { getLocationSrv } from '@grafana/runtime';
import { CardActions } from './CardActions';

interface Props {
  projects: ProjectSettings[];
  onDelete: (name: string) => void;
}

export const ProjectsList: FC<Props> = ({ projects, onDelete }) => {
  const goToSubsystems = (projectName: string) => {
    getLocationSrv().update({
      query: {
        tab: SubsystemsPage.id,
        project: projectName,
      },
    });
  };

  const goToEditProject = (projectName: string) => {
    getLocationSrv().update({
      query: {
        tab: EditProjectPage.id,
        project: projectName,
      },
    });
  };

  return (
    <div>
      <section className="card-section card-list-layout-list">
        <ol className="card-list">
          {projects.map((project, index) => {
            const subsystems = project.subsystems?.length ? `${project.subsystems?.length}` : 'No subsystems';
            const city = project.city ? project.city : 'Not specified';

            return (
              <li className="card-item-wrapper" key={index} aria-label="check-card">
                <div className="card-item" onClick={() => goToSubsystems(project.name)} style={{ cursor: 'pointer' }}>
                  <HorizontalGroup justify="space-between">
                    <HorizontalGroup justify="flex-start">
                      <Container margin="xs">
                        <i className={'fa fa-project-diagram'} />
                      </Container>
                      <VerticalGroup>
                        <div className="card-item-name">{project.title}</div>
                        <div className="card-item-sub-name">{city}</div>
                      </VerticalGroup>
                    </HorizontalGroup>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      {!project.subsystems?.length && (
                        <div className="card-item-header">
                          <div className="card-item-type">{subsystems}</div>
                        </div>
                      )}
                      <CardActions
                        onEdit={() => goToEditProject(project.name)}
                        onDelete={() => onDelete(project.name)}
                      />
                    </div>
                  </HorizontalGroup>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
};
