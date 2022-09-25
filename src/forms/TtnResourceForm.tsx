import React, { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ThingsNetworkApplicationSettings } from '../types';
import {
  Button,
  Field,
  Form,
  HorizontalGroup,
  Input,
  Select,
  InputControl,
  RadioButtonGroup,
  Icon,
  Checkbox,
  TagList,
} from '@grafana/ui';
import { AvailablePollIntervals } from 'utils/consts';
import { Table } from 'components/table/Table';
import { css } from '@emotion/css';

interface Props {
  ttn?: ThingsNetworkApplicationSettings;
  onSubmit: (data: ThingsNetworkApplicationSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
  onCancel: () => void;
}

type state = {
  devices: ttnDevice[];

  zone?: string;
  app?: string;
  token?: string;

  selected?: {
    device: ttnDevice;
    msg: msgResult;
  };
};

export const TtnResourceForm = ({ ttn, onSubmit, onCancel }: Props) => {
  let ttnForm = useForm<ThingsNetworkApplicationSettings>({});

  let [state, setState] = useState<state>({ devices: [] });
  let [payloads, setPayloads] = useState<tableData>({});

  return (
    <>
      <Form<ThingsNetworkApplicationSettings>
        onSubmit={onSubmit}
        maxWidth={1024}
        defaultValues={{
          ...ttn,
        }}
      >
        {() => {
          return (
            <>
              <TtnResource
                ttn={ttn}
                {...ttnForm}
                onSubmit={async (token, app, zone) => {
                  const devices = await fetchDevices(token, zone, app);
                  setState({
                    ...state,
                    token: token,
                    app: app,
                    zone: zone,
                    devices: devices,
                  });
                }}
              />
            </>
          );
        }}
      </Form>

      {state.devices.length !== 0 && (
        <DevicesList
          zone={state.zone!}
          app={state.app!}
          token={state.token!}
          devices={state.devices}
          onPayloadLoaded={(devicesPayloads) => {
            setPayloads(devicesPayloads);
          }}
          onSelect={(device, msg) => {
            console.log(`onSelect callback`, device, msg);
            setState({
              ...state,
              selected: {
                device: device,
                msg: msg,
              },
            });
          }}
        />
      )}

      {state.selected && (
        <>
          <TemplateCreator
            selectedDeviceId={state.selected.device.ids.device_id}
            selectedPayload={state.selected?.msg?.uplink_message?.decoded_payload}
            devicesPayloads={payloads}
          />
          {/* matching devices */}
        </>
      )}
    </>
  );
};

const TemplateCreator = ({
  selectedDeviceId,
  selectedPayload,
  devicesPayloads,
}: {
  selectedDeviceId: string;
  selectedPayload: any;
  devicesPayloads: tableData;
}) => {
  type structure = {
    [name: string]: {
      supported: boolean;
      type: string;
      value: any;
      checked: boolean;
    };
  };

  let [state, setState] = useState<structure>({});

  useEffect(() => {
    if (!selectedPayload) {
      setState({});
      return;
    }
    let result: structure = {};

    Object.entries(selectedPayload).forEach((el) => {
      const [name, value] = el;
      const valueType = typeof value;

      result[name] = {
        checked: false,
        value: value,
        type: valueType,
        supported: valueType !== 'object',
      };
    });

    setState(result);
  }, [selectedPayload]);

  console.log('template created: dev payloads', devicesPayloads);
  return (
    <>
      <h3>{`payload from device: ${selectedDeviceId}:`}</h3>
      <pre>{JSON.stringify(selectedPayload)}</pre>

      {/* select fields */}
      <ul>
        {Object.entries(state).map(([name, v]) => (
          <li key={name}>
            <Checkbox
              label={`${name} ${v.supported ? '' : ' - objects are not supported'}`}
              value={v.checked}
              onChange={() => {
                setState({
                  ...state,
                  [name]: {
                    ...state[name],
                    checked: !state[name].checked,
                  },
                });
              }}
              disabled={!v.supported}
            />
          </li>
        ))}
      </ul>

      {/* matching devices */}
      <>
        <h2>Matching devices::</h2>
        {devicesPayloads && state && (
          <TagList
            className={css`
              justify-content: left;
            `}
            tags={Object.entries(devicesPayloads)
              .filter((d) => {
                const [_, msg] = d;
                const dPayload = msg.msgResult?.uplink_message?.decoded_payload;

                if (!dPayload) {
                  return false;
                }

                let selectedProps: string[] = [];
                Object.entries(state).forEach(([name, val]) => {
                  if (val.checked) {
                    selectedProps.push(name);
                  }
                });

                console.log('selected props', selectedProps);

                return contains(dPayload, selectedProps);
              })
              .map(([name, _]) => name)}
          />
        )}
      </>
    </>
  );
};

const contains = (obj: any, props: string[]) => {
  for (let prop of props) {
    if (!obj[prop] || typeof obj[prop] === 'object') {
      return false;
    }
  }
  return true;
};

type tableData = {
  [id: string]: msgLoadingValue;
};
const DevicesList = ({
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
          // onPayloadLoaded && onPayloadLoaded(device.ids.device_id, msgs[0]);
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
          created_at: `${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`,
          updated_at: `${updatedAt.toLocaleDateString()} ${updatedAt.toLocaleTimeString()}`,
          payload: payloads[d.ids.device_id],
        };
      })}
      columns={[
        {
          id: 'ids.device_id',
          displayValue: 'Device',
        },
        { id: 'ids.application_ids.application_id', displayValue: 'Application' },
        { id: 'created_at', displayValue: 'Created' },
        { id: 'updated_at', displayValue: 'Updated' },
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

type ttnDevice = {
  ids: {
    device_id: string;
    application_ids: {
      application_id: string;
    };
    dev_eui: string;
    join_eui: string;
  };
  created_at: string;
  updated_at: string;
};

type ttnDeviceRow = {
  'ids.device_id': string;
  'ids.application_ids.application_id': string;
  'ids.dev_eui': string;
  created_at: string;
  updated_at: string;

  // payload: any;
  payload?: msgLoadingValue;
};

type msgResult = {
  end_device_ids: {
    device_id: string;
    application_ids: {
      application_id: string;
    };
    dev_eui: string;
    dev_addr: string;
  };
  received_at: string;
  uplink_message: {
    f_port: number;
    f_cnt: number;
    frm_payload: string;
    decoded_payload: any;
    rx_metadata: any;
    settings: any;
    received_at: string;
    confirmed: true;
    consumed_airtime: string;
    version_ids: any;
    network_ids: {
      net_id: string;
      tenant_id: string;
      cluster_id: string;
      cluster_address: string;
    };
  };
};

type msgLoadingValue = { msgResult?: msgResult; loading?: boolean; error?: boolean };

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

interface TtnProps extends UseFormReturn<ThingsNetworkApplicationSettings> {
  ttn?: ThingsNetworkApplicationSettings;
  onSubmit: (token: string, app: string, zone: string) => void;
}

const TtnResource = ({ onSubmit, control, watch, formState: { errors } }: TtnProps) => {
  const zone = watch('zone');
  const application = watch('application');
  const authorizationKey = watch('authorizationKey');

  return (
    <>
      <HorizontalGroup>
        <HorizontalGroup>
          <Field label="Zone">
            <InputControl
              render={({ field: { ref, ...field } }) => (
                <RadioButtonGroup
                  {...field}
                  options={[
                    { label: 'eu1', value: 'eu1' },
                    { label: 'nam1', value: 'nam1' },
                    { label: 'au1', value: 'au1' },
                  ]}
                />
              )}
              rules={{
                required: 'Zone is required',
              }}
              control={control}
              defaultValue={zone ?? 'eu1'}
              name="zone"
            />
          </Field>
        </HorizontalGroup>

        <Field
          label="Poll interval"
          invalid={!!errors.pollinterval}
          error={errors.pollinterval && errors.pollinterval.message}
        >
          <InputControl
            render={({ field: { onChange, ref, ...field } }) => (
              <Select
                {...field}
                onChange={(selectable) => onChange(selectable.value)}
                options={AvailablePollIntervals}
              />
            )}
            rules={{
              required: 'Interval selection is required',
            }}
            name="pollinterval"
            control={control}
            defaultValue={AvailablePollIntervals[5].value}
          />
        </Field>

        <Field
          label="Authorization Key"
          invalid={!!errors?.authorizationKey}
          error={errors?.authorizationKey && errors?.authorizationKey.message}
        >
          <InputControl
            render={({ field: { ref, ...field } }) => <Input {...field} placeholder="Authorization Key" />}
            control={control}
            name="authorizationKey"
            defaultValue={authorizationKey ?? ''}
          />
        </Field>
        <Field
          label="Application"
          invalid={!!errors?.application}
          error={errors?.application && errors?.application.message}
        >
          <InputControl
            render={({ field: { ref, ...field } }) => <Input {...field} placeholder="Application" />}
            control={control}
            name="application"
            defaultValue={application ?? ''}
          />
        </Field>

        {/* Fetch Devices */}
        <Button
          type="button"
          variant={'secondary'}
          onClick={async () => {
            onSubmit(authorizationKey, application, zone);
          }}
        >
          {'Fetch devices'}
        </Button>
      </HorizontalGroup>
    </>
  );
};

const fetchDevices = async (token: string, zone: string, app_id: string): Promise<ttnDevice[]> => {
  const baseURL = `https://${zone}.cloud.thethings.network`;

  return fetch(`${baseURL}/api/v3/applications/${app_id}/devices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((r) => r.json())
    .then((r) => r['end_devices'])
    .catch((error) => {
      console.log('failed to fetch devices', error);
      throw new Error('failed to fetch devices');
    });
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
