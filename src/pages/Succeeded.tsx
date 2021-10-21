import React, { FC } from 'react';
import { AppRootProps } from '@grafana/data';
import { confirmation } from 'utils/api';
import { PageHeader } from 'components/PageTitle';
import { goToPayments } from '../utils/navigation';

export const Succeeded: FC<AppRootProps> = ({ query }) => {
  const sessionId: string = query['session_id'];
  confirmation(sessionId).then((resp) => goToPayments());
  return (
    <>
      <PageHeader title="Subscription Started" subtitle="Thank You!" />
    </>
  );
};
