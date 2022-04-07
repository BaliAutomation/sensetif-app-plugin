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
  console.log('Test point 1: ' + meta);
  if (meta !== undefined) {
    let promise = getLimits();
    console.log('Test point 2: ' + promise);
    promise.then((limits) => {
      console.log('Test point 3: ', JSON.stringify(limits));
      if (meta === undefined) {
        console.log('Test point 4: ', JSON.stringify(limits));
      }
      console.log('Test point 10: ' + meta + ', ' + meta.jsonData + ', ' + (meta.jsonData === undefined));
      if (meta.jsonData === undefined || meta.jsonData === null) {
        console.log('Test point 5: ' + meta + ', ' + meta.jsonData);
        meta.jsonData = {};
        console.log('Test point 6: ' + meta + ', ' + meta.jsonData);
      }
      console.log('Test point 7: ' + JSON.stringify(meta));
      if (meta.jsonData.limits === undefined) {
        console.log('Test point 8: ' + JSON.stringify(meta.jsonData));
        meta.jsonData.limits = limits;
        console.log('Test point 9: ' + JSON.stringify(meta.jsonData));
      }
    });
  }
};
export const plugin = appPlugin;
