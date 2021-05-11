import React, { FC } from 'react';
import { Button, Container, HorizontalGroup, InfoBox, VerticalGroup } from '@grafana/ui';
import { ProjectSettings } from '../types';
import { logInfo } from '@grafana/runtime';

interface Props {
  projects: ProjectSettings[];
}

export const ProjectsList: FC<Props> = ({ projects }) => {
  function addNewProject() {
    logInfo(`addNewProject!`);
  }

  if (projects.length === 0) {
    return (
      <div>
        <div className="page-action-bar">
          <div className="page-action-bar__spacer" />
          <Button onClick={addNewProject} icon="plus" variant="secondary">
            Add Project
          </Button>
        </div>
        <InfoBox title="Please add projects." url={'https://sensetif.com/docs/projects-info.html'}>
          <p>
            A project contains N subsystems, and a subsystem typically represents one device or a collection of devices
            that perform a function together.
          </p>
        </InfoBox>
      </div>
    );
  }
  return (
    <div>
      <div className="page-action-bar">
        <div className="page-action-bar__spacer" />
        <Button onClick={addNewProject} icon="plus" variant="secondary">
          Add Project
        </Button>
      </div>

      <section className="card-section card-list-layout-list">
        <ol className="card-list">
          {projects.map((project, index) => {
            const subsystems = project.subsystems?.length ? `${project.subsystems?.length}` : 'No subsystems';
            const city = project.city ? project.city : 'Not specified';

            return (
              <li className="card-item-wrapper" key={index} aria-label="check-card">
                <a className="card-item" href={`projects/${project.name}`}>
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

                    <HorizontalGroup justify="flex-end">
                      {!project.subsystems?.length && (
                        <div className="card-item-header">
                          <div className="card-item-type">{subsystems}</div>
                        </div>
                      )}
                    </HorizontalGroup>
                  </HorizontalGroup>
                </a>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
};
