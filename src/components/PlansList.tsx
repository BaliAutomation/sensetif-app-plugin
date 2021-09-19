import React from 'react';
import { HorizontalGroup, Container, VerticalGroup, LoadingPlaceholder } from '@grafana/ui';
import { PlanSettings } from '../types';
import { PollIntervals, TimeToLivePeriods } from '../utils/consts';

interface Props<T> {
  isLoading: boolean;
  plans: PlanSettings[];
  onClick: (element: T) => void;
}

function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
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
                          <div className="card-item-name">{plan.title}</div>
                          {plan.subtitle && <div className="card-item-type">{plan.subtitle}</div>}
                          <br />
                          {plan.description && <div>{plan.description}</div>}
                          <br />
                          <div>Max Projects: {plan.limits.maxprojects}</div>
                          <div>Max Datapoints: {plan.limits.maxdatapoints}</div>
                          <div>Max Storage Period: {getProperty(TimeToLivePeriods, plan.limits.maxstorage)}</div>
                          <div>Min Poll Interval: {getProperty(PollIntervals, plan.limits.minpollinterval)}</div>
                        </VerticalGroup>
                      </HorizontalGroup>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }} />
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
