import { AppRootProps } from '@grafana/data';
import { Projects } from './Projects';
import { Subsystems } from './Subsystems';
import { Datapoints } from './Datapoints';
import { Billing } from './Billing';
import { EditProject } from './EditProject';
import { AddProject } from './AddProject';

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

export const DatapointsPage: PageDefinition = {
  component: Datapoints,
  icon: 'fa fa-project-diagram',
  id: 'datapoints',
  text: ' Datapoints',
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
pages[DatapointsPage.id] = DatapointsPage;
pages[BillingsPage.id] = BillingsPage;
