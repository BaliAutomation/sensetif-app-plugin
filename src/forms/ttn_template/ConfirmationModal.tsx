import React, { useState, useEffect } from 'react';
import { ConfirmModal, CustomScrollbar, MultiSelect } from '@grafana/ui';
import { DatapointForm, datapointFormValues } from './DatapointForm';
import { SelectableValue } from '@grafana/data';

export type confirmationResult = {
  devices: string[];
  datapoints: string[];
  formValues: datapointFormValues;
};

export const ConfirmationModal = ({
  selectedDevice,
  datapoints,
  devices,
  onDismiss,
  onConfirm,
}: {
  selectedDevice: string
  datapoints: string[];
  devices: string[];
  onDismiss: () => void;
  onConfirm: (result: confirmationResult) => void;
}) => {
  let [devicesToImport, setDevicesToImport] = useState<SelectableValue[]>([]);
  let [datapointsToImport, setDatapointsToImport] = useState<SelectableValue[]>([]);

  useEffect(() => {
    setDevicesToImport(devices.map(device => ({ label: device, value: device })));
    setDatapointsToImport(datapoints.map(datapoint => ({ label: datapoint, value: datapoint })));
  }, [devices, datapoints]);

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
      isOpen={true}
      title={`Datapoints to import based on device: ${selectedDevice}`}
      body={
        <>
          <span>Datapooints:</span>
          <CustomScrollbar autoHide={false} autoHeightMax='250px'>
            <MultiSelect 
              options={datapoints.map(dp => ({label: dp, value: dp}))}
              value={datapointsToImport}
              onChange={(v) => {setDatapointsToImport(v)}}
            />
          </CustomScrollbar>

          <br />
          <span>Matching devices</span>
          <CustomScrollbar autoHide={false} autoHeightMax='250px'>

            <MultiSelect 
              options={devices.map(device => ({label: device, value: device}))}
              value={devicesToImport}
              onChange={(v) => {setDevicesToImport(v)}}
            />
          </CustomScrollbar>

          <br></br>

          <DatapointForm
            externalRef={formRef}
            onSubmit={(v) => {
              onConfirm({
                devices: devicesToImport.map(d => d.value),
                datapoints: datapointsToImport.map(d => d.value),
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

