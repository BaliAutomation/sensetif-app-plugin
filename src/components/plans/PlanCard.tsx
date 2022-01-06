import { HorizontalGroup, VerticalGroup, Button, Badge } from '@grafana/ui';
import React from 'react';
import { PollIntervals, TimeToLivePeriods } from 'utils/consts';
import { checkout } from '../../utils/api';

interface Props {
  plan: {
    product: any;
    prices: any[];
  };
  selected?: boolean;
}

export const PlanCard = ({ plan, selected }: Props) => {
  const { product, prices } = plan;

  const sortByType = (a: any, b: any) => {
    if (a.recurring?.interval === a.recurring?.interval) {
      return 0;
    }
    if (a.recurring?.interval === 'yearly') {
      return -1;
    }
    return 1;
  };

  return (
    <div aria-label="check-card" className="card-item" style={{ cursor: 'pointer' }}>
      <VerticalGroup>
        <div style={{ marginBottom: '2em' }}>
          {selected && <Badge text="Active Plan" color="green" tooltip="This plan is currently active" />}
          <div className="card-item-name">{product.name}</div>
          <div className="card-item-type">{product.metadata.slogan}</div>
        </div>

        <div style={{ marginBottom: '2em', height: '5em' }}>{product.description}</div>
        <HorizontalGroup justify={'space-between'}>
          <span style={{ fontWeight: 'bold' }}>Max Datapoints:</span> <span>{product.metadata.maxdatapoints}</span>
        </HorizontalGroup>

        <HorizontalGroup justify={'space-between'}>
          <span style={{ fontWeight: 'bold' }}>Max Storage Period:</span> {/* @ts-ignore */}
          <span>{TimeToLivePeriods[product.metadata.maxstorage]}</span>
        </HorizontalGroup>

        <HorizontalGroup justify={'space-between'}>
          <span style={{ fontWeight: 'bold' }}>Min Poll Interval:</span> {/* @ts-ignore */}
          <span>{PollIntervals[product.metadata.minpollinterval]}</span>
        </HorizontalGroup>
        <div style={{ marginTop: '1em' }} />
        {prices.sort(sortByType).map((price) => (
          <Button
            key={price.id}
            className=""
            fullWidth={true}
            type="button"
            onClick={() =>
              checkout(price.id).then((url) => {
                document.location.href = url;
              })
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
