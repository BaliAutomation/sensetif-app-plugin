import { HorizontalGroup, Container, VerticalGroup, Button } from '@grafana/ui';
import React from 'react';
import { PollIntervals, TimeToLivePeriods } from 'utils/consts';

interface Props {
  product: any;
  prices: any[];
}

export const PlanCard = ({ product, prices }: Props) => {
  return (
    <div aria-label="check-card" className="card-item" style={{ cursor: 'pointer', margin: '2px', flex: 1, width: 0 }}>
      <VerticalGroup>
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
            {/* @ts-ignore */}
            <div>Max Storage Period: {TimeToLivePeriods[product.metadata.maxstorage]}</div>
            {/* @ts-ignore */}
            <div>Min Poll Interval: {PollIntervals[product.metadata.minpollinterval]}</div>
          </VerticalGroup>
        </HorizontalGroup>
        <HorizontalGroup wrap>
          {prices.map((price) => {
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
        </HorizontalGroup>
      </VerticalGroup>
    </div>
  );
};
