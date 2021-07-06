import React, { FC } from 'react';
import {
  AuthenticationType,
  DatapointSettings,
  OriginDocumentFormat,
  PollInterval,
  ScalingFunction,
  TimestampType,
  TimeToLive,
} from '../types';
import {
  Button,
  Field,
  FieldSet,
  Form,
  HorizontalGroup,
  Input,
  InputControl,
  RadioButtonGroup,
  Select,
} from '@grafana/ui';
import { css } from '@emotion/css';
import { PATTERN_NAME } from './common';

interface Props {
  datapoint?: DatapointSettings;
  onSubmit: (data: DatapointSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
}

export const DatapointForm: FC<Props> = ({ datapoint, onSubmit }) => {
  const defaultAuthenticationType = AuthenticationType.none;
  const defaultFormat = OriginDocumentFormat.json;
  const defaultScaling = ScalingFunction.lin;
  const defaultTimestampType: TimestampType = TimestampType.polltime;

  const numericInputStyle = css`
    /* hides spin buttons */
    input[type='number']::-webkit-inner-spin-button {
      display: none;
      -webkit-appearance: none;
    }
  `;

  return (
    <Form<DatapointSettings>
      onSubmit={onSubmit}
      defaultValues={{
        ...datapoint,
      }}
    >
      {({ register, errors, control, watch }) => {
        const authType = watch('authenticationType', defaultAuthenticationType);
        const format = watch('format', defaultFormat);
        const scaling = watch('scaling', defaultScaling);
        const timestampType = watch('timestampType', defaultTimestampType);

        return (
          <>
            <FieldSet label="Datapoint details">
              <Field
                label="Name"
                invalid={!!errors.name}
                error={errors.name && errors.name.message}
                disabled={!!datapoint}
              >
                <Input
                  {...register('name', {
                    required: 'Datapoint name is required',
                    pattern: {
                      value: PATTERN_NAME,
                      message: 'Allowed letters, numbers and "_". Must start with a letter.',
                    },
                  })}
                  placeholder="Datapoint name"
                  css=""
                />
              </Field>

              <Field
                label="Poll interval"
                invalid={!!errors.interval}
                error={errors.interval && errors.interval.message}
              >
                <InputControl
                  render={({ field: { onChange, ref, ...field } }) => (
                    <Select
                      {...field}
                      onChange={(value) => onChange(value.value)}
                      options={[
                        { label: '5 minutes', value: PollInterval.b },
                        { label: '10 minutes', value: PollInterval.c },
                        { label: '15 minutes', value: PollInterval.d },
                        { label: '30 minutes', value: PollInterval.e },
                        { label: '1 hour', value: PollInterval.f },
                        { label: '3 hours', value: PollInterval.g },
                        { label: '6 hours', value: PollInterval.h },
                        { label: '12 hours', value: PollInterval.i },
                        { label: '24 hours', value: PollInterval.j },
                      ]}
                    />
                  )}
                  rules={{
                    required: 'Interval selection is required',
                  }}
                  name="interval"
                  control={control}
                />
              </Field>

              <Field label="URL" invalid={!!errors.url} error={errors.url && errors.url.message}>
                <Input
                  {...register('url', {
                    required: 'URL is required',
                  })}
                  type="url"
                  placeholder="Datapoint URL"
                  css=""
                />
              </Field>
            </FieldSet>

            {/* auth */}
            <FieldSet label="Authorization">
              <Field
                label="Authentication type"
                invalid={!!errors.authenticationType}
                error={errors.authenticationType && errors.authenticationType.message}
              >
                <InputControl
                  render={({ field }) => (
                    <RadioButtonGroup
                      {...field}
                      options={[
                        { label: 'None', value: AuthenticationType.none },
                        { label: 'User & Password', value: AuthenticationType.basic },
                        { label: 'Authorization key', value: AuthenticationType.authorizationKey },
                      ]}
                    />
                  )}
                  rules={{
                    required: 'Auth selection is required',
                  }}
                  control={control}
                  defaultValue={defaultAuthenticationType}
                  name="authenticationType"
                />
              </Field>

              {authType === AuthenticationType.basic && (
                <>
                  <Field label="Username" invalid={!!errors.auth?.u} error={errors.auth?.u && errors.auth.u.message}>
                    <Input
                      css=""
                      {...register('auth.u', {
                        required: 'Username is required',
                      })}
                      placeholder="Username"
                    />
                  </Field>
                  <Field label="Password" invalid={!!errors.auth?.p} error={errors.auth?.p && errors.auth.p.message}>
                    <Input
                      css=""
                      {...register('auth.p', {
                        required: 'Password is required',
                      })}
                      type="password"
                      placeholder="Password"
                    />
                  </Field>
                </>
              )}
              {/* {authType === AuthenticationType.authorizationKey && (
                <Field
                  label="Authorization key"
                  invalid={!!errors.authKey}
                  error={errors.authKey && errors.authKey.message}
                >
                  <Input
                    css=""
                    {...register('authKey', {
                      required: 'Authorization Key is required',
                    })}
                    placeholder="Key"
                  />
                </Field>
              )} */}
            </FieldSet>

            <FieldSet label="Document Format">
              <Field label="Format" invalid={!!errors.format} error={errors.format && errors.format.message}>
                <InputControl
                  render={({ field }) => (
                    <RadioButtonGroup
                      {...field}
                      options={[
                        { label: 'json', value: OriginDocumentFormat.json },
                        { label: 'xml', value: OriginDocumentFormat.xml },
                      ]}
                    />
                  )}
                  rules={{
                    required: 'Format selection is required',
                  }}
                  control={control}
                  defaultValue={defaultFormat}
                  name="format"
                />
              </Field>
              <Field
                label={format === OriginDocumentFormat.json ? 'JSON Path' : 'XPath'}
                invalid={!!errors.valueExpression}
                error={errors.valueExpression && errors.valueExpression.message}
              >
                <Input
                  {...register('valueExpression', {
                    required: 'expression is required',
                  })}
                  css={''}
                  placeholder={format === OriginDocumentFormat.json ? 'JSON Path' : 'XPath'}
                />
              </Field>

              <Field label="Unit" invalid={!!errors.unit} error={errors.unit && errors.unit.message}>
                <Input
                  {...register('unit', {
                    required: 'Unit is required',
                  })}
                  placeholder="unit"
                  css=""
                />
              </Field>
            </FieldSet>
            <FieldSet label="Scaling">
              <HorizontalGroup>
                <Field label="Function" invalid={!!errors.scaling} error={errors.scaling && errors.scaling.message}>
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
                          { label: 'Kelvin->Fahrenheit', value: ScalingFunction.kTof },
                          { label: 'Fahrenheit->Kelvin', value: ScalingFunction.fToK },
                        ]}
                      />
                    )}
                    rules={{
                      required: 'Function selection is required',
                    }}
                    control={control}
                    defaultValue={OriginDocumentFormat.json}
                    name="scaling"
                  />
                </Field>
                {(scaling === ScalingFunction.lin ||
                  scaling === ScalingFunction.log ||
                  scaling === ScalingFunction.exp) && (
                  <Field label="k">
                    <Input
                      {...register('k', {
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
                      {...register('m', {
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

            <FieldSet label="Timestamp">
              <Field
                label="Type"
                invalid={!!errors.timestampType}
                error={errors.timestampType && errors.timestampType.message}
              >
                <InputControl
                  render={({ field: { onChange, ref, ...field } }) => (
                    <Select
                      {...field}
                      onChange={(value) => onChange(value.value)}
                      options={[
                        { label: 'Poll Time', value: TimestampType.polltime },
                        { label: 'Milliseconds', value: TimestampType.epochMillis },
                        { label: 'Seconds', value: TimestampType.epochSeconds },
                        { label: 'ISO8601 with Timezone', value: TimestampType.iso8601_zoned },
                        { label: 'ISO8601 with Offset', value: TimestampType.iso8601_offset },
                      ]}
                    />
                  )}
                  rules={{
                    required: 'Timestamp Type selection is required',
                  }}
                  control={control}
                  defaultValue={TimestampType.epochMillis}
                  name="timestampType"
                />
              </Field>
              {timestampType !== TimestampType.polltime && (
                <Field
                  label={format === OriginDocumentFormat.json ? 'JSON Path Expression' : 'XPath Expression'}
                  invalid={!!errors.timestampExpression}
                  error={errors.timestampExpression && errors.timestampExpression.message}
                >
                  <Input
                    {...register('timestampExpression', {})}
                    placeholder={format === OriginDocumentFormat.json ? 'JSON Path' : 'XPath'}
                    css=""
                  />
                </Field>
              )}
              <Field label="Storage Period" invalid={!!errors.scaling} error={errors.scaling && errors.scaling.message}>
                <InputControl
                  render={({ field: { onChange, ref, ...field } }) => (
                    <Select
                      {...field}
                      onChange={(value) => onChange(value.value)}
                      options={[
                        { label: '3 months', value: TimeToLive.a },
                        { label: '6 months', value: TimeToLive.b },
                        { label: '1 year', value: TimeToLive.c },
                        { label: '2 years', value: TimeToLive.d },
                        { label: '3 years', value: TimeToLive.e },
                        { label: '4 years', value: TimeToLive.f },
                        { label: '5 years', value: TimeToLive.g },
                        { label: 'forever', value: TimeToLive.h },
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
            </FieldSet>

            <Button type="submit">{datapoint ? 'Update' : 'Save'}</Button>
          </>
        );
      }}
    </Form>
  );
};
