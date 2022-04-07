import React, { FC, useEffect, useState } from 'react';
import { AppRootProps, DataFrame, DataQueryResponse, Field, LiveChannelScope, Vector } from '@grafana/data';
import { getGrafanaLiveSrv, config } from '@grafana/runtime';
import { HorizontalGroup, Spinner } from '@grafana/ui';

export const NotificationsPage: FC<AppRootProps> = ({ query, path, meta }) => {
  const [data, setData] = useState<DataQueryResponse>();

  useEffect(() => {
    console.log('Datasources: ' + JSON.stringify(config.datasources));
    const uid = config.datasources['Sensetif']?.uid;
    if (!uid) {
      console.warn('sensetif datasource not found');
      return;
    }

    const stream = getGrafanaLiveSrv().getDataStream({
      addr: {
        scope: LiveChannelScope.DataSource,
        namespace: uid,
        path: '_errors',
      },
    });

    stream.subscribe(setData);
  }, []);

  console.log(data);

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
