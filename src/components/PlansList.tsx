import React from 'react';
import { HorizontalGroup, Container, VerticalGroup, LoadingPlaceholder, Button } from '@grafana/ui';
import { PollIntervals, TimeToLivePeriods } from '../utils/consts';
import { PlanSettings } from '../types';

interface Props {
  isLoading: boolean;
  plans: PlanSettings;
  onClick: (element: PlanSettings) => void;
}

function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}
export const PlansList = (props: Props) => {
  if (props.isLoading) {
    return <LoadingPlaceholder text="Loading..." />;
  }

  return (
    <>
      <section className="card-section card-list-layout-list">
        <form action="/create-checkout-session" method="POST">
          <ol className="card-list">
            {props.plans.products.map((product, index) => {
              return (
                <li className="card-item-wrapper" key={product.id} aria-label="check-card">
                  <div className="card-item" style={{ cursor: 'pointer' }}>
                    <HorizontalGroup justify="space-between">
                      <HorizontalGroup justify="flex-start">
                        <Container margin="xs">
                          <i className={'fa fa-project-diagram'} />
                        </Container>
                        <VerticalGroup>
                          <div className="card-item-name">{product.name}</div>
                          <div className="card-item-type">{product.metadata.slogan}</div>
                          <br />
                          <div>{product.description}</div>
                          <br />
                          <div>Max Datapoints: {product.metadata.maxdatapoints}</div>
                          <div>Max Storage Period: {getProperty(TimeToLivePeriods, product.metadata.maxstorage)}</div>
                          <div>Min Poll Interval: {getProperty(PollIntervals, product.metadata.minpollinterval)}</div>
                        </VerticalGroup>
                        <VerticalGroup>
                          {props.plans.prices
                            .filter((price) => price.product.id === product.id)
                            .reverse()
                            .map((price) => {
                              return (
                                <div key={price.id}>
                                  {price.recurring ? price.recurring.interval : '10 years'} :
                                  {price.currency.toUpperCase()} {price.unit_amount / 100}
                                </div>
                              );
                            })}
                        </VerticalGroup>
                      </HorizontalGroup>
                    </HorizontalGroup>
                    <Button className="button-red" type="submit">
                      Subscribe!
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        </form>
      </section>
    </>
  );
};
