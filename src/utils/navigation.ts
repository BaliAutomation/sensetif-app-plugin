import { getLocationSrv } from '@grafana/runtime';
import { UrlQueryMap } from '@grafana/data';
import { PageID } from 'pages';

export const goToTab = (tab: PageID, params?: UrlQueryMap) => {
  getLocationSrv().update({
    query: {
      tab: tab,
      ...params,
    },
  });
};

export const goToScripts = () => goToTab('scripts');

export const goToAddScript = () => goToTab('new_script');

export const goToProjects = () => goToTab('projects');

export const goToAddProject = () => goToTab('new_project');

export const goToImportProject = () => goToTab('import_project');

export const goToEditProject = (projectName: string) => goToTab('edit_project', { project: projectName });

export const goToSubsystems = (projectName: string) => goToTab('subsystems', { project: projectName });

export const goToAddSubsystem = (projectName: string) => goToTab('new_subsystem', { project: projectName });

export const goToEditSubsystem = (projectName: string, subsystemName: string) =>
  goToTab('edit_subsystem', { project: projectName, subsystem: subsystemName });

export const goToDatapoints = (projectName: string, subsystemName: string) =>
  goToTab('datapoints', { project: projectName, subsystem: subsystemName });

export const goToAddDatapoint = (projectName: string, subsystemName: string) =>
  goToTab('new_datapoint', { project: projectName, subsystem: subsystemName });

export const goToEditDatapoint = (projectName: string, subsystemName: string, datapointName: string) =>
  goToTab('edit_datapoint', { project: projectName, subsystem: subsystemName, datapoint: datapointName });

export const goToPlans = () => goToTab('plans');

export const goToResources = (projectName: string) => goToTab('resources', { project: projectName });
