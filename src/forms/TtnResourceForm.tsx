import React, { useState, useEffect } from 'react';
import { ThingsNetworkApplicationSettings, Ttnv3Datasource, DatasourceType, uplingMessage } from '../types';
import { Alert, Form } from '@grafana/ui';

import { DevicesTable, payloadState } from 'forms/ttn_template/DevicesTable';
import { ConfirmationModal, matchingDevice } from 'forms/ttn_template/ConfirmationModal';
import { fetchDevices, fetchUplinkMessage, upsertDatapoint, upsertProject, upsertSubsystem } from 'utils/api';
import { TtnResource } from './ttn_template/FetchForm';
import { datapointFormValues } from './ttn_template/DatapointForm';
// import { TasksProgress } from './ttn_template/TasksProgress';
interface Props {
  ttn?: ThingsNetworkApplicationSettings;
  onCancel: () => void;
}

export type payloadField = {
  name: string;
  type: string;
  supported: boolean;
}

export type fPortPayload = {
  [fPort: number]: {
    payload: payloadField[];
    location: string;
  }
}

export type device = {
  payload: {
    loaded: boolean;
    error?: any;
    fPorts?: fPortPayload,
  }

  id: string,
  createdAt: Date;
  updatedAt: Date;
}

export type devicesMap = { [id: string]: device };

type formValues = {
  zone: string;
  app: string;
  token: string;
  fPort?: number;
  limitFetchedMessages?: boolean;
};

export const TtnResourceForm = ({ ttn, onCancel }: Props) => {
  let [apiError, setApiError] = useState<Error>();
  let [formValues, setFormValues] = useState<formValues>();
  let [selectedDevice, setSelectedDevice] = useState<string>();
  let [devicesWithPayload, setDevicesWithPayload] = useState<devicesMap>();

  // let [showProgress, setShowProgress] = useState<boolean>(false);

  const setDevicePayloads = (id: string, fPorts: fPortPayload) => {
    setDevicesWithPayload((md) => ({
      ...md,
      [id]: {
        ...md![id],
        payload: {
          ...md![id].payload,
          loaded: true,
          fPorts: fPorts,
        }
      }
    }))
  }

  const setDeviceLoading = (id: string) => {
    setDevicesWithPayload((md) => ({
      ...md,
      [id]: {
        ...md![id],
        payload: {
          ...md![id].payload,
          loaded: false,
        }
      }
    }))
  }

  useEffect(() => {
    if (!formValues) {
      return;
    }

    const { token, zone, app, limitFetchedMessages } = formValues;

    (async () => {
      const d = await fetchDevices(token, zone, app)

      let newDevicesMapping: devicesMap = {}
      d.devices.forEach(ttnDevice => {
        const deviceID = ttnDevice.ids.device_id
        newDevicesMapping[deviceID] = {
          id: deviceID,
          createdAt: new Date(ttnDevice.created_at),
          updatedAt: new Date(ttnDevice.updated_at),
          payload: { loaded: false }
        }
      })

      setApiError(d.error)
      setDevicesWithPayload(newDevicesMapping)

      for (let device of d.devices) {
        const deviceID = device.ids.device_id
        const fetchLimit = getFetchMessagesLimit(limitFetchedMessages)
        fetchUplinkMessage(token, zone, app, deviceID, fetchLimit).then(r => {
          setApiError(r.error)
          let fPorts: fPortPayload = {}
          r.messages?.forEach(m => {
            //TODO: refactor: check if already exists in fPorts map
            fPorts[m.uplink_message.f_port] = {
              payload: getPayloadFields(m.uplink_message.decoded_payload),
              location: findGeoLocation(m.uplink_message),
            }
          })

          setDevicePayloads(deviceID, fPorts);
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
            limitFetchedMessages: a.limitFetchedMessages,
            fPort: a.fPort,
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
            fPorts: Object.keys(devicesWithPayload![deviceID]?.payload?.fPorts ?? {}),
            createdAt: device.createdAt,
            updatedAt: device.updatedAt,
            payloadState: newDeviceToState(device),
          }
          ))}
          onSelect={(deviceId) => {
            setSelectedDevice(deviceId);
          }}
          onReload={async (deviceId) => {
            setDeviceLoading(deviceId)


            const r = await fetchUplinkMessage(
              formValues!.token,
              formValues!.zone,
              formValues!.app,
              deviceId,
              getFetchMessagesLimit(formValues!.limitFetchedMessages),
            )

            setApiError(r.error)
            let fPorts: fPortPayload = {}
            r.messages?.forEach(m => {
              //TODO: refactor: check if already exists in fPorts map
              fPorts[m.uplink_message.f_port] = {
                payload: getPayloadFields(m.uplink_message.decoded_payload),
                location: findGeoLocation(m.uplink_message),
              }
            })
            setDevicePayloads(deviceId, fPorts)
          }}
        />
      )}
      <>
        {selectedDevice && <ConfirmationModal
          selectedDevice={selectedDevice}
          allDevices={devicesWithPayload!}
          onDismiss={() => setSelectedDevice(undefined)}
          onConfirm={(confirmResult) => {
            // geolocation of originally selected device
            const geolocation = devicesWithPayload?.[selectedDevice!]?.payload.fPorts?.[confirmResult.fPort].location ?? ''

            importDevices(
              formValues!,
              confirmResult.devices,
              confirmResult.datapoints,
              confirmResult.formValues,
              geolocation,
            );
          }}
        />}

        {/* {showProgress && <TasksProgress tasks={[]} />} */}
      </>
    </>
  );
};

const getPayloadFields = (payload: any): payloadField[] => {
 return Object.entries(payload).map(([k, v]) => ({
    name: k,
    type: typeof v,
    supported: (typeof v) !== 'object'
  }))
}

const findGeoLocation = (msg: uplingMessage) => {
  const location = msg.rx_metadata?.[0]?.location
  if (location === undefined) {
    return ``
  }

  return `${location.latitude},${location.longitude}`
};

// todo: split and mv to api.ts
const importDevices = async (
  formValues: formValues,
  devices: matchingDevice[],
  datapoints: string[],
  datapointFormValues: datapointFormValues,
  geolocation: string,
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
    devices.map(d => createSubsystemWithDevices(formValues, projectName, d.id, datapoints, d.fPort, datapointFormValues))
  );
};

const getFetchMessagesLimit = (limit?: boolean) => {
  const out = limit ? 10 : 50
  return out
}

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

  if (d.payload.fPorts === undefined) {
    return 'empty'
  }

  if (Object.keys(d.payload.fPorts).length === 0) {
    return 'empty'
  }

  return 'loaded'
}
