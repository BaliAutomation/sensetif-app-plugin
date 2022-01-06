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
  let w = window as any;
  w.niclas = { pre: {}, post: {}, queue: [] };

  const sortByType = (a: any, b: any) => {
    let result;
    if (a.recurring.interval.unit_amount === b.recurring.interval.unit_amount) {
      result = 0;
    } else if (a.recurring.interval.unit_amount > b.recurring.interval.unit_amount) {
      result = -1;
    } else {
      result = 1;
    }
    w.niclas.queue.push(result);
    return result;
  };

  props.plans.forEach((plan) => {
    w.niclas.pre[plan.product.id] = plan.prices;
    plan.prices = plan.prices.sort(sortByType);
    w.niclas.post[plan.product.id] = plan.prices;
    return plan.prices;
  });

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
