import { ComponentClass } from 'react';
import { AppPlugin, AppRootProps } from '@grafana/data';
import { SensetifRootPage } from './SensetifRootPage';
import { SensetifAppSettings } from './types';
import { SensetifConfigCtrl } from 'legacy/config';

export { SensetifConfigCtrl as ConfigCtrl };

export const plugin = new AppPlugin<SensetifAppSettings>().setRootPage(
  (SensetifRootPage as unknown) as ComponentClass<AppRootProps>
);
