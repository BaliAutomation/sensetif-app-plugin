import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { logInfo } from '@grafana/runtime';
import { Alert, Icon } from '@grafana/ui';

import { PlanSettings } from '../types';
import { getPlans } from 'utils/api';
import { PageHeader } from 'components/PageTitle';
import { PlansList } from '../components/PlansList';

export const Plans: FC<AppRootProps> = ({ query, path, meta }) => {
  const [plans, setPlans] = useState<PlanSettings[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    logInfo('Trying to fetch plans.');
    loadPlans();
  }, []);

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
      <PageHeader title="Plans" subtitle="A plan for every need." />

      {!isLoading && plans.length === 0 && (
        <Alert severity="info" title="No Plans are available at the moment.">
          <div>
            <p>
              A Plan is a billing scheme tailored for ease of cost oversight, yet flexible enough to handle most
              users&apos; needs.
            </p>
          </div>
          <a href="https://sensetif.com/docs/plans-info.html" className="external-link">
            <Icon name="book" />
            Read more
          </a>
        </Alert>
      )}

      <PlansList<PlanSettings> isLoading={isLoading} plans={plans} onClick={(plan) => logInfo('onClick!!!!')} />
    </>
  );
};
