import React, { FC } from 'react';
import { getBackendSrv, getLocationSrv } from '@grafana/runtime';
import { SubsystemForm } from 'forms/SubsystemForm';
import { ProjectsPage } from 'pages';
import { SubsystemSettings } from 'types';
import { AppRootProps } from '@grafana/data';

export const AddSubsystem: FC<AppRootProps> = ({ query }) => {
  const addSubsystem = (subsystem: SubsystemSettings) =>
    getBackendSrv().post(`/api/plugin-proxy/sensetif-app/resources/projects/${query['project']}/subsystems`, subsystem);

  const goToProjects = () => {
    getLocationSrv().update({
      query: {
        tab: ProjectsPage.id,
      },
    });
  };

  return (
    <>
      <SubsystemForm
        onSubmit={(subsystem) => {
          addSubsystem(subsystem).then(() => goToProjects());
        }}
      />
    </>
  );
};
