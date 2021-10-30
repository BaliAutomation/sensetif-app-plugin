import { getBackendSrv } from '@grafana/runtime';
import { DatapointSettings, Payment, PlanSettings, ProjectSettings, SubsystemSettings } from 'types';
import { API_RESOURCES } from './consts';

const WAIT_AFTER_EXEC_MS = 1000;

const request = (path: string, method: string, body: string, waitTime = 0) => {
  console.log('Request: ' + method + ' ' + path);
  let srv = getBackendSrv();
  let request: Promise<any>;
  switch (method) {
    case 'GET':
      request = srv.get(API_RESOURCES + path, body);
      break;
    case 'PUT':
      request = srv.put(API_RESOURCES + path, body);
      break;
    case 'POST':
      request = srv.post(API_RESOURCES + path, body);
      break;
    case 'DELETE':
      request = srv.delete(API_RESOURCES + path);
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
export const getProjects = (): Promise<ProjectSettings[]> => request('_', 'GET', '', WAIT_AFTER_EXEC_MS);

export const getProject = (name: string): Promise<ProjectSettings> => request(name, 'GET', '', WAIT_AFTER_EXEC_MS);

export const upsertProject = (project: ProjectSettings) =>
  request(project.name, 'PUT', JSON.stringify(project), WAIT_AFTER_EXEC_MS);

export const deleteProject = (projectName: string) => request(projectName, 'DELETE', '', WAIT_AFTER_EXEC_MS);

export const renameProject = (oldName: string, newName: string) => {
  var change = {
    oldName: oldName,
    newName: newName,
  };
  return request(oldName, 'POST', JSON.stringify(change), WAIT_AFTER_EXEC_MS);
};

// subsystems
export const getSubsystems = (projectName: string): Promise<SubsystemSettings[]> =>
  request(projectName + '/_', 'GET', '', WAIT_AFTER_EXEC_MS);

export const getSubsystem = (projectName: string, subsystemName: string): Promise<SubsystemSettings> =>
  request(projectName + '/' + subsystemName, 'GET', '', WAIT_AFTER_EXEC_MS);

export const upsertSubsystem = (projectName: string, subsystem: SubsystemSettings) => {
  subsystem.project = projectName;
  return request(projectName + '/' + subsystem.name, 'PUT', JSON.stringify(subsystem), WAIT_AFTER_EXEC_MS);
};

export const deleteSubsystem = (projectName: string, subsystemName: string): Promise<void> =>
  request(projectName + '/' + subsystemName, 'DELETE', '', WAIT_AFTER_EXEC_MS);

export const renameSubsystem = (projectName: string, oldName: string, newName: string): Promise<void> => {
  var change = {
    oldName: oldName,
    newName: newName,
  };
  return request(projectName + '/' + oldName, 'POST', JSON.stringify(change), WAIT_AFTER_EXEC_MS);
};

// datapoints
export const getDatapoints = (projectName: string, subsystemName: string): Promise<DatapointSettings[]> =>
  request(projectName + '/' + subsystemName + '/_', 'GET', '', WAIT_AFTER_EXEC_MS);

export const getDatapoint = (
  projectName: string,
  subsystemName: string,
  datapointName: string
): Promise<DatapointSettings> =>
  request(projectName + '/' + subsystemName + '/' + datapointName, 'GET', '', WAIT_AFTER_EXEC_MS);

export const upsertDatapoint = (projectName: string, subsystemName: string, datapoint: DatapointSettings) => {
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
  var change = {
    oldName: oldName,
    newName: newName,
  };
  return request(projectName + '/' + subsystemName + '/' + oldName, 'POST', JSON.stringify(change), WAIT_AFTER_EXEC_MS);
};

export const getPlans = (): Promise<PlanSettings[]> => request('_plans', 'GET', '', WAIT_AFTER_EXEC_MS);

export const checkout = (price: string): Promise<string> =>
  request('_plans/checkout', 'POST', '{ "price": "' + price + '"}', 1);

export const getPayments = (): Promise<Payment[]> => request('_payments/', 'GET', '', 0);

export const confirmation = (sessionId: string): Promise<string> =>
  request('_checkout/success', 'POST', '{ "id": "' + sessionId + '"}', 5000);

export const cancelled = (sessionId: string): Promise<string> =>
  request('_checkout/cancelled', 'POST', '{ "id": "' + sessionId + '"}', 5000);
