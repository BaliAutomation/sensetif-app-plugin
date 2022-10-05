import React from 'react';
import { ConfirmModal, TagList } from '@grafana/ui';
import { css } from '@emotion/css';

export const ConfirmationModal = ({
  datapoints,
  devices,
  isOpen,
  onDismiss,
}: {
  datapoints: string[];
  devices: string[];
  isOpen: boolean;
  onDismiss: () => void;
}) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title={'Datapoints to import'}
      body={
        <>
          <span>datapooints:</span>
          <TagList
            tags={datapoints}
            className={css`
              justify-content: left;
            `}
          />
          <br></br>
          <span>matching devices</span>
          <TagList
            tags={devices}
            className={css`
              justify-content: left;
            `}
          />
          <br></br>
        </>
      }
      description={'Confirm you want to import these devices'}
      confirmText={'Import'}
      dismissText={'Cancel'}
      // alternativeText={'Import'}
      // icon={icon}
      onConfirm={() => {
        alert('done');
      }}
      onDismiss={onDismiss}
      // onAlternative={() => {alert('done')}}
    />
  );
};
