import { getBackendSrv, logInfo } from '@grafana/runtime';
import {
  DatapointSettings,
  DatasourceType,
  Payment,
  Limits,
  PlanSettings,
  PollInterval,
  ProjectSettings,
  SubsystemSettings,
  ResourceSettings,
  TsPair,
  FetchDevicesResponse,
  FetchMessageResponse,
  msgResult,
  Script
} from 'types';
import { API_RESOURCES } from './consts';

const WAIT_AFTER_EXEC_MS = 200;

const request = async <T>(path: string, method: string, body: string, waitTime = 0): Promise<any> => {
  logInfo('Request: ' + method + ' ' + path);
  const srv = getBackendSrv();
  let request: Promise<T>;
  const url = API_RESOURCES + path;
  switch (method) {
    case 'GET':
      request = srv.get<T>(url, body);
      break;
    case 'PUT':
      request = srv.put<T>(url, body);
      break;
    case 'POST':
      request = srv.post<T>(url, body);
      break;
    case 'DELETE':
      request = srv.delete<T>(url);
      break;
  }

  // return sleep(waitTime)
  return new Promise((resolve, reject) => {
    request
      .then((r) =>
        setTimeout(() => {
          resolve(r);
        }, waitTime)
      )
      .catch((err) => {
        reject(err);
      });
  });
};

// projects
export const getProjects = () => request<ProjectSettings[]>('_', 'GET', '', 0);

export const getProject = (name: string) => request<ProjectSettings>(name, 'GET', '', 0);

export const upsertProject = (project: ProjectSettings) =>
  request(project.name, 'PUT', JSON.stringify(project), WAIT_AFTER_EXEC_MS);

export const deleteProject = (projectName: string) => request(projectName, 'DELETE', '', WAIT_AFTER_EXEC_MS);

export const renameProject = (oldName: string, newName: string) => {
  const change = {
    oldName: oldName,
    newName: newName,
  };
  return request(oldName, 'POST', JSON.stringify(change), WAIT_AFTER_EXEC_MS);
};

// subsystems
export const getSubsystems = (projectName: string) =>
  request<SubsystemSettings[]>(projectName + '/_', 'GET', '', 0);

export const getSubsystem = (projectName: string, subsystemName: string) =>
  request<SubsystemSettings>(projectName + '/' + subsystemName, 'GET', '', 0);

export const upsertSubsystem = (projectName: string, subsystem: SubsystemSettings) => {
  subsystem.project = projectName;
  return request(projectName + '/' + subsystem.name, 'PUT', JSON.stringify(subsystem), WAIT_AFTER_EXEC_MS);
};

export const deleteSubsystem = (projectName: string, subsystemName: string) =>
  request<void>(projectName + '/' + subsystemName, 'DELETE', '', WAIT_AFTER_EXEC_MS);

export const renameSubsystem = (projectName: string, oldName: string, newName: string) => {
  const path = projectName + '/' + oldName
  const change = {
    oldName: oldName,
    newName: newName,
  };
  return request<void>(path, 'POST', JSON.stringify(change), WAIT_AFTER_EXEC_MS);
};

// datapoints
export const getDatapoints = (projectName: string, subsystemName: string) =>
  request<DatapointSettings[]>(projectName + '/' + subsystemName + '/_', 'GET', '', 0);

export const getDatapoint = (
  projectName: string,
  subsystemName: string,
  datapointName: string
) => request<DatapointSettings>(projectName + '/' + subsystemName + '/' + datapointName, 'GET', '', 0);

export const upsertDatapoint = (projectName: string, subsystemName: string, datapoint: DatapointSettings) => {
  if (datapoint.datasourcetype === DatasourceType.mqtt) {
    // TODO: MQTT doesn't have a poll interval. Does that mean that pollinterval belongs in the Datasource?
    datapoint.pollinterval = PollInterval.one_hour;
  }
  datapoint.project = projectName;
  datapoint.subsystem = subsystemName;
  return request(
    projectName + '/' + subsystemName + '/' + datapoint.name,
    'PUT',
    JSON.stringify(datapoint),
    WAIT_AFTER_EXEC_MS
  );
};

