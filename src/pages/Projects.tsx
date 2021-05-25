import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { ProjectsList } from '../components/ProjectsList';
import { ProjectSettings } from '../types';
import { getBackendSrv, logInfo } from '@grafana/runtime';

export const Projects: FC<AppRootProps> = ({ query, path, meta }) => {
  const [projects, setProjects] = useState<ProjectSettings[]>([]);

  // let projects: ProjectSettings[] = [
  //   {
  //     name: 'sbc1_malmo',
  //     title: 'Brf Benzelius',
  //     city: 'Lund',
  //     geolocation: '@55.884878,13.156352,13z',
  //     subsystems: [],
  //   },
  //   {
  //     name: 'sbc2_malmo',
  //     title: 'Brf Lillbragden',
  //     city: 'Malmö',
  //     geolocation: '@55.884878,13.156352,13z',
  //     subsystems: [],
  //   },
  //   {
  //     name: 'sbc3_malmo',
  //     title: 'Brf Majoren',
  //     city: 'Malmö',
  //     geolocation: '@55.884878,13.156352,13z',
  //     subsystems: [],
  //   },
  //   {
  //     name: 'sbc4_malmo',
  //     title: 'Brf Schougen',
  //     city: 'Malmö',
  //     geolocation: '@55.884878,13.156352,13z',
  //     subsystems: [],
  //   },
  // ];
  // TODO: This doesn't work because some language trick React is using. Perhaps the fetching of projects should be in the datasource plugin
  useEffect(() => {
    logInfo('Trying to fetch Projects.');
    getBackendSrv()
      .get(`/api/plugins/bali-automation-sensetif-datasource-plugin/resources/projects`)
      .then((res: Response): Promise<ProjectSettings[]> => {
        logInfo('Trying to convert json.');
        return res.json();
      })
      .then((projs: ProjectSettings[]) => {
        logInfo('Trying to set projects to state variable.');
        setProjects(projs);
      });
    // .catch((error) => logError(error));
  }, []);

  return <ProjectsList projects={projects} />;
};
