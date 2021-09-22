import React from 'react';
import { LoadingPlaceholder } from '@grafana/ui';
import { PlanSettings } from '../types';
import { PlanCard } from './plans/PlanCard';

interface Props {
  isLoading: boolean;
  plans: PlanSettings;
  onClick: (element: PlanSettings) => void;
}

export const PlansList = (props: Props) => {
  if (props.isLoading) {
    return <LoadingPlaceholder text="Loading..." />;
  }

  const prices = (product: any) => props.plans.prices.filter((price) => price.product.id === product.id).reverse();

  return (
    <>
      <section className="card-section card-list-layout-list">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr)' }}>
          {props.plans.products.map((product, index) => (
            <PlanCard key={product.id} aria-label="check-card" product={product} prices={prices(product)} />
          ))}
        </div>
      </section>
    </>
  );
};
