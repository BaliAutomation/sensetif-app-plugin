import React, { useState } from 'react';
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
  VerticalGroup,
  Card,
  useStyles2,
} from '@grafana/ui';
import { AvailablePollIntervals } from 'utils/consts';
import { GrafanaTheme2 } from '@grafana/data';
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
  selected_device_id?: string;
  selected_device_messages?: msgResult[];
};

const getStyles = (theme: GrafanaTheme2) => ({
  container: css`
    max-width: ${theme.breakpoints.values.sm}px;
  `,
});

export const TtnResourceForm = ({ ttn, onSubmit, onCancel }: Props) => {
  let ttnForm = useForm<ThingsNetworkApplicationSettings>({});

  const styles = useStyles2(getStyles);
  let [state, setState] = useState<state>({
    devices: [],
  });

  return (
    <VerticalGroup>
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
                onFetched={async (token, app, zone, devices) => {
                  setState({
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

      {/* devices */}
      <>
        <HorizontalGroup>
          {state.devices?.map((d) => (
            <Card
              isSelected={d.ids.device_id === state.selected_device_id}
              className={styles.container}
              key={d.ids.device_id}
              onClick={async () => {
                console.log(`clicked: ${d}`);
                const messages = await fetchUplinkMessage(state.token!, state!.zone!, state!.app!, d.ids.device_id);
                setState({
                  ...state,
                  selected_device_id: d.ids.device_id,
                  selected_device_messages: messages!,
                });
              }}
            >
              <Card.Description>{d.ids.application_ids.application_id}</Card.Description>
              <Card.Heading>{d.ids.device_id}</Card.Heading>
            </Card>
          ))}
        </HorizontalGroup>
      </>

      {/* messages       */}
      <h1>{state.selected_device_id} messages payloads:</h1>
      {state.selected_device_messages?.map((msg, id) => (
        <pre key={id}>{JSON.stringify(msg.uplink_message.decoded_payload, null, '')}</pre>
      ))}
    </VerticalGroup>
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

interface TtnProps extends UseFormReturn<ThingsNetworkApplicationSettings> {
  ttn?: ThingsNetworkApplicationSettings;
  onFetched: (token: string, app: string, zone: string, devices: ttnDevice[]) => void;
}

const TtnResource = ({ onFetched, control, watch, formState: { errors } }: TtnProps) => {
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
            const devices = await fetchDevices(authorizationKey, zone, application);
            onFetched(authorizationKey, application, zone, devices);
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
    .catch((error) => console.log('error', error));
};

const fetchUplinkMessage = async (token: string, zone: string, app_id: string, device_id: string) => {
  const baseURL = `https://${zone}.cloud.thethings.network`;

  return fetch(`${baseURL}/api/v3/as/applications/${app_id}/devices/${device_id}/packages/storage/uplink_message`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.text())
    .then((str) => str.split(/\r?\n/))
    .then((strArr) => strArr.filter((r) => r !== ''))
    .then((strArr) => strArr.map((el) => JSON.parse(el)['result'] as msgResult))
    .catch((error) => console.log('error', error));
};
