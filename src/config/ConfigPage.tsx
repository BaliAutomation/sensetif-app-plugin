import React from 'react';
import { AppPluginMeta, PluginConfigPageProps } from '@grafana/data';
import { Alert } from '@grafana/ui';
import { SensetifAppSettings } from 'types';

interface Props extends PluginConfigPageProps<AppPluginMeta<SensetifAppSettings>> {}

export const ConfigPageBody = ({ plugin }: Props) => {
  return (
    <Alert severity="info" title={plugin.meta.name}>
      Different part of the plugin are configured in different tabs separately.
    </Alert>
  );
};
