import { getLocationSrv } from '@grafana/runtime';
import { AddProjectPage, AddSubsystemPage, EditProjectPage, ProjectsPage, SubsystemsPage } from 'pages';

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
