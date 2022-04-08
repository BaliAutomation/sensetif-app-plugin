import { AppRootProps, DataFrame, DataQueryResponse, Field, LiveChannelScope, Vector } from '@grafana/data';
import { config, getGrafanaLiveSrv } from '@grafana/runtime';
import { Alert, HorizontalGroup, Spinner } from '@grafana/ui';
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
        path: '_errors',
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

  return (
    <>
      <HorizontalGroup>
        {/*Time should be formatted according to Browser preference, not as the String being sent back*/}
        <pre>{JSON.stringify(getLastField((data.data[0] as DataFrame).fields, 'Time'), null, " '")}</pre>
        <pre>{JSON.stringify(getLastField((data.data[0] as DataFrame).fields, 'Source'), null, " '")}</pre>
        <pre>{JSON.stringify(getLastField((data.data[0] as DataFrame).fields, 'Key'), null, " '")}</pre>
        <pre>{JSON.stringify(getLastField((data.data[0] as DataFrame).fields, 'Value'), null, " '")}</pre>
        <pre>{JSON.stringify(getLastField((data.data[0] as DataFrame).fields, 'Message'), null, " '")}</pre>
        {/*Exception needs to be hidden, accessible with a button maybe or an accordion expansion and is multi-line text */}
        <pre>{JSON.stringify(getLastField((data.data[0] as DataFrame).fields, 'Exception'), null, " '")}</pre>
      </HorizontalGroup>
    </>
  );
};

function getLastField(fields: Array<Field<any, Vector<any>>>, name: string): Field<any, Vector<any>> | undefined {
  return fields.filter((f) => f.name === name).pop();
}
