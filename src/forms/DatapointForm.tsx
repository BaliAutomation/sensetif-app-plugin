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

interface Props {
  editable?: boolean;
  datapoint?: DatapointSettings;
  onSubmit: (data: DatapointSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
}

export const DatapointForm: FC<Props> = ({ editable, datapoint, onSubmit }) => {
  const defaultAuthenticationType = AuthenticationType.userpass;
  const defaultFormat = OriginDocumentFormat.json;

  return (
    <Form<DatapointSettings>
      onSubmit={onSubmit}
      defaultValues={{
        name: datapoint?.name,
        format: datapoint?.format,
        url: datapoint?.url,
        unit: datapoint?.unit,
        valueExpression: datapoint?.valueExpression,
      }}
    >
      {({ register, errors, control, watch }) => {
        const authType = watch('authenticationType', defaultAuthenticationType);
        const format = watch('format', defaultFormat);

        return (
          <>
            <FieldSet label="Datapoint details">
              <Field label="Name" invalid={!!errors.name} error={errors.name && errors.name.message}>
                <Input
                  {...register('name', {
                    required: 'Project name is required',
                    pattern: { value: /[a-z][A-Za-z0-9_]*/, message: 'Allowed letters, numbers and characters: _, * ' },
                  })}
                  disabled={!editable}
                  placeholder="Project name"
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
                        { label: '5 minutes', value: PollInterval.a },
                        { label: '10 minutes', value: PollInterval.b },
                        { label: '15 minutes', value: PollInterval.c },
                        { label: '30 minutes', value: PollInterval.d },
                        { label: '1 hour', value: PollInterval.e },
                        { label: '3 hours', value: PollInterval.f },
                        { label: '6 hours', value: PollInterval.g },
                        { label: '12 hours', value: PollInterval.h },
                        { label: '24 hours', value: PollInterval.i },
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
                  disabled={!editable}
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
                        { label: 'User & Password', value: AuthenticationType.userpass },
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

              {authType === AuthenticationType.userpass && (
                <>
                  <Field
                    label="Username"
                    invalid={!!errors.username}
                    error={errors.username && errors.username.message}
                  >
                    <Input
                      css=""
                      {...register('username', {
                        required: 'Username is required',
                      })}
                      disabled={!editable}
                      placeholder="Username"
                    />
                  </Field>
                  <Field
                    label="Password"
                    invalid={!!errors.password}
                    error={errors.password && errors.password.message}
                  >
                    <Input
                      css=""
                      {...register('password', {
                        required: 'Password is required',
                      })}
                      type="password"
                      placeholder="Password"
                      disabled={!editable}
                    />
                  </Field>
                </>
              )}
              {authType === AuthenticationType.authorizationKey && (
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
                    disabled={!editable}
                    placeholder="Key"
                  />
                </Field>
              )}
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
                  disabled={!editable}
                  placeholder={format === OriginDocumentFormat.json ? 'JSON Path' : 'XPath'}
                />
              </Field>

              <Field label="Unit" invalid={!!errors.unit} error={errors.unit && errors.unit.message}>
                <Input
                  {...register('unit', {
                    required: 'Unit is required',
                  })}
                  disabled={!editable}
                  placeholder="unit"
                  css=""
                />
              </Field>
            </FieldSet>

            <FieldSet label="Scalling">
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
                <Field label="k">
                  <Input
                    {...register('k', {
                      required: 'This field is required',
                      valueAsNumber: true,
                    })}
                    disabled={!editable}
                    type="number"
                    css=""
                  />
                </Field>
                <Field label="m">
                  <Input
                    {...register('m', {
                      required: 'This field is required',
                      valueAsNumber: true,
                    })}
                    disabled={!editable}
                    type="number"
                    css=""
                  />
                </Field>
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
              <Field
                label={format === OriginDocumentFormat.json ? 'JSON Path Expression' : 'XPath Expression'}
                invalid={!!errors.timestampExpression}
                error={errors.timestampExpression && errors.timestampExpression.message}
              >
                <Input
                  {...register('timestampExpression', {
                    required: 'Timestamp Expression is required',
                  })}
                  disabled={!editable}
                  placeholder={format === OriginDocumentFormat.json ? 'JSON Path' : 'XPath'}
                  css=""
                />
              </Field>
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

            <Button type="submit">{editable ? 'Update' : 'Save'}</Button>
          </>
        );
      }}
    </Form>
  );
};
