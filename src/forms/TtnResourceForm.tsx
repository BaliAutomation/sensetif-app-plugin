import React, { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ThingsNetworkApplicationSettings } from '../types';
import { Button, Field, Form, HorizontalGroup, Input, Select, InputControl, RadioButtonGroup } from '@grafana/ui';
import { AvailablePollIntervals } from 'utils/consts';

import { TemplateCreator } from 'forms/ttn_template/Creator';
import { DevicesTable } from 'forms/ttn_template/DevicesTable';
import { ttnDevice, msgResult, loadingValue } from 'forms/ttn_template/types';

interface Props {
  ttn?: ThingsNetworkApplicationSettings;
  onSubmit: (data: ThingsNetworkApplicationSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
  onCancel: () => void;
}

type formValues = {
  zone: string;
  app: string;
  token: string;
};

type selectedDeviceId = string;
type devices = ttnDevice[];
type devicesMsg = { [id: string]: loadingValue<msgResult> };

export const TtnResourceForm = ({ ttn, onSubmit, onCancel }: Props) => {
  let ttnForm = useForm<ThingsNetworkApplicationSettings>({});

  let [formValues, setFormValues] = useState<formValues>();
  let [devices, setDevices] = useState<devices>([]);
  let [selectedDevice, setSelectedDevice] = useState<selectedDeviceId>();
  let [payloads, setPayloads] = useState<devicesMsg>({});

  useEffect(() => {
    if (!formValues) {
      return;
    }

    const { token, zone, app } = formValues;
    fetchDevices(token, zone, app).then((d) => {
      setDevices(d);
    });
  }, [formValues]);

  useEffect(() => {
    if (!formValues) {
      return;
    }

    const { token, zone, app } = formValues;
    for (let device of devices) {
      setPayloads((p) => ({
        ...p,
        [device.ids.device_id]: { isLoading: true },
      }));
      fetchUplinkMessage(token, zone, app, device.ids.device_id).then((r) => {
        if (r.length > 1) {
          setPayloads((p) => ({
            ...p,
            [device.ids.device_id]: { isLoading: false, value: r[0] },
          }));
        }
      });
    }
  }, [formValues, devices]);

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
                  setFormValues({
                    app: app,
                    zone: zone,
                    token: token,
                  });
                }}
              />
            </>
          );
        }}
      </Form>

      {devices.length !== 0 && formValues && (
        <DevicesTable
          devices={devices.map((d) => {
            return {
              device: d,
              msg: payloads[d.ids.device_id],
            };
          })}
          onSelect={(deviceId, _) => {
            setSelectedDevice(deviceId);
          }}
        />
      )}

      {selectedDevice && (
        <>
          <h3>{`payload from device: ${selectedDevice}:`}</h3>
          <pre>{JSON.stringify(payloads[selectedDevice].value?.uplink_message?.decoded_payload)}</pre>

          <TemplateCreator
            selectedPayload={payloads[selectedDevice].value?.uplink_message?.decoded_payload}
            devicesPayloads={Object.entries(payloads).map(([device, msg]) => ({
              name: device,
              payload: msg.value?.uplink_message?.decoded_payload,
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
      console.warn('failed to fetch devices', error);
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
        console.warn(
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
