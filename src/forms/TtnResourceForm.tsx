import React, { useState, useEffect } from 'react';
import { ThingsNetworkApplicationSettings, Ttnv3Datasource, DatasourceType, uplingMessage } from '../types';
import { Alert, Form } from '@grafana/ui';

import { DevicesTable, payloadState } from 'forms/ttn_template/DevicesTable';
import { ConfirmationModal } from 'forms/ttn_template/ConfirmationModal';
import { fetchDevices, fetchUplinkMessage, upsertDatapoint, upsertProject, upsertSubsystem } from 'utils/api';
import { formValues, TtnResource } from './ttn_template/FetchForm';
import { datapointFormValues } from './ttn_template/DatapointForm';
// import { TasksProgress } from './ttn_template/TasksProgress';
interface Props {
  ttn?: ThingsNetworkApplicationSettings;
  onCancel: () => void;
}

type device = {
  payload: {
    loaded: boolean;
    error?: any;
    value?: uplingMessage;
  },

  id: string,
  createdAt: Date;
  updatedAt: Date;
}

type devicesMap = { [id: string]: device };

export const TtnResourceForm = ({ ttn, onCancel }: Props) => {
  let [apiError, setApiError] = useState<Error>();
  let [formValues, setFormValues] = useState<formValues>();
  let [selectedDevice, setSelectedDevice] = useState<string>();
  let [devicesWithPayload, setDevicesWithPayload] = useState<devicesMap>();

  // let [showProgress, setShowProgress] = useState<boolean>(false);

  useEffect(() => {
    if (!formValues) {
      return;
    }

    const { token, zone, app } = formValues;

    (async () => {
      const d = await fetchDevices(token, zone, app)
      let newdevices: device[] = d.devices.map(ttnDevice => ({
        createdAt: new Date(ttnDevice.created_at),
        updatedAt: new Date(ttnDevice.updated_at),
        id: ttnDevice.ids.device_id,
        payload: { loaded: false },
      }))
      let newdevicesmapping: devicesMap = {}
      for (let nd of newdevices) {
        newdevicesmapping[nd.id] = nd
      }

      setApiError(d.error)
      setDevicesWithPayload(newdevicesmapping)

      for (let device of d.devices) {
        const deviceID = device.ids.device_id
        fetchUplinkMessage(token, zone, app, deviceID).then(r => {
          setApiError(r.error)
          setDevicesWithPayload((md) => ({
            ...md,
            [deviceID]: {
              ...md![deviceID],
              payload: {
                ...md![deviceID].payload,
                loaded: true,
                value: r.messages?.[0]?.uplink_message
              }
            }
          }))
        })
      }
    })()

  }, [formValues]);

  return (
    <>
      {apiError && (
        <Alert title={'Fetch error'}>
          <div> {apiError.message} </div>
        </Alert>
      )}

      <Form<ThingsNetworkApplicationSettings>
        maxWidth={1024}
        onSubmit={(a) => {
          setFormValues({
            app: a.application,
            zone: a.zone,
            token: a.authorizationKey,
          })
        }}
      >
        {(formApi) => (<TtnResource
          ttn={ttn}
          {...formApi}
        />)}
      </Form>

      {devicesWithPayload && Object.keys(devicesWithPayload).length !== 0 && (
        <DevicesTable
          pageSize={25}
          devices={Object.entries(devicesWithPayload).map(([deviceID, device]) => ({
            id: deviceID,
            availableDatapoints: getSupportedDatapointsOfDevice(devicesWithPayload![deviceID]),
            createdAt: device.createdAt,
            updatedAt: device.updatedAt,
            payloadState: newDeviceToState(device),
          }
          ))}
          onSelect={(deviceId) => {
            setSelectedDevice(deviceId);
          }}
          onReload={async (deviceId) => {
            setDevicesWithPayload((md) => ({
              ...md,
              [deviceId]: {
                ...md![deviceId],
                payload: {
                  ...md![deviceId].payload,
                  loaded: false,
                }
              }
            }))

            const r = await fetchUplinkMessage(formValues!.token, formValues!.zone, formValues!.app, deviceId)
            setApiError(r.error)
            setDevicesWithPayload((md) => ({
              ...md,
              [deviceId]: {
                ...md![deviceId],
                payload: {
                  ...md![deviceId].payload,
                  loaded: true,
                  value: r.messages?.[0]?.uplink_message
                }
              }
            }))
          }}
        />
      )}
      <>
        {selectedDevice && <ConfirmationModal
          selectedDevice={selectedDevice}
          devices={
            findDevicesWithDatapoints(
              devicesWithPayload!,
              getSupportedDatapointsOfDevice(devicesWithPayload![selectedDevice])
            )
          }
          datapoints={getSupportedDatapointsOfDevice(devicesWithPayload![selectedDevice])}
          onDismiss={() => setSelectedDevice(undefined)}
          onConfirm={(confirmResult) => {
            const geolocation = findFirstGeolocation(devicesWithPayload!) ?? '';
            const fPort = findFirstFport(devicesWithPayload!) ?? -1;

            // console.log({
            //   confirmResult: confirmResult,
            //   geo: geolocation,
            //   fPort: fPort,
            //   form: formValues
            // })

            importDevices(
              confirmResult.devices,
              geolocation,
              fPort,
              formValues!,
              confirmResult.datapoints,
              confirmResult.formValues
            );
          }}
        />}

        {/* {showProgress && <TasksProgress tasks={[]} />} */}
      </>
    </>
  );
};

