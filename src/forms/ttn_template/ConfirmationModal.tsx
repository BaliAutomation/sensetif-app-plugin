import React, { useState, useEffect } from 'react';
import { Badge, ConfirmModal, CustomScrollbar, HorizontalGroup } from '@grafana/ui';
import { DatapointForm, datapointFormValues } from './DatapointForm';

type device = {
  name: string
  import: boolean
}

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
  let [devicesToImport, setDevicesToImport] = useState<device[]>([]);

  useEffect(() => {
    setDevicesToImport(devices.map(device => ({ name: device, import: true })));
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

          <span>Datapooints:</span>
          <CustomScrollbar autoHide={false} autoHeightMax='250px'>
            <HorizontalGroup spacing="xs" align="flex-start" wrap>
              {datapoints.map(dp => (<Badge key={dp} text={dp} color={'green'} />))}
            </HorizontalGroup>
          </CustomScrollbar>

          <br />
          <span>Matching devices</span>
          <CustomScrollbar autoHide={false} autoHeightMax='250px'>

            <HorizontalGroup spacing="xs" align="flex-start" wrap>
              {devicesToImport.map((device, idx) => (
                <Badge
                  key={device.name}
                  text={device.name}
                  color={device.import ? 'green' : 'purple'}
                  icon={device.import ? 'check' : undefined}
                  tooltip={device.import ? 'click to exclude' : 'click to include'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    let copy = [...devicesToImport]
                    copy[idx].import = !copy[idx].import
                    setDevicesToImport(copy)
                  }}
                />)
              )}
            </HorizontalGroup>
          </CustomScrollbar>

          <br></br>


          <DatapointForm
            externalRef={formRef}
            onSubmit={(v) => {
              onConfirm({
                devices: devicesToImport.filter(e => e.import === true).map(e => e.name),
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

