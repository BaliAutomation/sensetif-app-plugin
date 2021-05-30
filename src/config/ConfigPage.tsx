import React, { PureComponent } from 'react';
import { PluginConfigPageProps, PluginMeta } from '@grafana/data';
import { Button, InfoBox } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';

export class ConfigPageBody extends PureComponent<PluginConfigPageProps<PluginMeta>> {
  constructor(props: PluginConfigPageProps<PluginMeta>) {
    super(props);
  }

  enable = () => {
    const updateCmd = {
      enabled: true,
      pinned: true,
    };

    return getBackendSrv()
      .post(`/api/plugins/${this.props.plugin.meta.id}/settings`, updateCmd)
      .then((r) => {
        window.location.href = window.location.href;
      });
  };

  render() {
    return !this.props.plugin.meta.enabled ? (
      <Button variant="primary" onClick={this.enable}>
        Enable
      </Button>
    ) : (
      <InfoBox title={this.props.plugin.meta.name}>Plguin already enabled</InfoBox>
    );
  }
}
