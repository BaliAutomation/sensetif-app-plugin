import { AppRootProps } from '@grafana/data';
import { Projects } from './Projects';
import { Subsystems } from './Subsystems';
import { Datapoints } from './Datapoints';
import { Billing } from './Billing';

export type PageDefinition = {
  component: React.FC<AppRootProps>;
  icon: string;
  id: string;
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
    component: Subsystems,
    icon: 'fa fa-project-diagram',
    id: 'subsystems',
    text: ' Subsystems',
  },
  {
    component: Datapoints,
    icon: 'fa fa-project-diagram',
    id: 'datapoints',
    text: ' Datapoints',
  },
  {
    component: Billing,
    icon: 'fa fa-file-invoice-dollar',
    id: 'billing',
    text: ' Billing',
  },
];
