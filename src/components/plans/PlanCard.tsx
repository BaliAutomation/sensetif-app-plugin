import { getBackendSrv } from '@grafana/runtime';
import { HorizontalGroup, Container, VerticalGroup, Button } from '@grafana/ui';
import React from 'react';
import { PollIntervals, TimeToLivePeriods } from 'utils/consts';

interface Props {
  product: any;
  prices: any[];
}

export const PlanCard = ({ product, prices }: Props) => {
  return (
    <div aria-label="check-card" className="card-item" style={{ cursor: 'pointer', margin: '2px' }}>
      <VerticalGroup>
        <HorizontalGroup justify="flex-start">
          <Container margin="xs">
            <i className={'fa fa-project-diagram'} />
          </Container>
          <VerticalGroup>
            <div style={{ marginBottom: '2em' }}>
              <div className="card-item-name">{product.name}</div>
              <div className="card-item-type">{product.metadata.slogan}</div>
            </div>

            <div style={{ marginBottom: '2em', height: '5em' }}>{product.description}</div>

            <VerticalGroup>
              <HorizontalGroup justify={'space-between'}>
                <span style={{ fontWeight: 'bold' }}>Max Datapoints:</span>{' '}
                <span>{product.metadata.maxdatapoints}</span>
              </HorizontalGroup>

              <HorizontalGroup justify={'space-between'}>
                <span style={{ fontWeight: 'bold' }}>Max Storage Period:</span> {/* @ts-ignore */}
                <span>{TimeToLivePeriods[product.metadata.maxstorage]}</span>
              </HorizontalGroup>

              <HorizontalGroup justify={'space-between'}>
                <span style={{ fontWeight: 'bold' }}>Min Poll Interval:</span> {/* @ts-ignore */}
                <span>{PollIntervals[product.metadata.minpollinterval]}</span>
              </HorizontalGroup>
            </VerticalGroup>
          </VerticalGroup>
        </HorizontalGroup>
        <div style={{ marginTop: '1em' }} />
        {prices.map((price) => (
          <Button
            key={price.id}
            className=""
            fullWidth={true}
            type="button"
            onClick={() =>
              getBackendSrv().post('/api/plugins/sensetif-datasource/resources/_plans/checkout', { price: price.id })
            }
            variant={price?.recurring?.interval === 'year' ? 'primary' : 'secondary'}
            size={price?.recurring?.interval === 'year' ? 'lg' : 'md'}
          >
            {price.recurring ? price.recurring.interval + 'ly' : '10 years'} : &nbsp;
            {price.currency.toUpperCase()} {price.unit_amount / 100}
          </Button>
        ))}
      </VerticalGroup>
    </div>
  );
};
