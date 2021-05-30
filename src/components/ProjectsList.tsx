import React, { FC } from 'react';
import { ProjectSettings } from '../types';
import { CardsList } from './CardsList';

interface Props {
  projects: ProjectSettings[];
  onDelete: (project: ProjectSettings) => void;
  onEdit: (project: ProjectSettings) => void;
  onClick: (project: ProjectSettings) => void;
}

export const ProjectsList: FC<Props> = ({ projects, onClick, onEdit, onDelete }) => {
  const getSubsystems = (project: ProjectSettings) =>
    project.subsystems?.length ? `${project.subsystems?.length}` : 'No subsystems';
  const getSubtitle = (project: ProjectSettings) => (project.city ? project.city : 'Not specified');

  return (
    <>
      <CardsList<ProjectSettings>
        elements={projects}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        getTitle={(project) => project.title}
        getSubtitle={getSubtitle}
        getRightSideText={getSubsystems}
      />
    </>
  );
};