const findFirstFport = (payloads: devicesMap) => {
  const deviceWithFport = Object.values(payloads).find((device) => device.payload.value?.f_port !== undefined)
  return deviceWithFport?.payload.value?.f_port
};

const findFirstGeolocation = (payloads: devicesMap) => {
  const deviceWithLocation = Object.values(payloads).find((device) => device.payload.value?.rx_metadata?.[0]?.location !== undefined)

  if (deviceWithLocation === undefined) {
    return undefined
  }

  const location = deviceWithLocation.payload.value?.rx_metadata?.[0]?.location
  return `${location.latitude},${location.longitude}`
};

// todo: split and mv to api.ts
const importDevices = async (
  deviceIds: string[],
  geolocation: string,
  fPort: number,
  formValues: formValues,
  datapoints: string[],
  datapointFormValues: datapointFormValues
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
    deviceIds.map((deviceId) =>
      createSubsystemWithDevices(formValues, projectName, deviceId, datapoints, fPort, datapointFormValues)
    )
  );
};

const createSubsystemWithDevices = async (
  formValues: formValues,
  projectName: string,
  deviceId: string,
  datapoints: string[],
  fPort: number,
  datapointFormValues: datapointFormValues
) => {
  const subsystemName = deviceId;
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
        datasource: makeDatasource(formValues, datapoint, deviceId, fPort),

        pollinterval: datapointFormValues.pollInterval,
        timeToLive: datapointFormValues.timeToLive,
        proc: datapointFormValues.processing,
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

    poll: true,
    subscribe: false,
    webhook: false,
  };
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const newDeviceToState = (d: device): payloadState => {
  if (d.payload.error) {
    return 'error'
  }

  if (!d.payload.loaded) {
    return 'loading'
  }

  if (d.payload.value === undefined) {
    return 'empty'
  }

  return 'loaded'
}

const findDevicesWithDatapoints = (devices: devicesMap, datapoints: string[]): string[] => {
  return Object.values(devices)
    .filter((d) => containsDatapoints(d, datapoints)).
    map(d => d.id)
}

const containsDatapoints = (device: device, datapoints: string[]): boolean => {
  const supportedDatapoints = getSupportedDatapointsOfDevice(device)
  return containAllValues(supportedDatapoints, datapoints)
}

const containAllValues = (arr: string[], values: string[]): boolean => {
  for (let v of values) {
    if (!arr.includes(v)) {
      return false
    }
  }

  return true
}

const getSupportedDatapointsOfDevice = (device: device): string[] => {
  if (device?.payload?.value?.decoded_payload === undefined) {
    return []
  }

  return Object.entries(device?.payload?.value?.decoded_payload)
    .filter(([, payloadValue]) => typeof payloadValue !== 'object')
    .map(([datapoint, _]) => datapoint)
}


