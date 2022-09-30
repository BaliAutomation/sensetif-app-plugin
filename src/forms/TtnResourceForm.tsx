import React, { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ThingsNetworkApplicationSettings } from '../types';
import { Button, Field, Form, HorizontalGroup, Input, Select, InputControl, RadioButtonGroup } from '@grafana/ui';
import { AvailablePollIntervals } from 'utils/consts';

import { TemplateCreator } from 'forms/ttn_template/Creator';
import { DevicesList } from 'forms/ttn_template/DevicesList';
import { tableData, ttnDevice, msgResult } from 'forms/ttn_template/types';

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
            // devicesPayloads={payloads}
            devicesPayloads={Object.entries(payloads).map(([device, msg]) => ({
              name: device,
              payload: msg?.msgResult?.uplink_message?.decoded_payload,
            }))}
          />
        </>
      )}
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
