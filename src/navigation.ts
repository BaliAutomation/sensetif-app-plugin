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

export const goToResources = (projectName: string) => goTo('resources', { project: projectName });
export const goToAddThingsNetworkApplication = (projectName: string) =>
  goTo('new_thingsnetwork_application', { project: projectName });
export const goToAddMqttClient = (projectName: string) => goTo('new_mqtt_client', { project: projectName });
export const goToAddWebResource = (projectName: string) => goTo('new_web_resource', { project: projectName });

export const goToEditThingsNetworkApplication = (projectName: string, resourceName: string) =>
  goTo('edit_thingsnetwork_application', { project: projectName, resource: resourceName });
export const goToEditMqttClient = (projectName: string, resourceName: string) =>
  goTo('edit_mqtt_client', { project: projectName, resource: resourceName });
export const goToEditWebResource = (projectName: string, resourceName: string) =>
  goTo('edit_web_resource', { project: projectName, resource: resourceName });
