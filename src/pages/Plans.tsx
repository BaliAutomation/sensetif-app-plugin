import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { logInfo } from '@grafana/runtime';
import { Alert, Icon } from '@grafana/ui';
import { getPlans } from 'utils/api';
import { PlansList } from '../components/PlansList';
import { PlanSettings } from '../types';

export const Plans: FC<AppRootProps> = ({ query, path, meta }) => {
  const [plans, setPlans] = useState<PlanSettings[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    logInfo('Trying to fetch Plans.');
    loadPlans();
  }, []);

  const selectPlan = (plan: PlanSettings) => {};

  const loadPlans = () => {
    setIsLoading(true);
    return getPlans()
      .then((plans) => {
        logInfo('Trying to convert json.');
        setPlans(plans);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {!isLoading && plans.length === 0 && (
        <Alert severity={'info'} title="Plans are not yet available.">
          <div>
            <p style={{ marginBottom: '16px' }}>Standby while we work out the Plans to offer.</p>
          </div>
          <a href="https://sensetif.com/docs/plans-info.html" className="external-link">
            <Icon name="book" />
            Read more
          </a>
        </Alert>
      )}
      <PlansList isLoading={isLoading} plans={plans} onClick={selectPlan} />
    </>
  );
};
