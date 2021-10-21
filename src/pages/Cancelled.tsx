import React, { FC } from 'react';
import { AppRootProps } from '@grafana/data';
import { cancelled } from 'utils/api';
import { PageHeader } from 'components/PageTitle';
import { goToPlans } from '../utils/navigation';

export const Cancelled: FC<AppRootProps> = ({ query }) => {
  const sessionId: string = query['session_id'];
  cancelled(sessionId).then((resp) => goToPlans());
  return (
    <>
      <PageHeader title="Payment Cancelled or Aborted!" subtitle="Maybe try again?" />
    </>
  );
};
