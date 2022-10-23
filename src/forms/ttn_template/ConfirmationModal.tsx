import React, { useState, useEffect } from 'react';
import { ConfirmModal, TagList } from '@grafana/ui';
import { DatapointForm, datapointFormValues } from './DatapointForm';
import { css } from '@emotion/css';

const tagCss = css`
  justify-content: left;
`;

export type confirmationResult = {
  devices: string[];
  datapoints: string[];
  formValues: datapointFormValues;
};

export const ConfirmationModal = ({
  datapoints,
  devices,
  isOpen,
  onDismiss,
  onConfirm,
}: {
  datapoints: string[];
  devices: string[];
  isOpen: boolean;
  onDismiss: () => void;
  onConfirm: (result: confirmationResult) => void;
}) => {
  let [devicesToImport, setDevicesToImport] = useState<string[]>([]);

  useEffect(() => {
    setDevicesToImport(devices);
  }, [devices]);

  const formRef = React.createRef<HTMLFormElement>();

  const submit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    } else {
      console.warn('no formRef current value');
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={'Datapoints to import'}
      body={
        <>
          <span>datapooints:</span>
          <TagList tags={datapoints} className={tagCss} />
          <br></br>
          <span>matching devices</span>
          <TagList
            icon={'trash-alt'}
            tags={devicesToImport}
            onClick={(name) => {
              const idx = devicesToImport.findIndex((el) => el === name);
              let copy = [...devicesToImport];
              copy.splice(idx, 1);
              setDevicesToImport(copy);
            }}
            className={tagCss}
          />
          <br></br>

          <DatapointForm
            externalRef={formRef}
            onSubmit={(v) => {
              onConfirm({
                devices: devicesToImport,
                datapoints: datapoints,
                formValues: v,
              });
            }}
          />
        </>
      }
      description={'Confirm you want to import these devices'}
      confirmText={'Import'}
      dismissText={'Cancel'}
      onConfirm={submit}
      onDismiss={onDismiss}
    />
  );
};
