import { AppRootProps, dateTimeParse, LiveChannelAddress, LiveChannelEventType, LiveChannelScope } from '@grafana/data';
import { config, getGrafanaLiveSrv } from '@grafana/runtime';
import { Alert } from '@grafana/ui';
import React, { FC, useEffect, useState } from 'react';
import { Table as CustomTable } from '../components/table/Table';

export const NotificationsPage: FC<AppRootProps> = ({ query, path, meta }) => {
  console.log('-- notification page --');

  const sensetifDS = config.datasources['Sensetif'];
  if (!sensetifDS) {
    return <Alert severity="warning" title="Sensetif datasource not found" />;
  }

  return (
    <Notifications
      addr={{
        scope: LiveChannelScope.DataSource,
        namespace: sensetifDS.uid,
        path: '_notifications',
      }}
    />
  );
};

const Notifications = ({ addr }: { addr: LiveChannelAddress }) => {
  const [data, setData] = useState<Notification[]>([]);

  useEffect(() => {
    const stream = getGrafanaLiveSrv().getStream<Notification>(addr);
    stream.subscribe((event) => {
      if (event.type === LiveChannelEventType.Message) {
        // use functional updated to not pass `data` as a dependency
        // otherwise `useEffect` will be triggered too often
        setData((prevData) => {
          // add new message at the beginning of the notifications list
          return [event.message, ...prevData!];
        });
      }
    });
  }, [addr, setData]);

  if (!data?.length) {
    return <div>No notifications</div>;
  }
  return (
    <>
      <CustomTable<TableNotification>
        frame={data.map((n) => ({
          time: dateTimeParse(n.time).toString(),
          source: n.source,
          key: n.key,
          value: Buffer.from(n.value, 'base64').toString(),
          message: n.message,
          exceptionMessage: n.exception?.message,
          exceptionStacktrace: n.exception?.stacktrace,
        }))}
        columns={[
          { id: 'time', displayValue: 'Time' },
          { id: 'source', displayValue: 'Source' },
          { id: 'key', displayValue: 'Key' },
          { id: 'value', displayValue: 'Value' },
          { id: 'message', displayValue: 'Message' },
          { id: 'exceptionMessage', displayValue: 'Exception Message' },
          { id: 'exceptionStacktrace', displayValue: 'Exception Stacktrace' },
        ]}
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
