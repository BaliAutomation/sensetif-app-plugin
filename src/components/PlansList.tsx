import React from 'react';
import { LoadingPlaceholder } from '@grafana/ui';
import { PlanSettings } from '../types';
import { PlanCard } from './plans/PlanCard';

interface Props {
  isLoading: boolean;
  plans: PlanSettings[];
  onClick: (element: PlanSettings) => void;
}

export const PlansList = (props: Props) => {
  if (props.isLoading) {
    return <LoadingPlaceholder text="Loading..." />;
  }

  const sortByType = (a: any, b: any) => {
    if (a.recurring.interval === b.recurring.interval) {
      return 0;
    }
    if (a.recurring.interval === 'yearly' && b.recurring.interval === 'monthly') {
      return -1;
    }
    return 1;
  };

  props.plans.forEach((plan) => (plan.prices = plan.prices.sort(sortByType)));

  const getMonthlyPrice = (plan: PlanSettings) => {
    return plan.prices
      .filter((price: any) => price.recurring)
      .find((price: any) => price.recurring.interval === 'month').unit_amount;
  };

  const byMonthlyPrice = (a: PlanSettings, b: PlanSettings) => {
    const monthlyPriceA = getMonthlyPrice(a);
    const monthlyPriceB = getMonthlyPrice(b);

    if (monthlyPriceA > monthlyPriceB) {
      return 1;
    } else if (monthlyPriceA < monthlyPriceB) {
      return -1;
    }
    return 0;
  };

  return (
    <>
      <section className="card-section card-list-layout-list">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr)', gap: '5px' }}>
          {props.plans.sort(byMonthlyPrice).map((plan, _) => (
            <PlanCard key={plan.product.id} aria-label="check-card" plan={plan} selected={plan.selected} />
          ))}
        </div>
      </section>
    </>
  );
};