export const deleteDatapoint = (projectName: string, subsystemName: string, datapointName: string) =>
  request<void>(projectName + '/' + subsystemName + '/' + datapointName, 'DELETE', '', WAIT_AFTER_EXEC_MS);

export const renameDatapoint = (
  projectName: string,
  subsystemName: string,
  oldName: string,
  newName: string
) => {
  const path = projectName + '/' + subsystemName + '/' + oldName
  const change = {
    oldName: oldName,
    newName: newName,
  };
  return request<void>(path, 'POST', JSON.stringify(change), WAIT_AFTER_EXEC_MS);
};

export const getLimits = () => request<Limits>('_limits/current', 'GET', '', 20);

export const getPlans = () => request<PlanSettings[]>('_plans', 'GET', '', 20);

export const checkout = (price: string) =>
  request<string>('_plans/checkout', 'POST', '{ "price": "' + price + '"}', 100);

export const getPayments = () => request<Payment[]>('_payments/', 'GET', '', 20);

export const confirmation = (sessionId: string) =>
  request<string>('_checkout/success', 'POST', '{ "id": "' + sessionId + '"}', 500);

export const cancelled = (sessionId: string) =>
  request<string>('_checkout/cancelled', 'POST', '{ "id": "' + sessionId + '"}', 500);

// The Things Network
export const getResource = (projectName: string, resourceName: string) =>
  request<ResourceSettings>(projectName + '/_resources/' + resourceName, 'GET', '', 20);

// Scripts
export const updateScript = (script: Script) =>
  request<string>('_scripts', 'PUT', JSON.stringify(script), 500);

export const listScripts = () =>
  request<Script>('_scripts', 'GET', '');

// Datapoint Manual Update of Value
export const updateTimeseriesValues = ({
  projectName,
  subsystemName,
  datapointName,
  values,
}: {
  projectName: string,
  subsystemName: string,
  datapointName: string,
  values: TsPair[],
}) => {
  const path = '_timeseries/' + projectName + '/' + subsystemName + '/' + datapointName;
  return request<ResourceSettings>(path, 'PUT', JSON.stringify(values), 20);
}


// import ttn
export const fetchDevices = async (token: string, zone: string, app_id: string): Promise<FetchDevicesResponse> => {
  const baseURL = `https://${zone}.cloud.thethings.network`;
  const opts: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await fetch(`${baseURL}/api/v3/applications/${app_id}/devices`, opts);
    const rJson = await response.json();

    if (!response.ok) {
      const msg: string = rJson?.['message'] ?? `failed to fetch with response code ${response.statusText}`;

      return {
        error: new Error(msg),
        devices: [],
      };
    }

    return {
      devices: rJson?.['end_devices'],
    };
  } catch (error) {
    console.warn('failed to fetch devices', error);
    return {
      devices: [],
      error: new Error('failed to fetch devices'),
    };
  }
};

export const fetchUplinkMessage = async (
  token: string,
  zone: string,
  app_id: string,
  device_id: string,
  limit: number,
): Promise<FetchMessageResponse> => {
  const baseURL = `https://${zone}.cloud.thethings.network`;
  const path = `/api/v3/as/applications/${app_id}/devices/${device_id}/packages/storage/uplink_message`

  const fields = [
    'up.uplink_message.decoded_payload',
    'up.uplink_message.f_port',
    'up.uplink_message.rx_metadata'
  ]

  const reqURL = new URL(path, baseURL)
  reqURL.searchParams.append("field_mask", fields.join(','))
  reqURL.searchParams.append("order", '-received_at')
  if (limit) {
    reqURL.searchParams.append("limit", `${limit}`)
  }

  const opts = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await fetch(reqURL, opts);
    if (!response.ok) {
      return {
        messages: [],
        error: new Error(`failed to fetch with response code ${response.statusText}`),
      };
    }

    const rText = await response.text();
    const out = rText
      .split(/\r?\n/)
      .filter((r) => r !== '')
      .map((el) => JSON.parse(el)['result'] as msgResult);

    return {
      messages: out,
    };
  } catch (error) {
    console.warn(`failed to parse msg response of device: ${device_id}`, error);
    return {
      messages: [],
      error: new Error(`failed to parse response of device: ${device_id}`),
    };
  }
};
