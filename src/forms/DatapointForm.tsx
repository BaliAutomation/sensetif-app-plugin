import React, { FC } from 'react';
import {
  DatapointSettings,
  Datasource,
  DatasourceType,
  ScalingFunction,
  Ttnv3Datasource,
  WebDatasource,
  MqttDatasource,
} from '../types';
import {
  Button,
  Field,
  FieldSet,
  HorizontalGroup,
  Input,
  InputControl,
  Label,
  RadioButtonGroup,
  Select,
} from '@grafana/ui';
import { css } from '@emotion/css';
import { DATAPOINT_PATTERN_NAME } from './common';
import { AvailablePollIntervals, AvailableTimeToLivePeriods } from '../utils/consts';
import { MqttDatasourceForm, defaultValues as defaultMqqt } from './datapoint/MqttDatasourceForm';
import { WebDatasourceForm, defaultValues as defaultWeb } from './datapoint/WebDatasourceForm';
import { Ttnv3DatasourceForm, defaultValues as defaultTtnv3 } from './datapoint/Ttnv3DatasourceForm';
import { SubmitErrorHandler, SubmitHandler, useForm, UseFormReturn } from 'react-hook-form';

interface Props {
  datapoint?: DatapointSettings;
  onSubmit: (data: DatapointSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
  onCancel: () => void;
  projectName: string;
  subsystemName: string;
}

export const DatapointForm: FC<Props> = ({ datapoint, projectName, subsystemName, onSubmit, onCancel }) => {
  const numericInputStyle = css`
    /* hides spin buttons */

    input[type='number']::-webkit-inner-spin-button {
      display: none;
      -webkit-appearance: none;
    }
  `;

  function hasPollInterval(datapoint: DatapointSettings | undefined) {
    if (datapoint === undefined) {
      return true;
    }
    switch (datapoint.datasourcetype) {
      case DatasourceType.web:
        return true;
      case DatasourceType.ttnv3:
        return true;
      case DatasourceType.mqtt:
        return false;
      default:
        return true;
    }
  }

  const defaultValues: Partial<DatapointSettings> = datapoint ?? {
    proc: {
      scaling: ScalingFunction.lin,
      unit: '',
      k: 1.0,
      m: 0.0,
      min: -10000,
      max: 10000,
      condition: '',
      scalefunc: '',
    },
    datasourcetype: DatasourceType.mqtt,
  };

  const {
    formState: { errors },
    watch,
    control,
    register,
    handleSubmit,
  } = useForm<DatapointSettings>({
    mode: 'onSubmit',
    defaultValues,
  });

  const scaling = watch('proc.scaling');
  const sourceType = watch('datasourcetype');

  let dsForm = useForm<Datasource>({
    mode: 'onSubmit',
    shouldUnregister: true,
    defaultValues: defaultDatasource(defaultValues.datasourcetype!),
  });

  const onValid: SubmitHandler<DatapointSettings> = async (datapoint) => {
    validateDatasourceSubform(
      (ds) => {
        const out: DatapointSettings = {
          ...datapoint,
          datasource: ds,
        };
        console.log(out);
        onSubmit(out);
      },
      (err) => {
        console.log(err);
      }
    );
  };
  const onInvalid: SubmitErrorHandler<DatapointSettings> = (err) => {
    console.log(err);
  };

  const validateDatasourceSubform = async (onValid: SubmitHandler<any>, onInvalid: SubmitErrorHandler<any>) => {
    await dsForm.handleSubmit(onValid, onInvalid)();
  };

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)}>
      <>
        <Label>Project: {projectName}</Label>
        <Label>Subsystem: {subsystemName}</Label>
        <br />
        <FieldSet label="Datapoint">
          <Field label="Name" invalid={!!errors.name} error={errors.name && errors.name.message}>
            <Input
              {...register('name', {
                required: 'Datapoint name is required',
                pattern: {
                  value: DATAPOINT_PATTERN_NAME,
                  message: 'Allowed letters, numbers, and ".-_$[]". Must start with a letter.',
                },
              })}
              readOnly={!!datapoint}
              placeholder="Datapoint name"
            />
          </Field>
          <HorizontalGroup>
            <Field
              label="Storage Period"
              invalid={!errors.proc || !!errors.proc.scaling}
              error={errors.proc ? errors.proc.scaling && errors.proc.scaling.message : undefined}
            >
              <InputControl
                render={({ field: { onChange, ref, ...field } }) => (
                  <Select
                    {...field}
                    onChange={(selectable) => onChange(selectable.value)}
                    options={AvailableTimeToLivePeriods}
                  />
                )}
                rules={{
                  required: 'Storage Period selection is required',
                }}
                control={control}
                defaultValue={AvailableTimeToLivePeriods[0]}
                name="timeToLive"
              />
            </Field>
            {hasPollInterval(datapoint) && (
              <Field
                label="Poll interval"
                invalid={!!errors.pollinterval}
                error={errors.pollinterval && errors.pollinterval.message}
              >
                <InputControl
                  render={({ field: { onChange, ref, ...field } }) => (
                    <Select
                      {...field}
                      disabled={!!datapoint}
                      onChange={(selectable) => onChange(selectable.value)}
                      options={AvailablePollIntervals}
                    />
                  )}
                  rules={{
                    required: 'Interval selection is required',
                  }}
                  name="pollinterval"
                  control={control}
                  defaultValue={AvailablePollIntervals[5]}
                />
              </Field>
            )}
          </HorizontalGroup>
          <HorizontalGroup>
            <Field
              label="Unit"
              invalid={!!errors.proc && !!errors.proc.unit}
              error={errors.proc ? errors.proc.unit && errors.proc.unit.message : undefined}
            >
              <Input
                {...register('proc.unit', {
                  required: 'Unit is required',
                })}
                placeholder="unit"
              />
            </Field>
            <Field
              label="Scaling"
              invalid={!errors.proc || !!errors.proc.scaling}
              error={errors.proc ? errors.proc.scaling && errors.proc.scaling.message : undefined}
            >
              <InputControl
                render={({ field: { onChange, ref, ...field } }) => (
                  <Select
                    {...field}
                    onChange={(selectable) => onChange(selectable.value)}
                    options={[
                      { label: 'Linear [y = k * x + m]', value: ScalingFunction.lin },
                      { label: 'Logarithmic [y = k * ln(x * m)]', value: ScalingFunction.log },
                      { label: 'Exponential [y = k * exp(x * m)]', value: ScalingFunction.exp },
                      { label: 'Degrees->Radians', value: ScalingFunction.rad },
                      { label: 'Radians->Degrees', value: ScalingFunction.deg },
                      { label: 'Fahrenheit->Celsius', value: ScalingFunction.fToC },
                      { label: 'Celsius->Fahrenheit', value: ScalingFunction.cToF },
                      { label: 'Kelvin->Celsius', value: ScalingFunction.kToC },
                      { label: 'Celsius->Kelvin', value: ScalingFunction.cToK },
                      { label: 'Kelvin->Fahrenheit', value: ScalingFunction.kToF },
                      { label: 'Fahrenheit->Kelvin', value: ScalingFunction.fToK },
                    ]}
                  />
                )}
                rules={{
                  required: 'Function selection is required',
                }}
                control={control}
                defaultValue={ScalingFunction.lin}
                name="proc.scaling"
              />
            </Field>
            {(scaling === ScalingFunction.lin ||
              scaling === ScalingFunction.log ||
              scaling === ScalingFunction.exp) && (
              <Field label="k">
                <Input
                  {...register('proc.k', {
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="any"
                  className={numericInputStyle}
                />
              </Field>
            )}
            {(scaling === ScalingFunction.lin ||
              scaling === ScalingFunction.log ||
              scaling === ScalingFunction.exp) && (
              <Field label="m">
                <Input
                  {...register('proc.m', {
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="any"
                  className={numericInputStyle}
                />
              </Field>
            )}
          </HorizontalGroup>
        </FieldSet>

        <FieldSet label="Datasource">
          <Field label="Type">
            <InputControl
              render={({ field: { ref, ...field } }) => (
                <RadioButtonGroup
                  {...field}
                  options={[
                    { label: 'Http(s)', value: DatasourceType.web },
                    { label: 'Things Network', value: DatasourceType.ttnv3 },
                    { label: 'MQTT', value: DatasourceType.mqtt },
                  ]}
                />
              )}
              rules={{
                required: 'Source type selection is required',
              }}
              control={control}
              defaultValue={datapoint ? datapoint.datasourcetype : DatasourceType.web}
              name="datasourcetype"
            />
          </Field>
          <DatasourceSubform sourceType={sourceType} api={dsForm} />
        </FieldSet>
        <HorizontalGroup>
          <Button type="button" variant={'secondary'} onClick={onCancel}>
            {'Cancel'}
          </Button>
          <Button type="submit">{!!datapoint ? 'Update' : 'Save'}</Button>
        </HorizontalGroup>
      </>
    </form>
  );
};

const DatasourceSubform = ({ sourceType, api }: { sourceType: DatasourceType; api: UseFormReturn<Datasource> }) => {
  switch (sourceType) {
    case DatasourceType.mqtt:
      return <MqttDatasourceForm {...(api as UseFormReturn<MqttDatasource>)} />;
    case DatasourceType.web:
      return <WebDatasourceForm {...(api as UseFormReturn<WebDatasource>)} />;
    case DatasourceType.ttnv3:
      return <Ttnv3DatasourceForm {...(api as UseFormReturn<Ttnv3Datasource>)} />;
  }
};

const defaultDatasource = (sourceType: DatasourceType): Datasource => {
  switch (sourceType) {
    case DatasourceType.mqtt:
      return defaultMqqt;

    case DatasourceType.web:
      return defaultWeb;

    case DatasourceType.ttnv3:
      return defaultTtnv3;
  }
};
