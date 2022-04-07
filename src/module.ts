import { AppPlugin, AppPluginMeta } from '@grafana/data';
import { SensetifAppSettings } from './types';
import { SensetifRootPage } from './SensetifRootPage';
import { ConfigPageBody } from 'config/ConfigPage';
import { getLimits } from './utils/api';

const appPlugin = new AppPlugin<SensetifAppSettings>();
appPlugin.setRootPage(SensetifRootPage);
appPlugin.addConfigPage({
  title: 'Setup',
  icon: 'list-ul',
  body: ConfigPageBody,
  id: 'setup',
});

const existingInitFn = appPlugin.init;
appPlugin.init = (meta: AppPluginMeta<SensetifAppSettings>) => {
  existingInitFn(meta);
  console.log('Test point 1');
  let promise = getLimits();
  console.log('Test point 2');
  if (meta !== undefined) {
    promise.then((limits) => {
      console.log('Test point 3');
      if (meta.jsonData === undefined) {
        meta.jsonData = {};
        meta.jsonData.limits = limits;
      }
      if (meta.jsonData?.limits === undefined) {
        meta.jsonData.limits = limits;
      }
    });
  }
};
export const plugin = appPlugin;
