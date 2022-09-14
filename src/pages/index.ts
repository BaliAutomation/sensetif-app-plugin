import { AppRootProps } from '@grafana/data';
import { AddDatapoint } from './AddDatapoint';
import { AddProject } from './AddProject';
import { AddSubsystem } from './AddSubsystem';
import { AddThingsNetworkApplication } from './AddThingsNetworkApplication';
import { Cancelled } from './Cancelled';
import { Datapoints } from './Datapoints';
import { EditDatapoint } from './EditDatapoint';
import { EditProject } from './EditProject';
import { EditSubsystem } from './EditSubsystem';
import { EditThingsNetworkApplication } from './EditThingsNetworkApplication';
import { NotificationsPage } from './NotificationsPage';
import { Plans } from './Plans';
import { Projects } from './Projects';
import { ResourcesPage } from './Resources';
import { Subsystems } from './Subsystems';
import { Succeeded } from './Succeeded';

export type PageID =
  | 'projects'
  | 'new_project'
  | 'edit_project'
  | 'subsystems'
  | 'new_subsystem'
  | 'edit_subsystem'
  | 'datapoints'
  | 'new_datapoint'
  | 'edit_datapoint'
  | 'notifications'
  | 'plans'
  // | 'payments'
  | 'succeeded'
  | 'cancelled'
  | 'resources'
  | 'new_thingsnetwork_application'
  | 'edit_thingsnetwork_application';

export type PageDefinition = {
  component: React.FC<AppRootProps>;
  icon: string;
  id: PageID;
  text: string;
};

export const pages: PageDefinition[] = [
  {
    component: Projects,
    icon: 'fa fa-project-diagram',
    id: 'projects',
    text: ' Projects',
  },

  {
    component: EditProject,
    icon: 'fa fa-project-diagram',
    id: 'edit_project',
    text: ' Edit Project',
  },

  {
    component: AddProject,
    icon: 'fa fa-project-diagram',
    id: 'new_project',
    text: ' Add Project',
  },

  {
    component: Subsystems,
    icon: 'fa fa-project-diagram',
    id: 'subsystems',
    text: ' Subsystems',
  },

  {
    component: AddSubsystem,
    icon: 'fa fa-project-diagram',
    id: 'new_subsystem',
    text: ' Add Subsystem',
  },

  {
    component: EditSubsystem,
    icon: 'fa fa-project-diagram',
    id: 'edit_subsystem',
    text: ' Edit Subsystem',
  },

  {
    component: Datapoints,
    icon: 'fa fa-project-diagram',
    id: 'datapoints',
    text: ' Datapoints',
  },

  {
    component: AddDatapoint,
    icon: 'fa fa-project-diagram',
    id: 'new_datapoint',
    text: ' Add Datapoint',
  },

  {
    component: EditDatapoint,
    icon: 'fa fa-project-diagram',
    id: 'edit_datapoint',
    text: ' Edit Datapoint',
  },

  {
    component: NotificationsPage,
    icon: 'fa rocket',
    id: 'notifications',
    text: ' Notifications',
  },

  {
    component: Plans,
    icon: 'fa fa-file-invoice-dollar',
    id: 'plans',
    text: ' Plans',
  },

  // export const PaymentsPage: PageDefinition = {
  //   component: Payments,
  //   icon: 'fa fa-money',
  //   id: 'payments',
  //   text: ' Payments',
  // };

  {
    component: Succeeded,
    icon: 'fa fa-check',
    id: 'succeeded',
    text: ' Succeeded',
  },

  {
    component: Cancelled,
    icon: 'fa fa-minus-circle',
    id: 'cancelled',
    text: ' Cancelled',
  },

  // The Things Network
  {
    component: ResourcesPage,
    icon: 'fa helmet-battle',
    id: 'resources',
    text: ' Resources',
  },
  {
    component: AddThingsNetworkApplication,
    icon: 'fa cloud',
    id: 'new_thingsnetwork_application',
    text: ' Things Network',
  },
  {
    component: EditThingsNetworkApplication,
    icon: 'fa cloud',
    id: 'edit_thingsnetwork_application',
    text: ' Things Network',
  },
];
