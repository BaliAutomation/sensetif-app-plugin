import React, { FC, useEffect, useState } from 'react';
import { logInfo } from '@grafana/runtime';
import {
  DatasourceType,
  MqttClientSettings,
  ResourceSettings,
  ThingsNetworkApplicationSettings,
  WebResourceSettings,
} from '../types';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getResources } from 'api';
import { PageHeader } from 'components/PageTitle';
import { TreeItem, TreeView } from '@material-ui/lab';
import { AppRootProps } from '@grafana/data';

export const ResourcesPage: FC<AppRootProps> = ({ query }) => {
  const projectName = query['project'];
  const [resources, setResources] = useState<ResourceSettings[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    logInfo('Trying to fetch Resources.');
    loadResources(projectName);
  }, [projectName]);

  const loadResources = (projectName: string) => {
    setIsLoading(true);
    return getResources(projectName)
      .then((resources) => {
        logInfo('Trying to convert json.');
        setResources(resources);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // const removeResource = (name: string): Promise<void> => {
  //   logInfo('Deleting Resource: ' + name);
  //   return deleteResource(name).then(() => loadResources());
  // };

  const ttn = (zone: string) => {
    return (
      <>
        {resources
          .filter((r) => r.type === DatasourceType.ttnv3)
          .map((r) => r as ThingsNetworkApplicationSettings)
          .filter((r) => r.zone === zone)
          .map((r) => TreeItem({ nodeId: r.zone + '-' + r.name, label: r.name }))}
      </>
    );
  };

  const mqttClients = () => {
    return (
      <>
        {resources
          .filter((r) => r.type === DatasourceType.mqtt)
          .map((r) => r as MqttClientSettings)
          .map((r) => TreeItem({ nodeId: r.name, label: r.name }))}
      </>
    );
  };

  const webResources = () => {
    return (
      <>
        {resources
          .filter((r) => r.type === DatasourceType.web)
          .map((r) => r as WebResourceSettings)
          .map((r) => TreeItem({ nodeId: r.name, label: r.name }))}
      </>
    );
  };

  return (
    <>
      <PageHeader title={''} subtitle={''} />
      {!isLoading && (
        <TreeView
          aria-label="multi-select"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          style={{ height: 216, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
          // sx={{ height: 216, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
          multiSelect
        >
          <TreeItem nodeId="_ttnv3" label="Things Network - Community">
            <TreeItem nodeId="_ttnv3-eu1" label="Europe 1">
              {ttn('eu1')}
            </TreeItem>
            <TreeItem nodeId="_ttnv3-nam1" label="North America 1">
              {ttn('nam1')}
            </TreeItem>
            <TreeItem nodeId="_ttnv3-au1" label="Australia 1">
              {ttn('au1')}
            </TreeItem>
          </TreeItem>
          <TreeItem nodeId="_mqtt-clients" label="MQTT Clients">
            {mqttClients()}
          </TreeItem>
          <TreeItem nodeId="_web-resources" label="Web Resources">
            {webResources()}
          </TreeItem>
        </TreeView>
      )}
    </>
  );
};
