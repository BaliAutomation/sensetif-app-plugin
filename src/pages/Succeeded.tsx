import React, { FC } from 'react';
import { AppRootProps } from '@grafana/data';
import { confirmation } from 'api';
import { PageHeader } from 'components/PageTitle';
import { goToPlans } from '../navigation';

export const Succeeded: FC<AppRootProps> = ({ query }) => {
  const sessionId: string = query['session_id'];
  confirmation(sessionId).then((resp) => goToPlans());
  return (
    <>
      <PageHeader title="Subscription Started" subtitle="Thank You!" />
    </>
  );
};
