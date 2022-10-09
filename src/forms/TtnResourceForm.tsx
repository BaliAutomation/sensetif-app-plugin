import React, { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ThingsNetworkApplicationSettings, Ttnv3Datasource, DatasourceType, PollInterval } from '../types';
import {
  Button,
  Field,
  Form,
  HorizontalGroup,
  Input,
  Select,
  InputControl,
  RadioButtonGroup,
  TagList,
} from '@grafana/ui';
import { AvailablePollIntervals } from 'utils/consts';

import { TemplateCreator } from 'forms/ttn_template/Creator';
import { DevicesTable } from 'forms/ttn_template/DevicesTable';
import { ConfirmationModal } from 'forms/ttn_template/ConfirmationModal';
import { ttnDevice, msgResult, loadingValue } from 'forms/ttn_template/types';
import { css } from '@emotion/css';
import { upsertDatapoint, upsertProject, upsertSubsystem } from 'utils/api';
import { TasksProgress } from './ttn_template/TasksProgress';
interface Props {
  ttn?: ThingsNetworkApplicationSettings;
  onSubmit: (data: ThingsNetworkApplicationSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
  onCancel: () => void;
}

type formValues = {
  zone: string;
  app: string;
  token: string;
  pollInterval: PollInterval;
};

type selectedDeviceId = string;
type devices = ttnDevice[];
type devicesMsg = { [id: string]: loadingValue<msgResult> };

//

//

export const TtnResourceForm = ({ ttn, onSubmit, onCancel }: Props) => {
  let ttnForm = useForm<ThingsNetworkApplicationSettings>({});

  let [formValues, setFormValues] = useState<formValues>();
  let [devices, setDevices] = useState<devices>([]);
  let [selectedDevice, setSelectedDevice] = useState<selectedDeviceId>();
  let [payloads, setPayloads] = useState<devicesMsg>({});

  let [selectedDatapoints, setSelectedDatapoints] = useState<string[]>([]);
  let [matchingDevices, setMatchingDevices] = useState<string[]>([]);

  let [showModal, setShowModal] = useState<boolean>(false);
  let [showProgress, setShowProgress] = useState<boolean>(false);

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
                onSubmit={(formValues) => {
                  setFormValues(formValues);
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
            onChange={(fields) => {
              const devicesPayloads = Object.entries(payloads).map(([device, msg]) => ({
                name: device,
                payload: msg.value?.uplink_message?.decoded_payload,
              }));

              const deviceNames = devicesPayloads.filter((p) => filterPayload(p.payload, fields)).map((p) => p.name);
              setSelectedDatapoints(fields);
              setMatchingDevices(deviceNames);
            }}
            selectedPayload={payloads[selectedDevice].value?.uplink_message?.decoded_payload}
          />
          <br />
          <Button
            variant="primary"
            disabled={matchingDevices.length === 0}
            className={css`
              justify-content: left;
            `}
            onClick={() => {
              setShowModal(true);
            }}
          >
            Import
          </Button>
          <br />
          <br />
          <TagList
            tags={matchingDevices}
            className={css`
              justify-content: left;
            `}
          />

          <ConfirmationModal
            isOpen={showModal}
            devices={matchingDevices}
            datapoints={selectedDatapoints}
            onDismiss={() => setShowModal(false)}
            onConfirm={() => {
              setShowProgress(true)
              const devicesToImport = devices.filter((d) => matchingDevices.includes(d.ids.device_id));
              const geolocation = findFirstGeolocation(payloads) ?? '';
              const fPort = findFirstFport(payloads) ?? -1;

              importDevices(formValues!, devicesToImport, selectedDatapoints, geolocation, fPort);
            }}
          />

          {
            showProgress && <TasksProgress tasks={[
              
            ]} />
          }
        </>
      )}
    </>
  );
};

