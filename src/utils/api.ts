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

const request = (path: string, method: string, body: string, waitTime = 0) => {
  logInfo('Request: ' + method + ' ' + path);
  let srv = getBackendSrv();
  let request: Promise<any>;
  let url = API_RESOURCES + path;
  switch (method) {
    case 'GET':
      request = srv.get(url, body);
      break;
    case 'PUT':
      request = srv.put(url, body);
      break;
    case 'POST':
      request = srv.post(url, body);
      break;
    case 'DELETE':
      request = srv.delete(url);
      break;
  }
  return new Promise<any>((resolve, reject) => {
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
export const getProjects = (): Promise<ProjectSettings[]> => request('_', 'GET', '', 0);

export const getProject = (name: string): Promise<ProjectSettings> => request(name, 'GET', '', 0);

export const upsertProject = (project: ProjectSettings) =>
  request(project.name, 'PUT', JSON.stringify(project), WAIT_AFTER_EXEC_MS);

export const deleteProject = (projectName: string) => request(projectName, 'DELETE', '', WAIT_AFTER_EXEC_MS);

export const renameProject = (oldName: string, newName: string) => {
  let change = {
    oldName: oldName,
    newName: newName,
  };
  return request(oldName, 'POST', JSON.stringify(change), WAIT_AFTER_EXEC_MS);
};

// subsystems
export const getSubsystems = (projectName: string): Promise<SubsystemSettings[]> =>
  request(projectName + '/_', 'GET', '', 0);

export const getSubsystem = (projectName: string, subsystemName: string): Promise<SubsystemSettings> =>
  request(projectName + '/' + subsystemName, 'GET', '', 0);

export const upsertSubsystem = (projectName: string, subsystem: SubsystemSettings) => {
  subsystem.project = projectName;
  return request(projectName + '/' + subsystem.name, 'PUT', JSON.stringify(subsystem), WAIT_AFTER_EXEC_MS);
};

export const deleteSubsystem = (projectName: string, subsystemName: string): Promise<void> =>
  request(projectName + '/' + subsystemName, 'DELETE', '', WAIT_AFTER_EXEC_MS);

export const renameSubsystem = (projectName: string, oldName: string, newName: string): Promise<void> => {
  let change = {
    oldName: oldName,
    newName: newName,
  };
  return request(projectName + '/' + oldName, 'POST', JSON.stringify(change), WAIT_AFTER_EXEC_MS);
};

// datapoints
export const getDatapoints = (projectName: string, subsystemName: string): Promise<DatapointSettings[]> =>
  request(projectName + '/' + subsystemName + '/_', 'GET', '', 0);

export const getDatapoint = (
  projectName: string,
  subsystemName: string,
  datapointName: string
): Promise<DatapointSettings> => request(projectName + '/' + subsystemName + '/' + datapointName, 'GET', '', 0);

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

export const deleteDatapoint = (projectName: string, subsystemName: string, datapointName: string): Promise<void> =>
  request(projectName + '/' + subsystemName + '/' + datapointName, 'DELETE', '', WAIT_AFTER_EXEC_MS);

export const renameDatapoint = (
  projectName: string,
  subsystemName: string,
  oldName: string,
  newName: string
): Promise<void> => {
  let change = {
    oldName: oldName,
    newName: newName,
  };
  return request(projectName + '/' + subsystemName + '/' + oldName, 'POST', JSON.stringify(change), WAIT_AFTER_EXEC_MS);
};

export const getLimits = (): Promise<Limits> => request('_limits/current', 'GET', '', 20);

export const getPlans = (): Promise<PlanSettings[]> => request('_plans', 'GET', '', 20);

export const checkout = (price: string): Promise<string> =>
  request('_plans/checkout', 'POST', '{ "price": "' + price + '"}', 100);

export const getPayments = (): Promise<Payment[]> => request('_payments/', 'GET', '', 20);

export const confirmation = (sessionId: string): Promise<string> =>
  request('_checkout/success', 'POST', '{ "id": "' + sessionId + '"}', 500);

export const cancelled = (sessionId: string): Promise<string> =>
  request('_checkout/cancelled', 'POST', '{ "id": "' + sessionId + '"}', 500);

// The Things Network
export const getResource = (projectName: string, resourceName: string): Promise<ResourceSettings> =>
  request(projectName + '/_resources/' + resourceName, 'GET', '', 20);

// Datapoint Manual Update of Value
export const updateTimeseriesValues = (projectName: string, subsystemName: string, datapointName: string, values: TsPair[] ): Promise<ResourceSettings> =>
  request('_timeseries/' + projectName + '/' + subsystemName + '/' + datapointName, 'PUT', JSON.stringify(values), 20);
