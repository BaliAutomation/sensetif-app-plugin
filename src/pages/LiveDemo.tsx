import React, { FC, useEffect, useState } from 'react';
import { AppRootProps, DataFrame, DataQueryResponse, Field, LiveChannelScope, Vector } from '@grafana/data';
import { getGrafanaLiveSrv, config } from '@grafana/runtime';
import { HorizontalGroup, Spinner } from '@grafana/ui';

export const LiveDemo: FC<AppRootProps> = ({ query, path, meta }) => {
  const [data, setData] = useState<DataQueryResponse>();

  useEffect(() => {
    const uid = config.datasources['Sensetif Datasource']?.uid;
    if (!uid) {
      console.warn('sensetif datasource not found');
      return;
    }

    const stream = getGrafanaLiveSrv().getDataStream({
      addr: {
        scope: LiveChannelScope.DataSource,
        namespace: uid,
        path: 'sensetif-path-1',
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
        <pre>{JSON.stringify(getLastField((data.data[0] as DataFrame).fields, 'Time'), null, " '")}</pre>
        <pre>{JSON.stringify(getLastField((data.data[0] as DataFrame).fields, 'Value'), null, " '")}</pre>
      </HorizontalGroup>
    </>
  );
};

function getLastField(fields: Array<Field<any, Vector<any>>>, name: string): Field<any, Vector<any>> | undefined {
  return fields.filter((f) => f.name === name).pop();
}
