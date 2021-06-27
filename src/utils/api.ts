import { getBackendSrv } from '@grafana/runtime';
import { AuthenticationType, DatapointSettings, ProjectSettings, SubsystemSettings, UserPassDatapointDTO } from 'types';
import { API_EXEC_PATH } from './consts';

const WAIT_AFTER_EXEC_MS = 1000;

interface Command {
  resource: string;
  action: string;
  params?: any;
  payload?: any;
}

const exec = (cmd: Command, waitTime = 0) => {
  return new Promise<any>((resolve, reject) => {
    getBackendSrv()
      .post(API_EXEC_PATH, cmd)
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
export const upsertProject = (project: ProjectSettings) =>
  exec(
    {
      action: 'update',
      resource: 'project',
      payload: project,
    },
    WAIT_AFTER_EXEC_MS
  );

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
  exec({ action: 'delete', resource: 'project', params: { project: projectName } }, WAIT_AFTER_EXEC_MS);

export const renameProject = (oldName: string, newName: string) =>
  exec({ action: 'rename', resource: 'project', params: { oldName: oldName, newName: newName } }, WAIT_AFTER_EXEC_MS);

// subsystems
export const getSubsystems = (projectName: string): Promise<SubsystemSettings[]> =>
  exec({ action: 'list', resource: 'subsystem', params: { project: projectName } });

export const upsertSubsystem = (projectName: string, subsystem: SubsystemSettings) => {
  subsystem.project = projectName;
  return exec({ action: 'update', resource: 'subsystem', payload: subsystem, params: {} }, WAIT_AFTER_EXEC_MS);
};

export const deleteSubsystem = (projectName: string, subsystemName: string): Promise<void> =>
  exec(
    {
      action: 'delete',
      resource: 'subsystem',
      params: {
        project: projectName,
        subsystem: subsystemName,
      },
    },
    WAIT_AFTER_EXEC_MS
  );

export const renameSubsystem = (projectName: string, oldName: string, newName: string): Promise<void> =>
  exec(
    {
      action: 'rename',
      resource: 'subsystem',
      params: {
        project: projectName,
        oldName: oldName,
        newName: newName,
      },
    },
    WAIT_AFTER_EXEC_MS
  );

// datapoints
export const getDatapoints = (projectName: string, subsystemName: string): Promise<DatapointSettings[]> =>
  exec({ action: 'list', resource: 'datapoint', params: { project: projectName, subsystem: subsystemName } });

export const upsertDatapoint = (projectName: string, subsystemName: string, datapoint: DatapointSettings) => {
  const getPayload = (): DatapointSettings | UserPassDatapointDTO => {
    let payload: DatapointSettings = { ...datapoint, project: projectName, subsystem: subsystemName };

    if (datapoint.authenticationType === AuthenticationType.userpass) {
      let userPassPayload: UserPassDatapointDTO = {
        ...payload,
        auth: {
          u: payload.username!,
          p: payload.password!,
        },
      };

      return userPassPayload;
    }

    return payload;
  };

  const payload = getPayload();

  delete payload.username;
  delete payload.password;

  return exec(
    {
      action: 'update',
      resource: 'datapoint',
      payload: payload,
      params: {},
    },
    WAIT_AFTER_EXEC_MS
  );
};

export const deleteDatapoint = (projectName: string, subsystemName: string, datapointName: string): Promise<void> =>
  exec(
    {
      action: 'delete',
      resource: 'datapoint',
      params: {
        project: projectName,
        subsystem: subsystemName,
        datapoint: datapointName,
      },
    },
    WAIT_AFTER_EXEC_MS
  );

export const renameDatapoint = (
  projectName: string,
  subsystemName: string,
  oldName: string,
  newName: string
): Promise<void> =>
  exec(
    {
      action: 'rename',
      resource: 'datapoint',
      params: {
        project: projectName,
        subsystem: subsystemName,
        oldName: oldName,
        newName: newName,
      },
    },
    WAIT_AFTER_EXEC_MS
  );
