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

export const deleteProject = (name: string) =>
  exec({ action: 'delete', resource: 'project', params: { project: name } });

// subsystems
export const getSubsystems = (projectName: string): Promise<SubsystemSettings[]> =>
  exec({ action: 'list', resource: 'subsystem', params: { project: projectName } });

export const addSubsystem = (projectName: string, subsystem: SubsystemSettings) =>
  exec({ action: 'update', resource: 'subsystem', payload: subsystem, params: { project: projectName } });

export const deleteSubsystem = (name: string): Promise<void> =>
  exec({ action: 'delete', resource: 'subsystem', params: { subsystem: name } });

// datapoints
export const getDatapoints = (projectName: string, subsystemName: string): Promise<DatapointSettings[]> =>
  exec({ action: 'list', resource: 'datapoint', params: { project: projectName, subsystem: subsystemName } });

export const addDatapoint = (projectName: string, subsystemName: string, datapoint: DatapointSettings) =>
  exec({
    action: 'update',
    resource: 'datapoint',
    payload: datapoint,
    params: { project: projectName, subsystem: subsystemName },
  });

export const deleteDatapoint = (name: string): Promise<void> =>
  exec({ action: 'delete', resource: 'datapoint', params: { datapoint: name } });
