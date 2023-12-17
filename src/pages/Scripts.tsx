import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { logInfo } from '@grafana/runtime';
import { Alert } from '@grafana/ui';
import { Script } from '../types';
import { goToAddScript } from 'utils/navigation';
import { listScripts } from 'utils/api';
import { CardsList } from 'components/CardsList';
import { PageHeader } from 'components/PageTitle';

export const Scripts: FC<AppRootProps> = ({ query, path, meta }) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    logInfo('Trying to fetch scripts.');
    loadScripts();
  }, []);

  const loadScripts = () => {
    setIsLoading(true);
    return listScripts()
      .then((scripts) => {
        logInfo('Trying to convert json.');
        setScripts(scripts);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };


  return (
    <>
      <PageHeader title={''} subtitle={''}
        primaryText={'Add Script'}
        onPrimaryClick={() => goToAddScript()} secondaryIcon={'plus-circle'}
      />
      {!isLoading && scripts.length === 0 && (
        <Alert severity={'info'} title="Please add scripts." />
      )}

      <CardsList<Script>
        isLoading={isLoading}
        elements={scripts}
        getSubtitle={(script) => `scope: ${script.scope}; language: ${script.language}`}
        getTitle={(script) => script.name}
      />
    </>
  );
};
