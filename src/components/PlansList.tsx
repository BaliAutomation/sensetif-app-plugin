import React from 'react';
import { Button, Container, HorizontalGroup, LoadingPlaceholder, VerticalGroup } from '@grafana/ui';
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
                              //TODO: We must use Grafana's Forms, so that session data is transferred in the request
                              //TODO: This layout is super messy, and hoping grzegorekb will fix it.
                              <form
                                key={price.id}
                                action="http://localhost:3000/api/plugins/sensetif-datasource/resources/_plans/checkout"
                                method="POST"
                              >
                                <input type="hidden" name="price" value={price.id} />
                                <Button className="" type="submit">
                                  {price.recurring ? price.recurring.interval + 'ly' : '10 years'} : &nbsp;
                                  {price.currency.toUpperCase()} {price.unit_amount / 100}
                                </Button>
                              </form>
                            );
                          })}
                      </VerticalGroup>
                    </HorizontalGroup>
                  </HorizontalGroup>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
};
