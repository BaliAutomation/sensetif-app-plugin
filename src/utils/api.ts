import { getBackendSrv } from '@grafana/runtime';
import { DatapointSettings, ProjectSettings, SubsystemSettings } from 'types';
import { API_ROOT_PAGE } from './consts';

export const addProject = (project: ProjectSettings) =>
  getBackendSrv().post(`${API_ROOT_PAGE}/resources/projects`, project);
export const getProject = (name: string): Promise<ProjectSettings> =>
  getBackendSrv().get(`${API_ROOT_PAGE}/resources/projects/${name}`);
export const getProjects = (): Promise<ProjectSettings[]> => getBackendSrv().get(`${API_ROOT_PAGE}/resources/projects`);
export const deleteProject = (name: string) => getBackendSrv().delete(`${API_ROOT_PAGE}/resources/projects/${name}`);

// subsystems
export const getSubsystems = (projectName: string): Promise<SubsystemSettings[]> =>
  getBackendSrv().get(`${API_ROOT_PAGE}/resources/projects/${projectName}/subsystems`);

export const addSubsystem = (projectName: string, subsystem: SubsystemSettings) =>
  getBackendSrv().post(`${API_ROOT_PAGE}/resources/projects/${projectName}/subsystems`, subsystem);

export const deleteSubsystem = (name: string): Promise<void> => {
  // toDo
  // return loadSubsystems(projectName);
  return Promise.resolve();
};

// datapoints
export const getDatapoints = (projectName: string, subsystemName: string): Promise<DatapointSettings[]> =>
  getBackendSrv().get(`${API_ROOT_PAGE}/resources/projects/${projectName}/subsystems/${subsystemName}/datapoints`);

export const addDatapoint = (projectName: string, subsystemName: string, datapoint: DatapointSettings) =>
  getBackendSrv().post(`${API_ROOT_PAGE}/resources/projects/${projectName}/subsystems/${subsystemName}`, datapoint);