const findFirstFport = (payloads: devicesMsg) => {
  for (let [_, msg] of Object.entries(payloads)) {
    const fPort = msg?.value?.uplink_message?.f_port;
    if (fPort !== undefined) {
      return fPort;
    }
  }

  return undefined;
};

const findFirstGeolocation = (payloads: devicesMsg) => {
  for (let [_, msg] of Object.entries(payloads)) {
    const location = msg?.value?.uplink_message?.rx_metadata?.[0]?.location;
    if (location !== undefined) {
      return `${location.latitude},${location.longitude}`;
    }
  }

  return undefined;
};

const importDevices = async (
  formValues: formValues,
  devices: ttnDevice[],
  datapoints: string[],
  geolocation: string,
  fPort: number


) => {
  const projectName = formValues.app;
  await upsertProject({
    name: projectName,
    title: projectName,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    geolocation: geolocation,
    city: '',
    country: '',
  }).catch((e) => {
    console.warn(`failed to create project: ${projectName}; reason:`, e);
    return Promise.reject('failed to create project');
  });
  await delay(1000);

  return Promise.all(
    devices.map((device) => createSubsystemWithDevices(formValues, projectName, device, datapoints, fPort))
  );
};

const createSubsystemWithDevices = async (
  formValues: formValues,
  projectName: string,
  device: ttnDevice,
  datapoints: string[],
  fPort: number
) => {
  const subsystemName = device.ids.device_id;
  await upsertSubsystem(projectName, {
    project: projectName,
    name: subsystemName,
    title: subsystemName,
    locallocation: '',
  }).catch((e) => {
    console.warn(`failed to create subsystem: ${subsystemName}; reason:`, e);
    return Promise.reject(`failed to create subsystem: ${subsystemName}`);
  });

  await delay(1000);

  return Promise.all(
    datapoints.map((datapoint) => {
      return upsertDatapoint(projectName, subsystemName, {
        project: projectName,
        subsystem: subsystemName,
        name: datapoint,
        datasourcetype: DatasourceType.ttnv3,
        pollinterval: formValues.pollInterval,
        datasource: makeDatasource(formValues, datapoint, device.ids.device_id, fPort),
        // @ts-ignore
        proc: undefined,
        // @ts-ignore
        timeToLive: undefined,
      }).catch((e) => {
        console.warn(`failed to create datapoint: ${datapoint} for subsystem ${subsystemName}; reason:`, e);
      });
    })
  );
};

const makeDatasource = (formValues: formValues, point: string, device: string, fPort: number): Ttnv3Datasource => {
  return {
    application: formValues.app,
    authorizationkey: formValues.token,
    zone: formValues.zone,

    device: device,
    fport: fPort,
    point: point,

    poll: false,
    subscribe: false,
    webhook: false,
  };
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const filterPayload = (payload: any, fields: string[]): boolean => {
  if (payload === undefined || payload === null) {
    return false;
  }

  for (let field of fields) {
    if (payload[field] === null) {
      return false;
    }
    if (payload[field] === undefined) {
      return false;
    }

    if (typeof payload[field] === 'object') {
      return false;
    }
  }

  return true;
};

interface TtnProps extends UseFormReturn<ThingsNetworkApplicationSettings> {
  ttn?: ThingsNetworkApplicationSettings;
  onSubmit: (formValues: formValues) => void;
}

const TtnResource = ({ onSubmit, control, watch, formState: { errors } }: TtnProps) => {
  const zone = watch('zone');
  const application = watch('application');
  const authorizationKey = watch('authorizationKey');
  const pollInterval = watch('pollinterval');

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
          onClick={() => {
            // onSubmit(authorizationKey, application, zone);
            onSubmit({
              app: application,
              token: authorizationKey,
              zone: zone,
              pollInterval: pollInterval,
            });
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
      console.warn(`failed to parse msg response of device: ${device_id}`, error);
      throw new Error(`failed to parse response of device: ${device_id}`);
    });
};
