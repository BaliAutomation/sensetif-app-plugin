import { getBackendSrv } from '@grafana/runtime';
import { DatapointSettings, ProjectSettings, SubsystemSettings } from 'types';
import { API_EXEC_PATH } from './consts';

interface Command {
  resource: string;
  action: string;
  params?: any;
  payload?: any;
}

const exec = (cmd: Command) => getBackendSrv().post(API_EXEC_PATH, cmd);

// projects
export const upsertProject = (project: ProjectSettings) =>
  exec({
    action: 'update',
    resource: 'project',
    payload: project,
  });

export const getProject = (name: string): Promise<ProjectSettings> =>
  exec({
    action: 'get',
    resource: 'project',
    params: {
      project: name,
    },
  });

export const getProjects = (): Promise<ProjectSettings[]> => exec({ action: 'list', resource: 'project' });

export const deleteProject = (projectName: string) =>
  exec({ action: 'delete', resource: 'project', params: { project: projectName } });

export const renameProject = (oldName: string, newName: string) =>
  exec({ action: 'rename', resource: 'project', params: { oldName: oldName, newName: newName } });

// subsystems
export const getSubsystems = (projectName: string): Promise<SubsystemSettings[]> =>
  exec({ action: 'list', resource: 'subsystem', params: { project: projectName } });

export const upsertSubsystem = (projectName: string, subsystem: SubsystemSettings) => {
  subsystem.project = projectName;
  exec({ action: 'update', resource: 'subsystem', payload: subsystem, params: {} });
};

export const deleteSubsystem = (projectName: string, subsystemName: string): Promise<void> =>
  exec({
    action: 'delete',
    resource: 'subsystem',
    params: {
      project: projectName,
      subsystem: subsystemName,
    },
  });

export const renameSubsystem = (projectName: string, oldName: string, newName: string): Promise<void> =>
  exec({
    action: 'rename',
    resource: 'subsystem',
    params: {
      project: projectName,
      oldName: oldName,
      newName: newName,
    },
  });

// datapoints
export const getDatapoints = (projectName: string, subsystemName: string): Promise<DatapointSettings[]> =>
  exec({ action: 'list', resource: 'datapoint', params: { project: projectName, subsystem: subsystemName } });

export const upsertDatapoint = (projectName: string, subsystemName: string, datapoint: DatapointSettings) => {
  datapoint.project = projectName;
  datapoint.subsystem = subsystemName;
  exec({
    action: 'update',
    resource: 'datapoint',
    payload: datapoint,
    params: {},
  });
};

export const deleteDatapoint = (projectName: string, subsystemName: string, datapointName: string): Promise<void> =>
  exec({
    action: 'delete',
    resource: 'datapoint',
    params: {
      project: projectName,
      subsystem: subsystemName,
      datapoint: datapointName,
    },
  });

export const renameDatapoint = (
  projectName: string,
  subsystemName: string,
  oldName: string,
  newName: string
): Promise<void> =>
  exec({
    action: 'rename',
    resource: 'datapoint',
    params: {
      project: projectName,
      subsystem: subsystemName,
      oldName: oldName,
      newName: newName,
    },
  });
