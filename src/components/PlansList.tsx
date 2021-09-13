import React from 'react';
import { HorizontalGroup, Container, VerticalGroup, LoadingPlaceholder } from '@grafana/ui';
import { PlanSettings } from '../types';

interface Props<T> {
  isLoading: boolean;
  plans: PlanSettings[];
  onClick: (element: T) => void;
}

export const PlansList = <PlanSettings,>(props: Props<PlanSettings>) => {
  if (props.isLoading) {
    return <LoadingPlaceholder text="Loading..." />;
  }

  return (
    <>
      <div>
        <section className="card-section card-list-layout-list">
          <ol className="card-list">
            {props.plans.map((plan, index) => {
              return (
                <li className="card-item-wrapper" key={index} aria-label="check-card">
                  <div className="card-item" style={{ cursor: 'pointer' }}>
                    <HorizontalGroup justify="space-between">
                      <HorizontalGroup justify="flex-start">
                        <Container margin="xs">
                          <i className={'fa fa-project-diagram'} />
                        </Container>
                        <VerticalGroup>
                          <div className="card-item-name">{plan.name}</div>
                          {plan.description && <div className="card-item-sub-name">{plan.description}</div>}
                        </VerticalGroup>
                      </HorizontalGroup>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div className="card-item-header">
                          <div className="card-item-type">Max Projects: {plan.limits.maxprojects}</div>
                          <div className="card-item-type">Max Datapoints: {plan.limits.maxdatapoints}</div>
                          <div className="card-item-type">Max Collaborators: {plan.limits.maxcollaborators}</div>
                          <div className="card-item-type">Max Storage Period: {plan.limits.maxstorage}</div>
                          <div className="card-item-type">Min Poll Interval: {plan.limits.minpollinterval}</div>
                        </div>
                      </div>
                    </HorizontalGroup>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </>
  );
};
