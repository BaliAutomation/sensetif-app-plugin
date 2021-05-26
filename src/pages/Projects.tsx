import React, { FC, useEffect, useState } from 'react';
import { AppRootProps } from '@grafana/data';
import { ProjectsList } from '../components/ProjectsList';
import { ProjectSettings } from '../types';
import { getBackendSrv, logInfo } from '@grafana/runtime';

export const Projects: FC<AppRootProps> = ({ query, path, meta }) => {
  const [projects, setProjects] = useState<ProjectSettings[]>([]);

  useEffect(() => {
    logInfo('Trying to fetch Projects.');
    getBackendSrv()
      .get(`/api/plugins/bali-automation-sensetif-datasource-plugin/resources/projects`)
      .then((res: ProjectSettings[]) => {
        logInfo('Trying to convert json.');
        setProjects(res);
      });
  }, []);

  return <ProjectsList projects={projects} />;
};
