import React, { FC } from 'react';
import { SubsystemSettings } from '../types';
import { CardsList } from './CardsList';

interface Props {
  subsystems: SubsystemSettings[];

  onDelete: (project: SubsystemSettings) => void;
  onEdit: (project: SubsystemSettings) => void;
  onClick: (project: SubsystemSettings) => void;
}

export const SubsystemsList: FC<Props> = ({ subsystems, onClick, onEdit, onDelete }) => {
  const getDatapoints = (subsystem: SubsystemSettings) =>
    subsystem.datapoints?.length ? `${subsystem.datapoints?.length}` : 'No datapoints';

  return (
    <>
      <CardsList<SubsystemSettings>
        elements={subsystems}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        getTitle={(subsystem) => subsystem.name}
        getSubtitle={(subsystem) => subsystem.locallocation}
        getRightSideText={getDatapoints}
      />
    </>
  );
};
