import React, { FC } from 'react';
import { Card, Container, HorizontalGroup, IconButton, VerticalGroup } from '@grafana/ui';
import { SubsystemSettings } from '../types';

interface Props {
  subsystems: SubsystemSettings[];
}

export const SubsystemsList: FC<Props> = ({ subsystems }) => {
  return (
    <div>
      <section className="card-section card-list-layout-list">
        <ol className="card-list">
          {subsystems.map((subsystem, index) => {
            const datapoints = subsystem.datapoints?.length ? `${subsystem.datapoints?.length}` : 'No datapoints';
            return (
              <li className="card-item-wrapper" key={index} aria-label="check-card">
                <div className="card-item" style={{ cursor: 'pointer' }}>
                  <HorizontalGroup justify="space-between">
                    <HorizontalGroup justify="flex-start">
                      <Container margin="xs">
                        <i className={'fa fa-project-diagram'} />
                      </Container>
                      <VerticalGroup>
                        <div className="card-item-name">{subsystem.name}</div>
                        <div className="card-item-sub-name">{subsystem.locallocation}</div>
                      </VerticalGroup>
                    </HorizontalGroup>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      {!subsystem.datapoints?.length && (
                        <div className="card-item-header">
                          <div className="card-item-type">{datapoints}</div>
                        </div>
                      )}
                      <Card.SecondaryActions>
                        <IconButton
                          key="edit"
                          name="edit"
                          tooltip="Edit this project"
                          onClick={() => {
                            console.log('edit subsystem...');
                          }}
                        />
                        <IconButton
                          key="delete"
                          name="trash-alt"
                          tooltip="Delete this project"
                          onClick={(e) => {
                            console.log('');
                            // onDelete(project.name);
                          }}
                        />
                      </Card.SecondaryActions>
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
