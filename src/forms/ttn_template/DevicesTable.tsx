import React from 'react';
import { Icon, Tooltip } from '@grafana/ui';

import { Table } from 'components/table/Table';

export type payloadState = 'loading' | 'loaded' | 'error' | 'empty'
export type devicesTableData = {
  id: string,
  createdAt: Date,
  updatedAt: Date,
  payloadState: payloadState
}

export const DevicesTable = ({
  pageSize,
  devices,
  onSelect,
  onReload,
}: {
  pageSize: number;
  devices: devicesTableData[];
  onSelect: (device_id: string) => void;
  onReload: (devie_id: string) => void;
}) => {
  return (
    <Table<ttnDeviceRow>
      pageSize={pageSize}
      sortBy={[
        {
          id: 'created_at',
          desc: true,
        },
      ]}
      frame={devices.map((d) => {
        return {
          device_id: d.id,
          created_at: d.createdAt,
          updated_at: d.updatedAt,
          payload: {
            state: d.payloadState,
          },
          reload: true
        };
      })}
      columns={[
        {
          id: 'device_id',
          displayValue: 'Device',
          filterable: true,
          sortable: true,
          renderCell: (props) => mkDeviceCellRenderer(props, onSelect)
        },
        {
          id: 'created_at',
          displayValue: 'Created',
          sortable: true,
          sortType: 'datetime',
          renderCell: DateCell,
        },
        {
          id: 'updated_at',
          displayValue: 'Updated',
          sortable: true,
          sortType: 'datetime',
          renderCell: DateCell,
        },
        {
          id: 'payload',
          displayValue: 'Status',
          renderCell: PayloadCell,
          sortable: false,
          maxWidth: 50,
        },
        {
          id: 'reload',
          displayValue: 'Reload',
          renderCell: (props) => mkReloadCellRenderer(props, onReload),
          sortable: false,
          maxWidth: 50,
        },
      ]}
    />
  );
};

type ttnDeviceRow = {
  device_id: string;
  created_at: Date;
  updated_at: Date;
  payload: ttnDevicePayloadState;
  reload: boolean;
};

type ttnDevicePayloadState = {
  state: payloadState,
}

const DateCell = ({ value }: { value: Date }) => {
  return <>{`${value.toLocaleDateString()} ${value.toLocaleTimeString()}`}</>;
};

const mkDeviceCellRenderer = (props: any, onclick: any): any => {
  const clickable = props.row.values?.payload.state === 'loaded'
  const textStyles = props.tableStyles.theme.colors.text

  const textColor = clickable ? textStyles.primary : textStyles.secondary
  const cursorStyle = clickable ? 'pointer' : 'default'

  return (
    <div {...props.cellProps} className={props.tableStyles.cellContainer} onClick={() => clickable && onclick(props.value)}>
      <div className={props.tableStyles.cellText}
        style={{ color: textColor, cursor: cursorStyle }}>
        {props.value}
      </div>
    </div>
  );

  return
}

const PayloadCell = (props: { value: ttnDevicePayloadState }) => {
  if (props?.value.state === 'loading') {
    return (
      <>
        <Icon name="fa fa-spinner" style={{ color: 'white' }} />
      </>
    );
  }

  if (props.value.state === 'error') {
    return (
      <>
        <Icon name="exclamation-triangle" style={{ color: 'yellow' }} />
        <span> Failed to load payload</span>
      </>
    );
  }

  if (props.value.state === 'empty') {
    return <>
      <Tooltip content={'no payload available'}>
        <Icon name='exclamation-triangle' style={{ color: 'yellow' }} />
      </Tooltip>
    </>
  }

  return (
    <>
      <Icon name="check-circle" style={{ color: 'green' }} />
    </>
  );
};

const mkReloadCellRenderer = (props: any, onclick: any): any => {
  return (
    <>
      <Tooltip content={<>{'reload'}</>}>
        <Icon name="sync" style={{ color: 'grey' }} onClick={() => { onclick(props.row.values.device_id) }} />
      </Tooltip>
    </>
  );

  return
}
