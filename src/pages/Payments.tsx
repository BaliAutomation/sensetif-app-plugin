import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { logInfo } from '@grafana/runtime';
import { Alert, Icon } from '@grafana/ui';
import { Payment } from '../types';
import { goToAddProject } from 'utils/navigation';
import { getPayments } from 'utils/api';
import { CardsList } from 'components/CardsList';
import { PageHeader } from 'components/PageTitle';

export const Payments: FC<AppRootProps> = ({ query, path, meta }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    logInfo('Trying to fetch Payments.');
    loadPayments();
  }, []);

  const loadPayments = () => {
    setIsLoading(true);
    return getPayments()
      .then((payments) => {
        logInfo('Trying to convert json.');
        setPayments(payments);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <PageHeader title={''} subtitle={''} primaryText={'Add Project'} onPrimaryClick={() => goToAddProject()} />

      {!isLoading && payments.length === 0 && (
        <Alert severity={'info'} title="Please add projects.">
          <div>
            <p style={{ marginBottom: '16px' }}>
              A project contains N subsystems, and a subsystem typically represents one device or a collection of
              devices that perform a function together.
            </p>
          </div>
          <a href="https://sensetif.com/docs/projects-info.html" className="external-link">
            <Icon name="book" />
            Read more
          </a>
        </Alert>
      )}

      <CardsList<Payment>
        isLoading={isLoading}
        elements={payments}
        getTitle={(payment) =>
          payment.paid.getFullYear() +
          '-' +
          payment.paid.getMonth() +
          '-' +
          payment.paid.getDate() +
          '&nbsp;&nbsp;&nbsp;&nbsp;' +
          payment.currency +
          payment.amount
        }
        getSubtitle={(payment) => payment.description}
      />
    </>
  );
};
