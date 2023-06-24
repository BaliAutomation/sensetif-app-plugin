import React, { useState, useEffect } from 'react';
import { ConfirmModal, CustomScrollbar, Field, MultiSelect, RadioButtonGroup } from '@grafana/ui';
import { DatapointForm, datapointFormValues } from './DatapointForm';
// import { SelectableValue } from '@grafana/data';
import { devicesMap, payloadField } from 'forms/TtnResourceForm';
import { SelectableValue } from '@grafana/data';

export type confirmationResult = {
  fPort: number;
  devices: matchingDevice[];
  datapoints: string[];
  formValues: datapointFormValues;
};

export const ConfirmationModal = ({
  selectedDevice,
  allDevices,
  onDismiss,
  onConfirm,
}: {
  selectedDevice: string
  allDevices: devicesMap,
  onDismiss: () => void;
  onConfirm: (result: confirmationResult) => void;
}) => {
  let [devicesOptions, setDevicesOptions] = useState<Array<SelectableValue<matchingDevice>>>([]);
  let [datapointsOptions, setDatapointsOptions] = useState<Array<SelectableValue<payloadField>>>([]);
  let [datapointsToImport, setDatapointsToImport] = useState<payloadField[]>([]);
  let [devicesToImport, setDevicesToImport] = useState<matchingDevice[]>([]);
  let [selectedFport, setSelectedFport] = useState<number>();

  useEffect(() => {
    const matchingDatapoints = getSupportedDatapoints(allDevices, selectedDevice, selectedFport)
    setDatapointsOptions(matchingDatapoints.map(d => ({ label: d.name, value: d })))
    setDatapointsToImport(matchingDatapoints)
  }, [allDevices, selectedDevice, selectedFport]);

  useEffect(() => {
    const matchingDevices = findDevicesWithDatapoints(allDevices, datapointsToImport)
    setDevicesOptions(matchingDevices.map(d => ({ label: d.id, value: d })))
    setDevicesToImport(matchingDevices)
  }, [allDevices, datapointsToImport]);

  const formRef = React.createRef<HTMLFormElement>();

  const submit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    } else {
      console.warn('no formRef current value');
    }
  };

  const onFportChanged = (fPort: number) => {
    setSelectedFport(fPort)
  }

  const onDatapointsChanged = (fields: Array<SelectableValue<payloadField>>) => {
    const datapoints = fields.map(f => f.value!)
    setDatapointsToImport(datapoints)
  }

  const onDevicesChanged = (fields: Array<SelectableValue<matchingDevice>>) => {
    const devices = fields.map(f => f.value!)
    setDevicesToImport(devices)
  }

  return (
    <ConfirmModal
      isOpen={true}
      title={`Datapoints to import based on device: ${selectedDevice}`}
      body={
        <>
          <Field label='fPort'>
            <RadioButtonGroup
              onChange={(v) => { onFportChanged(v) }}
              value={selectedFport}
              options={
                Object.keys(allDevices[selectedDevice].payload!.fPorts!)
                  .map(fPort => ({ label: fPort, value: Number(fPort) }))
              } />
          </Field>

          <Field label='Datapooints'>
            <CustomScrollbar autoHide={false} autoHeightMax='250px'>
              <MultiSelect<payloadField>
                options={datapointsOptions}
                value={datapointsToImport}
                onChange={(v) => { onDatapointsChanged(v) }}
              />
            </CustomScrollbar>
          </Field>

          <br />
          <Field label='Matching devices'>
            <CustomScrollbar autoHide={false} autoHeightMax='250px'>

              <MultiSelect<matchingDevice>
                options={devicesOptions}
                value={devicesToImport}
                onChange={(v) => { onDevicesChanged(v) }}
              />
            </CustomScrollbar>
          </Field>

          <br></br>

          <DatapointForm
            externalRef={formRef}
            onSubmit={(v) => {
              onConfirm({
                datapoints: datapointsToImport.map(d => d.name),
                devices: devicesToImport,
                formValues: v,
                fPort: selectedFport!,
              })
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

export type matchingDevice = {
  id: string;
  fPort: number;
}

const findDevicesWithDatapoints = (devices: devicesMap, datapoints: payloadField[]): matchingDevice[] => {
  let out: matchingDevice[] = []

  if (!datapoints || datapoints.length === 0) {
    return []
  }

  const datapointsNames = datapoints.filter(dp => dp.supported).map(dp => dp.name)

  Object.values(devices).forEach(device => {
    Object.entries(device.payload.fPorts ?? {}).forEach(([fPort, v]) => {
      const currentDeviceDatapointsNames = v.payload.filter(v => v.supported).map(v => v.name)
      if (containAllValues(currentDeviceDatapointsNames, datapointsNames)) {
        out.push({
          fPort: Number(fPort),
          id: device.id,
        })
      }
    })
  })

  return out
}

const getSupportedDatapoints = (devices: devicesMap, deviceId: string, fPort?: number): payloadField[] => {
  if (!fPort) {
    return []
  }

  return devices[deviceId].payload?.fPorts?.[fPort]?.payload.filter(f => f.supported) ?? []
}

const containAllValues = (arr: string[], values: string[]): boolean => {
  for (let v of values) {
    if (!arr.includes(v)) {
      return false
    }
  }

  return true
}

