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
  TsPair
} from 'types';
import { API_RESOURCES } from './consts';

const WAIT_AFTER_EXEC_MS = 200;


const request = async <T>(path: string, method: string, body: string, waitTime = 0) => {
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
  return new Promise<T>((resolve, reject) => {
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
