import { AppRootProps, DataFrame, DataQueryResponse, getDataFrameRow, LiveChannelScope } from '@grafana/data';
import { config, getGrafanaLiveSrv } from '@grafana/runtime';
import { Alert, Spinner } from '@grafana/ui';
import { Event as TimelineEvent, Timeline } from 'components/Timeline';
import React, { FC, useEffect, useState } from 'react';

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

  const events: TimelineEvent[] = [];
  const df = data.data[0] as DataFrame;

  for (let i = 0; i < df.length; i++) {
    let row = getDataFrameRow(df, i);
    console.log(row);

    let event: TimelineEvent = {
      time: new Date(row[0]),
      subtitle: `source: ${row[1]}; key: ${row[2]}`,
      title: row[4],
      content: row[3],
    };

    if (row[5] && row[6]) {
      event.details = (
        <>
          <p>{row[5]}</p>
          <pre>{row[6]}</pre>
        </>
      );
    }

    events.push(event);
  }

  return (
    <>
      <Timeline events={events} reversed />
    </>
  );
};
