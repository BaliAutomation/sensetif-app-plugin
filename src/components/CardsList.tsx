import { HorizontalGroup, Container, VerticalGroup } from '@grafana/ui';
import React from 'react';
import { CardActions } from './CardActions';

interface Props<T> {
  elements: T[];

  getTitle: (element: T) => string;
  getSubtitle?: (element: T) => string;
  getRightSideText?: (element: T) => string;

  onDelete: (element: T) => void;
  onEdit: (element: T) => void;
  onClick: (element: T) => void;
}
export const CardsList = <ObjectType,>(props: Props<ObjectType>) => {
  return (
    <div>
      <section className="card-section card-list-layout-list">
        <ol className="card-list">
          {props.elements.map((element, index) => {
            return (
              <li className="card-item-wrapper" key={index} aria-label="check-card">
                <div className="card-item" onClick={() => props.onClick(element)} style={{ cursor: 'pointer' }}>
                  <HorizontalGroup justify="space-between">
                    <HorizontalGroup justify="flex-start">
                      <Container margin="xs">
                        <i className={'fa fa-project-diagram'} />
                      </Container>
                      <VerticalGroup>
                        <div className="card-item-name">{props.getTitle(element)}</div>
                        {props.getSubtitle && <div className="card-item-sub-name">{props.getSubtitle(element)}</div>}
                      </VerticalGroup>
                    </HorizontalGroup>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      {props.getRightSideText && (
                        <div className="card-item-header">
                          <div className="card-item-type">{props.getRightSideText(element)}</div>
                        </div>
                      )}
                      <CardActions
                        onEdit={() => props.onEdit(element)}
                        onDelete={() => {
                          props.onDelete(element);
                        }}
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
