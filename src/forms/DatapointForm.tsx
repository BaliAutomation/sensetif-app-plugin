import React, { FC } from 'react';
import {
  DatapointSettings,
  DatasourceType,
  OriginDocumentFormat,
  PollInterval,
  ScalingFunction,
  TimeToLive,
  Ttnv3Datasource,
  WebDatasource,
} from '../types';
import {
  Button,
  Field,
  FieldSet,
  Form,
  FormAPI,
  HorizontalGroup,
  Input,
  InputControl,
  Label,
  RadioButtonGroup,
  Select,
} from '@grafana/ui';
import { css } from '@emotion/css';
import { PATTERN_NAME } from './common';
import { WebDatasourceForm } from './datapoint/WebDatasourceForm';
import { Ttnv3DatasourceForm } from './datapoint/Ttnv3DatasourceForm';

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
    datasourcetype: DatasourceType.web,
  };

  return (
    <Form<DatapointSettings> onSubmit={onSubmit} defaultValues={defaultValues}>
      {(formAPI: FormAPI<DatapointSettings>) => {
        const { register, errors, control, watch } = formAPI;
        const scaling = watch('proc.scaling');
        const sourceType = watch('datasourcetype');

        return (
          <>
            <FieldSet label="Datapoint">
              <Label>Project: {projectName}</Label>
              <Label>Subsystem: {subsystemName}</Label>
              <br />
              <Field label="Name" invalid={!!errors.name} error={errors.name && errors.name.message}>
                <Input
                  {...register('name', {
                    required: 'Datapoint name is required',
                    pattern: {
                      value: PATTERN_NAME,
                      message: 'Allowed letters, numbers and "_". Must start with a letter.',
                    },
                  })}
                  readOnly={!!datapoint}
                  placeholder="Datapoint name"
                  css=""
                />
              </Field>
              <HorizontalGroup>
                <Field
                  label="Poll interval"
                  invalid={!!errors.pollinterval}
                  error={errors.pollinterval && errors.pollinterval.message}
                >
                  <InputControl
                    render={({ field: { onChange, ref, ...field } }) => (
                      <Select
                        {...field}
                        onChange={(value) => onChange(value.value)}
                        options={[
                          { label: '5 minutes', value: PollInterval.five_minutes },
                          { label: '10 minutes', value: PollInterval.ten_minutes },
                          { label: '15 minutes', value: PollInterval.fifteen_minutes },
                          { label: '20 minutes', value: PollInterval.twenty_minutes },
                          { label: '30 minutes', value: PollInterval.thirty_minutes },
                          { label: '1 hour', value: PollInterval.one_hour },
                          { label: '2 hours', value: PollInterval.two_hours },
                          { label: '3 hours', value: PollInterval.three_hours },
                          { label: '6 hours', value: PollInterval.six_hours },
                          { label: '12 hours', value: PollInterval.twelve_hours },
                          { label: '24 hours', value: PollInterval.one_day },
                          { label: '1 week', value: PollInterval.weekly },
                          { label: '1 month', value: PollInterval.monthly },
                        ]}
                      />
                    )}
                    rules={{
                      required: 'Interval selection is required',
                    }}
                    name="pollinterval"
                    control={control}
                  />
                </Field>
                <Field
                  label="Storage Period"
                  invalid={!errors.proc || !!errors.proc.scaling}
                  error={errors.proc ? errors.proc.scaling && errors.proc.scaling.message : undefined}
                >
                  <InputControl
                    render={({ field: { onChange, ref, ...field } }) => (
                      <Select
                        {...field}
                        onChange={(value) => onChange(value.value)}
                        options={[
                          // { label: '1 week', value: TimeToLive.a },
                          { label: '1 month', value: TimeToLive.b },
                          { label: '3 months', value: TimeToLive.c },
                          { label: '6 months', value: TimeToLive.d },
                          { label: '1 year', value: TimeToLive.e },
                          // { label: '2 years', value: TimeToLive.f },
                          { label: '3 years', value: TimeToLive.g },
                          // { label: '4 years', value: TimeToLive.h },
                          // { label: '5 years', value: TimeToLive.i },
                          // { label: '10 years', value: TimeToLive.i },
                          // { label: 'forever', value: TimeToLive.k },
                        ]}
                      />
                    )}
                    rules={{
                      required: 'Storage Period selection is required',
                    }}
                    control={control}
                    defaultValue={TimeToLive.a}
                    name="timeToLive"
                  />
                </Field>
              </HorizontalGroup>

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
                  css=""
                />
              </Field>
              <HorizontalGroup>
                <Field
                  label="Scaling"
                  invalid={!errors.proc || !!errors.proc.scaling}
                  error={errors.proc ? errors.proc.scaling && errors.proc.scaling.message : undefined}
                >
                  <InputControl
                    render={({ field: { onChange, ref, ...field } }) => (
                      <Select
                        {...field}
                        onChange={(value) => onChange(value.value)}
                        options={[
                          { label: 'Linear', value: ScalingFunction.lin },
                          { label: 'Logarithmic', value: ScalingFunction.log },
                          { label: 'Exponential', value: ScalingFunction.exp },
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
                    defaultValue={OriginDocumentFormat.jsondoc}
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
                      css=""
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
                      css=""
                    />
                  </Field>
                )}
              </HorizontalGroup>
            </FieldSet>

            <FieldSet label="Datasource">
              <Field label="Type">
                <InputControl
                  render={({ field }) => (
                    <RadioButtonGroup
                      {...field}
                      options={[
                        { label: 'Http(s)', value: DatasourceType.web },
                        { label: 'Things Network', value: DatasourceType.ttnv3 },
                      ]}
                    />
                  )}
                  rules={{
                    required: 'Source type selection is required',
                  }}
                  control={control}
                  defaultValue={defaultValues.datasourcetype}
                  name="datasourcetype"
                />
              </Field>
              {sourceType === DatasourceType.ttnv3 && (
                <Ttnv3DatasourceForm {...formAPI} datasource={datapoint?.datasource as Ttnv3Datasource} />
              )}
              {sourceType === DatasourceType.web && (
                <WebDatasourceForm {...formAPI} datasource={datapoint?.datasource as WebDatasource} />
              )}
            </FieldSet>
            <HorizontalGroup>
              <Button type="button" variant={'secondary'} onClick={onCancel}>
                {'Cancel'}
              </Button>
              <Button type="submit">{!!datapoint ? 'Update' : 'Save'}</Button>
            </HorizontalGroup>
          </>
        );
      }}
    </Form>
  );
};
