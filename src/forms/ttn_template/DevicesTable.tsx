import React from 'react';
import { Icon } from '@grafana/ui';

import { Table } from 'components/table/Table';
import { ttnDevice, msgResult, loadingValue } from 'forms/ttn_template/types';

export type devicesTableData = {
  device: ttnDevice;
  msg: loadingValue<msgResult>;
};
export const DevicesTable = ({
  devices,
  onSelect,
}: {
  devices: devicesTableData[];
  onSelect?: (device_id: string, msg: loadingValue<msgResult>) => void;
}) => {
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
        onSelect && onSelect(row['ids.device_id'], row.payload);
      }}
      frame={devices.map((d) => {
        const createdAt = new Date(d.device.created_at);
        const updatedAt = new Date(d.device.updated_at);

        return {
          'ids.device_id': d.device.ids.device_id,
          'ids.application_ids.application_id': d.device.ids.application_ids.application_id,
          'ids.dev_eui': d.device.ids.dev_eui,
          created_at: createdAt,
          updated_at: updatedAt,
          payload: d.msg,
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
  payload: loadingValue<msgResult>;
};

const DateCell = (props: { value: Date }) => {
  return <>{`${props.value.toLocaleDateString()} ${props.value.toLocaleTimeString()}`}</>;
};

const PayloadCell = (props: { value: loadingValue<msgResult> }) => {
  if (props.value?.isLoading) {
    return (
      <>
        <Icon name="fa fa-spinner" style={{ color: 'white' }} />
        <span> Loading payload</span>
      </>
    );
  }

  if (props.value?.error) {
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
