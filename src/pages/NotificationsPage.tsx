import { AppRootProps, DataFrame, DataQueryResponse, getDataFrameRow, LiveChannelScope } from '@grafana/data';
import { config, getGrafanaLiveSrv } from '@grafana/runtime';
import { Alert, Spinner } from '@grafana/ui';
import React, { FC, useEffect, useState } from 'react';

interface Notification {
  time: string;
  source: string;
  key: string;
  value: string;
  message: string;
  exception?: {
    message: string;
    stackTrace: string;
  };
}

const toNotifications = (data: DataFrame): Notification[] => {
  const notifications: Notification[] = [];

  for (let i = 0; i < data.length; i++) {
    let row = getDataFrameRow(data, i);
    console.log(row);

    let notification: Notification = {
      time: row[0],
      source: row[1],
      key: row[2],
      value: row[3],
      message: row[4],
    };

    const exceptionMessage = row[5];
    const exceptionStackTrace = row[6];

    if (exceptionMessage || exceptionStackTrace) {
      notification = {
        ...notification,
        exception: {
          message: exceptionMessage,
          stackTrace: exceptionStackTrace,
        },
      };
    }

    notifications.push(notification);
  }

  return notifications;
};

export const NotificationsPage: FC<AppRootProps> = ({ query, path, meta }) => {
  const [foundDs, setFoundDs] = useState<boolean>();
  const [data, setData] = useState<DataQueryResponse>();

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

  console.log(data);

  if (!foundDs) {
    return <Alert severity="warning" title="Sensetif datasource not found" />;
  }

  if (!data?.data?.[0]) {
    return <Spinner />;
  }

  const notifications = toNotifications(data.data[0]);

  return (
    <>
      <div>
        <section className="card-section card-list-layout-list">
          <ol className="card-list">
            {notifications.map((val, idx) => {
              return (
                <li className="card-item-wrapper" key={idx} aria-label="check-card">
                  <div className="card-item">
                    <div>Key: {val.key}</div>
                    <div>Source: {val.source}</div>
                    <div>Message: {val.message}</div>
                    <div>Value: {val.value}</div>

                    {val.exception && (
                      <div style={{ marginTop: '5px' }}>
                        <details>
                          <summary>show exception details</summary>
                          <Alert severity="warning" title="exception">
                            <span>{val.exception?.message}</span>
                            <pre>{val.exception?.stackTrace}</pre>
                          </Alert>
                        </details>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </>
  );
};
