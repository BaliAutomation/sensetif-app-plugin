import React, { useState, useEffect } from 'react';
import { Icon } from '@grafana/ui';

import { Table } from 'components/table/Table';
import { tableData, ttnDevice, msgResult, msgLoadingValue } from 'forms/ttn_template/types';

export const DevicesList = ({
  app,
  zone,
  token,
  devices,
  onSelect,
  onPayloadLoaded,
}: {
  app: string;
  zone: string;
  token: string;
  devices: ttnDevice[];
  onSelect?: (device: ttnDevice, msg: msgResult) => void;
  onPayloadLoaded?: (devicesPayloads: tableData) => void;
}) => {
  const initialPayload: tableData = {};

  for (let d of devices) {
    initialPayload[d.ids.device_id] = { loading: true };
  }

  const [payloads, setPayloads] = useState<tableData>(initialPayload);

  useEffect(() => {
    const ip: tableData = {};

    for (let d of devices) {
      ip[d.ids.device_id] = { loading: true };
    }
    setPayloads(ip);

    let s: tableData = {};

    let queries = [];
    for (let device of devices) {
      queries.push(
        fetchUplinkMessage(token, zone, app, device.ids.device_id).then((msgs) => {
          s[device.ids.device_id] = { msgResult: msgs[0], loading: false, error: false };
        })
      );
    }

    Promise.all(queries).then((r) => {
      setPayloads(s);
    });
  }, [token, app, zone, devices]);

  onPayloadLoaded && onPayloadLoaded(payloads);

  return (
    <Table<ttnDeviceRow>
      pageSize={5}
      sortBy={[
        {
          id: 'created_at',
          desc: true,
        },
      ]}
      onRowClick={(row) => {
        console.log(`clicked`, row);
        const device = devices.find((d) => d.ids.device_id === row['ids.device_id'])!;
        onSelect && onSelect(device, payloads[device.ids.device_id].msgResult!);
      }}
      frame={devices.map((d) => {
        const createdAt = new Date(d.created_at);
        const updatedAt = new Date(d.updated_at);

        return {
          'ids.device_id': d.ids.device_id,
          'ids.application_ids.application_id': d.ids.application_ids.application_id,
          'ids.dev_eui': d.ids.dev_eui,
          // created_at: `${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`,
          created_at: createdAt,
          // updated_at: `${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}`,
          updated_at: updatedAt,
          payload: payloads[d.ids.device_id],
        };
      })}
      columns={[
        {
          id: 'ids.device_id',
          displayValue: 'Device',
        },
        { id: 'ids.application_ids.application_id', displayValue: 'Application' },
        {
          id: 'created_at',
          displayValue: 'Created',
          sortType: 'datetime',
          renderCell: DateCell,
        },
        {
          id: 'updated_at',
          displayValue: 'Updated',
          sortType: 'datetime',
          renderCell: DateCell,
        },
        {
          id: 'payload',
          displayValue: 'Status',
          renderCell: PayloadCell,
        },
      ]}
      hiddenColumns={[]}
    />
  );
};

type ttnDeviceRow = {
  'ids.device_id': string;
  'ids.application_ids.application_id': string;
  'ids.dev_eui': string;
  created_at: Date;
  updated_at: Date;

  // payload: any;
  payload?: msgLoadingValue;
};

const DateCell = (props: { value: Date }) => {
  return <>{`${props.value.toLocaleDateString()} ${props.value.toLocaleTimeString()}`}</>;
};

const PayloadCell = (props: { value: msgLoadingValue }) => {
  if (props.value.loading) {
    return (
      <>
        <Icon name="fa fa-spinner" style={{ color: 'white' }} />
        <span> Loading payload</span>
      </>
    );
  }

  if (props.value.error) {
    return (
      <>
        <Icon name="exclamation-triangle" style={{ color: 'yellow' }} />
        <span> Failed to load payload</span>
      </>
    );
  }

  return (
    <>
      <Icon name="check-circle" style={{ color: 'green' }} />
    </>
  );
};

const fetchUplinkMessage = async (token: string, zone: string, app_id: string, device_id: string) => {
  const baseURL = `https://${zone}.cloud.thethings.network`;

  return fetch(`${baseURL}/api/v3/as/applications/${app_id}/devices/${device_id}/packages/storage/uplink_message`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.log(
          `failed to fetch msg of device: ${device_id}; status: ${response.status}; body: ${response.text()}`
        );
        throw new Error(`failed to fetch msg of device: ${device_id}`);
      }
      return response.text();
    })
    .then((str) => str.split(/\r?\n/))
    .then((strArr) => strArr.filter((r) => r !== ''))
    .then((strArr) => strArr.map((el) => JSON.parse(el)['result'] as msgResult))
    .catch((error) => {
      console.log(`failed to parse msg response of device: ${device_id}`, error);
      throw new Error(`failed to parse response of device: ${device_id}`);
    });
};
