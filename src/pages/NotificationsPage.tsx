import { AppRootProps, dateTimeParse, LiveChannelEventType, LiveChannelScope } from '@grafana/data';
import { config, getGrafanaLiveSrv } from '@grafana/runtime';
import { Alert } from '@grafana/ui';
import React, { FC, useEffect, useState } from 'react';
import { Table as CustomTable } from '../components/table/Table';

export const NotificationsPage: FC<AppRootProps> = ({ query, path, meta }) => {
  const [foundDs, setFoundDs] = useState<boolean>();
  const [data, setData] = useState<Notification[]>([]);

  //  subscribe to live stream
  useEffect(() => {
    const sensetifDs = config.datasources['Sensetif'];
    if (!sensetifDs) {
      console.warn('sensetif datasource not found');
      return;
    }
    setFoundDs(true);
    const stream = getGrafanaLiveSrv().getStream<Notification>({
      scope: LiveChannelScope.DataSource,
      namespace: sensetifDs.uid,
      path: '_notifications',
    });

    stream.subscribe((event) => {
      if (event.type === LiveChannelEventType.Message) {
        setData([...data!, event.message]);
      }
    });
  }, [setFoundDs, data]);

  if (!foundDs) {
    return <Alert severity="warning" title="Sensetif datasource not found" />;
  }

  if (!data?.length) {
    return <div>No notifications</div>;
  }

  // console.log(data);

  return (
    <>
      <CustomTable<TableNotification>
        frame={data.map((n) => ({
          time: dateTimeParse(n.time).toString(),
          source: n.source,
          key: n.key,
          value: n.value,
          message: n.message,
          exceptionMessage: n.exception?.message,
          exceptionStacktrace: n.exception?.stacktrace,
        }))}
        hiddenColumns={['value', 'exceptionMessage', 'exceptionStacktrace']}
      />
    </>
  );
};

interface Notification {
  time: string;
  source: string;
  key: string;
  value: string;
  message: string;
  exception?: {
    message: string;
    stacktrace: string;
  };
}

interface TableNotification {
  time: string;
  source: string;
  key: string;
  value: string;
  message: string;
  exceptionMessage?: string;
  exceptionStacktrace?: string;
}
