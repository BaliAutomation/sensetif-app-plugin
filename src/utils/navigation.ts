import { getLocationSrv } from '@grafana/runtime';
import { UrlQueryMap } from '@grafana/data';
import { PageID } from 'pages';

const goTo = (tab: PageID, params?: UrlQueryMap) => {
  getLocationSrv().update({
    query: {
      tab: tab,
      ...params,
    },
  });
};

export const goToProjects = () => goTo('projects');

export const goToAddProject = () => goTo('new_project');

export const goToEditProject = (projectName: string) => goTo('edit_project', { project: projectName });

export const goToSubsystems = (projectName: string) => goTo('subsystems', { project: projectName });

export const goToAddSubsystem = (projectName: string) => goTo('new_subsystem', { project: projectName });

export const goToEditSubsystem = (projectName: string, subsystemName: string) =>
  goTo('edit_subsystem', { project: projectName, subsystem: subsystemName });

export const goToDatapoints = (projectName: string, subsystemName: string) =>
  goTo('datapoints', { project: projectName, subsystem: subsystemName });

export const goToAddDatapoint = (projectName: string, subsystemName: string) =>
  goTo('new_datapoint', { project: projectName, subsystem: subsystemName });

export const goToEditDatapoint = (projectName: string, subsystemName: string, datapointName: string) =>
  goTo('edit_datapoint', { project: projectName, subsystem: subsystemName, datapoint: datapointName });

export const goToPlans = () => goTo('plans');
