import {
  AppRootProps,
  DataFrame,
  DataQueryResponse,
  dateTimeParse,
  getDataFrameRow,
  LiveChannelScope,
} from '@grafana/data';
import { config, getGrafanaLiveSrv } from '@grafana/runtime';
import { Alert } from '@grafana/ui';
import React, { FC, useEffect, useState } from 'react';
import { Table as CustomTable } from '../components/table/Table';

export const NotificationsPage: FC<AppRootProps> = ({ query, path, meta }) => {
  const [foundDs, setFoundDs] = useState<boolean>();
  const [data, setData] = useState<DataQueryResponse>();

  const [notifications, setNotifications] = useState<Notification[]>();

  //  subscribe to live stream
  useEffect(() => {
    const sensetifDs = config.datasources['Sensetif'];
    if (!sensetifDs) {
      console.warn('sensetif datasource not found');
      return;
    }
    setFoundDs(true);
    const stream = getGrafanaLiveSrv().getDataStream({
      addr: {
        scope: LiveChannelScope.DataSource,
        namespace: sensetifDs.uid,
        path: '_notifications',
      },
    });

    stream.subscribe(setData);
  }, []);

  // convert dataframe to plain objects array (displayable by table)
  useEffect(() => {
    if (!data?.data?.[0]) {
      return;
    }

    const notifications = toNotifications(data.data[0]);
    setNotifications(notifications);
  }, [data]);

  if (!foundDs) {
    return <Alert severity="warning" title="Sensetif datasource not found" />;
  }

  if (!notifications?.length) {
    return <div>No notifications</div>;
  }
  return (
    <>
      <CustomTable frame={notifications} hiddenColumns={['value', 'exceptionMessage', 'exceptionStackTrace']} />
    </>
  );
};

interface Notification {
  time: string;
  source: string;
  key: string;
  value: string;
  message: string;
  exceptionMessage?: string;
  exceptionStackTrace?: string;
}

const toNotifications = (data: DataFrame): Notification[] => {
  const notifications: Notification[] = [];

  for (let i = 0; i < data.length; i++) {
    let row = getDataFrameRow(data, i);

    notifications.push({
      time: dateTimeParse(row[0]).toString(),
      source: row[1],
      key: row[2],
      value: row[3],
      message: row[4],
      exceptionMessage: row[5],
      exceptionStackTrace: row[6],
    });
  }

  return notifications;
};
