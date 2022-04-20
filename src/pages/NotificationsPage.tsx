import {
  ApplyFieldOverrideOptions,
  applyFieldOverrides,
  AppRootProps,
  DataQueryResponse,
  LiveChannelScope,
} from '@grafana/data';
import { config, getGrafanaLiveSrv } from '@grafana/runtime';
import { Alert, Table, useTheme2 } from '@grafana/ui';
import React, { FC, useEffect, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

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

  const theme = useTheme2();

  console.log(data);

  if (!foundDs) {
    return <Alert severity="warning" title="Sensetif datasource not found" />;
  }

  if (!data?.data?.[0]) {
    return <div>No notifications</div>;
  }

  let cfg: ApplyFieldOverrideOptions = {
    data: data.data,
    theme: theme!,
    fieldConfig: {
      defaults: {},
      overrides: [],
    },
    replaceVariables: (value: string) => value,
  };

  let dataFrame = applyFieldOverrides(cfg);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h1>Notifications</h1>
      <AutoSizer style={{ width: '100%', height: '500px' }}>
        {({ width, height }) => {
          return <Table width={width} height={height} data={dataFrame[0]} />;
        }}
      </AutoSizer>
    </div>
  );
};
