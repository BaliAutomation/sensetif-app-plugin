import { AppRootProps } from '@grafana/data';
import { Projects } from './Projects';
import { Subsystems } from './Subsystems';
import { Billing } from './Billing';
import { EditProject } from './EditProject';
import { AddProject } from './AddProject';
import { AddSubsystem } from './AddSubsystem';
import { EditSubsystem } from './EditSubsystem';
import { Datapoints } from './Datapoints';
import { AddDatapoint } from './AddDatapoint';
import { EditDatapoint } from './EditDatapoint';

export type PageDefinition = {
  component: React.FC<AppRootProps>;
  icon: string;
  id: string;
  text: string;
};

export const ProjectsPage: PageDefinition = {
  component: Projects,
  icon: 'fa fa-project-diagram',
  id: 'projects',
  text: ' Projects',
};

export const EditProjectPage: PageDefinition = {
  component: EditProject,
  icon: 'fa fa-project-diagram',
  id: 'edit_project',
  text: ' Edit Project',
};

export const AddProjectPage: PageDefinition = {
  component: AddProject,
  icon: 'fa fa-project-diagram',
  id: 'new_project',
  text: ' Add Project',
};

export const SubsystemsPage: PageDefinition = {
  component: Subsystems,
  icon: 'fa fa-project-diagram',
  id: 'subsystems',
  text: ' Subsystems',
};

export const AddSubsystemPage: PageDefinition = {
  component: AddSubsystem,
  icon: 'fa fa-project-diagram',
  id: 'new_subsystems',
  text: ' Add Subsystem',
};

export const EditSubsystemPage: PageDefinition = {
  component: EditSubsystem,
  icon: 'fa fa-project-diagram',
  id: 'edit_subsystem',
  text: ' Edit Subsystem',
};

export const DatapointsPage: PageDefinition = {
  component: Datapoints,
  icon: 'fa fa-project-diagram',
  id: 'datapoints',
  text: ' Datapoints',
};

export const AddDatapointPage: PageDefinition = {
  component: AddDatapoint,
  icon: 'fa fa-project-diagram',
  id: 'new_datapoints',
  text: ' Add Datapoint',
};

export const EditDatapointPage: PageDefinition = {
  component: EditDatapoint,
  icon: 'fa fa-project-diagram',
  id: 'edit_datapoint',
  text: ' Edit Datapoint',
};

export const BillingsPage: PageDefinition = {
  component: Billing,
  icon: 'fa fa-file-invoice-dollar',
  id: 'billing',
  text: ' Billing',
};

export const pages: Record<string, PageDefinition> = {};
pages[ProjectsPage.id] = ProjectsPage;
pages[AddProjectPage.id] = AddProjectPage;
pages[EditProjectPage.id] = EditProjectPage;

pages[SubsystemsPage.id] = SubsystemsPage;
pages[AddSubsystemPage.id] = AddSubsystemPage;
pages[EditSubsystemPage.id] = EditSubsystemPage;

pages[DatapointsPage.id] = DatapointsPage;
pages[AddDatapointPage.id] = AddDatapointPage;
pages[EditDatapointPage.id] = EditDatapointPage;

pages[BillingsPage.id] = BillingsPage;
