import { getBackendSrv } from '@grafana/runtime';
import { ProjectSettings, SubsystemSettings } from 'types';
import { API_ROOT_PAGE } from './consts';

export const addProject = (project: ProjectSettings) =>
  getBackendSrv().post(`${API_ROOT_PAGE}/resources/projects`, project);
export const getProject = (name: string): Promise<ProjectSettings> =>
  getBackendSrv().get(`/api/plugin-proxy/sensetif-app/resources/projects/${name}`);
export const getProjects = (): Promise<ProjectSettings[]> =>
  getBackendSrv().get('/api/plugin-proxy/sensetif-app/resources/projects');

// subsystems
export const getSubsystems = (projectName: string): Promise<SubsystemSettings[]> =>
  getBackendSrv().get(`/api/plugin-proxy/sensetif-app/resources/projects/${projectName}/subsystems`);

export const addSubsystem = (projectName: string, subsystem: SubsystemSettings) =>
  getBackendSrv().post(`/api/plugin-proxy/sensetif-app/resources/projects/${projectName}/subsystems`, subsystem);

export const deleteSubsystem = (name: string): Promise<void> => {
  // toDo
  // return loadSubsystems(projectName);
  return Promise.resolve();
};
