import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ThingsNetworkApplicationSettings, Ttnv3Datasource, DatasourceType } from '../types';
import { Form } from '@grafana/ui';

import { TemplateCreatorModal } from 'forms/ttn_template/Creator';
import { DevicesTable } from 'forms/ttn_template/DevicesTable';
import { ConfirmationModal } from 'forms/ttn_template/ConfirmationModal';
import { ttnDevice, msgResult, loadingValue } from 'forms/ttn_template/types';
import { upsertDatapoint, upsertProject, upsertSubsystem } from 'utils/api';
import { formValues, TtnResource } from './ttn_template/FetchForm';
import { datapointFormValues } from './ttn_template/DatapointForm';
// import { TasksProgress } from './ttn_template/TasksProgress';
interface Props {
  ttn?: ThingsNetworkApplicationSettings;
  onSubmit: (data: ThingsNetworkApplicationSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
  onCancel: () => void;
}

//

type selectedDeviceId = string;
type devices = ttnDevice[];
type devicesMsg = { [id: string]: loadingValue<msgResult> };

export const TtnResourceForm = ({ ttn, onSubmit, onCancel }: Props) => {
  let ttnForm = useForm<ThingsNetworkApplicationSettings>({});

  let [formValues, setFormValues] = useState<formValues>();
  let [devices, setDevices] = useState<devices>([]);
  let [selectedDevice, setSelectedDevice] = useState<selectedDeviceId>();
  let [payloads, setPayloads] = useState<devicesMsg>({});

  let [templateDatapoints, setTemplateDatapoints] = useState<string[]>([]);
  let [templateMatchingDevices, setTemplateMatchingDevices] = useState<string[]>([]);

  let [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  let [showDatapointsModal, setShowDatapointsModal] = useState<boolean>(false);
  // let [showProgress, setShowProgress] = useState<boolean>(false);

  const setPayloadsLoading = (devices: ttnDevice[]) => {
    let devicesMsg: devicesMsg = {};
    for (let device of devices) {
      devicesMsg[device.ids.device_id] = { isLoading: true };
    }

    setPayloads(devicesMsg);
  };

  const fetchAndSetPayloads = ({
    token,
    zone,
    app,
    device,
  }: {
    token: string;
    zone: string;
    app: string;
    device: string;
  }) => {
    fetchUplinkMessage(token, zone, app, device).then((r) => {
      if (r.length > 0) {
        setPayloads((p) => ({
          ...p,
          [device]: { isLoading: false, value: r[0] },
        }));
      }
    });
  };

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

    if (!devices) {
      return;
    }

    setPayloadsLoading(devices);

    const { token, zone, app } = formValues;
    for (let i = 0; i < devices.length; i++) {
      let device = devices[i];
      fetchAndSetPayloads({
        app: app,
        token: token,
        zone: zone,
        device: device.ids.device_id,
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

      {devices && devices.length !== 0 && formValues && (
        <DevicesTable
          pageSize={25}
          devices={devices.map((d) => {
            return {
              device: d,
              msg: payloads[d.ids.device_id],
            };
          })}
          onSelect={(deviceId, _) => {
            setSelectedDevice(deviceId);
            setShowDatapointsModal(true);
          }}
        />
      )}

      <>
        <TemplateCreatorModal
          isOpen={showDatapointsModal}
          onDismiss={() => {
            setSelectedDevice(undefined);
            setShowDatapointsModal(false);
            setTemplateMatchingDevices([]);
            setTemplateDatapoints([]);
          }}
          onConfirm={(datapoints: string[]) => {
            setShowDatapointsModal(false);
            setShowConfirmationModal(true);

            setTemplateDatapoints(datapoints);

            // calc matching devices
            const devicesPayloads = Object.entries(payloads).map(([device, msg]) => ({
              name: device,
              payload: msg.value?.uplink_message?.decoded_payload,
            }));

            const deviceNames = devicesPayloads.filter((p) => filterPayload(p.payload, datapoints)).map((p) => p.name);

            setTemplateMatchingDevices(deviceNames);
          }}
          selectedPayload={selectedDevice && payloads?.[selectedDevice]?.value?.uplink_message?.decoded_payload}
        />

        <ConfirmationModal
          isOpen={showConfirmationModal}
          devices={templateMatchingDevices}
          datapoints={templateDatapoints}
          onDismiss={() => setShowConfirmationModal(false)}
          onConfirm={(confirmResult) => {
            setShowConfirmationModal(false);

            let devicesToImport = devices.filter((d) => confirmResult.devices.includes(d.ids.device_id));
            let payloadsToImport: devicesMsg = {};
            for (let device of devicesToImport) {
              const id = device.ids.device_id;
              payloadsToImport[id] = payloads[id];
            }

            importDevices(
              devicesToImport,
              payloadsToImport,
              formValues!,
              confirmResult.datapoints,
              confirmResult.formValues
            );
          }}
        />

        {/* {showProgress && <TasksProgress tasks={[]} />} */}
      </>
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
  devices: ttnDevice[],
  payloads: devicesMsg,
  formValues: formValues,
  datapoints: string[],
  datapointFormValues: datapointFormValues
) => {
  const projectName = formValues.app;
  const geolocation = findFirstGeolocation(payloads) ?? '';
  const fPort = findFirstFport(payloads) ?? -1;

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
    devices.map((device) =>
      createSubsystemWithDevices(formValues, projectName, device, datapoints, fPort, datapointFormValues)
    )
  );
};

const createSubsystemWithDevices = async (
  formValues: formValues,
  projectName: string,
  device: ttnDevice,
  datapoints: string[],
  fPort: number,
  datapointFormValues: datapointFormValues
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
        datasource: makeDatasource(formValues, datapoint, device.ids.device_id, fPort),

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
