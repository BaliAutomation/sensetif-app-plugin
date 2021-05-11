import { PluginMeta } from '@grafana/data';

export class SensetifConfigCtrl {
  static template = '<h2>Sensetif - IoT Sensor Data Capture, Storage & Visualization</h2>';

  appEditCtrl: any;
  appModel?: PluginMeta;

  /** @ngInject */
  constructor($scope: any, $injector: any) {
    this.appEditCtrl.setPostUpdateHook(this.postUpdate.bind(this));

    // Make sure it has a JSON Data spot
    if (!this.appModel) {
      this.appModel = {} as PluginMeta;
    }

    // Required until we get the types sorted on appModel :(
    const appModel = this.appModel as any;
    if (!appModel.jsonData) {
      appModel.jsonData = {};
    }

    console.log('SensetifConfigCtrl', this);
  }

  postUpdate() {
    if (!this.appModel?.enabled) {
      console.log('Not enabled...');
      return;
    }

    // TODO, can do stuff after update
    console.log('Post Update:', this);
  }
}
