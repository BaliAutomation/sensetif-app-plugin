import { getLocationSrv } from '@grafana/runtime';
import {
  AddDatapointPage,
  AddProjectPage,
  AddSubsystemPage,
  DatapointsPage,
  EditDatapointPage,
  EditProjectPage,
  EditSubsystemPage,
  PaymentsPage,
  ProjectsPage,
  SubsystemsPage,
} from 'pages';

export const goToProjects = () => {
  getLocationSrv().update({
    query: {
      tab: ProjectsPage.id,
    },
  });
};

export const goToAddProject = () => {
  getLocationSrv().update({
    query: {
      tab: AddProjectPage.id,
    },
  });
};

export const goToEditProject = (projectName: string) => {
  getLocationSrv().update({
    query: {
      tab: EditProjectPage.id,
      project: projectName,
    },
  });
};

export const goToSubsystems = (projectName: string) => {
  getLocationSrv().update({
    query: {
      tab: SubsystemsPage.id,
      project: projectName,
    },
  });
};

export const goToAddSubsystem = (projectName: string) => {
  getLocationSrv().update({
    query: {
      tab: AddSubsystemPage.id,
      project: projectName,
    },
  });
};

export const goToEditSubsystem = (projectName: string, subsystemName: string) => {
  getLocationSrv().update({
    query: {
      tab: EditSubsystemPage.id,
      project: projectName,
      subsystem: subsystemName,
    },
  });
};

export const goToDatapoints = (projectName: string, subsystemName: string) => {
  getLocationSrv().update({
    query: {
      tab: DatapointsPage.id,
      project: projectName,
      subsystem: subsystemName,
    },
  });
};

export const goToAddDatapoint = (projectName: string, subsystemName: string) => {
  getLocationSrv().update({
    query: {
      tab: AddDatapointPage.id,
      project: projectName,
      subsystem: subsystemName,
    },
  });
};

export const goToEditDatapoint = (projectName: string, subsystemName: string, datapointName: string) => {
  getLocationSrv().update({
    query: {
      tab: EditDatapointPage.id,
      project: projectName,
      subsystem: subsystemName,
      datapoint: datapointName,
    },
  });
};

export const goToPayments = () => {
  getLocationSrv().update({
    query: {
      tab: PaymentsPage.id,
    },
  });
};
