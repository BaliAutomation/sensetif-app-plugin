import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { PollInterval, Processing, ScalingFunction, TimeToLive } from '../../types';
import { Field, HorizontalGroup, Select, InputControl, Input, VerticalGroup } from '@grafana/ui';
import { AvailablePollIntervals, AvailableTimeToLivePeriods } from 'utils/consts';

export type datapointFormValues = {
  pollInterval: PollInterval;
  timeToLive: TimeToLive;
  processing: Processing;
};

type otherFields = {
  pollinterval: PollInterval;
  timeToLive: TimeToLive;
};

type formInnerProps = {
  externalRef: React.LegacyRef<HTMLFormElement>;
  onSubmit: (formValues: datapointFormValues) => void;
};

const DatapointFormInner = ({ externalRef, onSubmit }: formInnerProps) => {
  const form = useForm<datapointFormValues>({
    mode: 'onSubmit',
  });

  return <DatapointSubFormInner {...form} onSubmit={onSubmit} externalRef={externalRef} />;
};

interface DatapointFormInnerProps extends UseFormReturn<datapointFormValues> {
  externalRef: React.LegacyRef<HTMLFormElement>;
  onSubmit: (formValues: datapointFormValues) => void;
}
const DatapointSubFormInner = ({ onSubmit, handleSubmit, externalRef }: DatapointFormInnerProps) => {
  const datapointForm = useForm<otherFields>({
    mode: 'onSubmit',
    shouldUnregister: true,
  });
  const processingForm = useForm<Processing>({
    mode: 'onSubmit',
    shouldUnregister: true,
  });

  const onSubmitValid = async () => {
    let out: Partial<datapointFormValues> = {};

    await datapointForm.handleSubmit(
      (v) => {
        out.pollInterval = v.pollinterval;
        out.timeToLive = v.timeToLive;
      },
      (e) => {
        console.warn('invalid datapointForm', e);
      }
    )();

    await processingForm.handleSubmit(
      (v) => {
        out.processing = v;
      },
      (e) => {
        console.warn('invalid processingForm', e);
      }
    )();

    onSubmit({
      pollInterval: out.pollInterval!,
      timeToLive: out.timeToLive!,
      processing: out.processing!,
    });
  };

  const onSubmitError = (e: any) => {
    console.warn('[DatapointForm] onSubmit handling errors...', e);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitValid, onSubmitError)} ref={externalRef}>
      <>
        <OtherFieldsForm {...datapointForm} />
        <ProcessingSubForm {...processingForm} />
      </>
    </form>
  );
};

interface OtherFieldsProps extends UseFormReturn<otherFields> {}

const OtherFieldsForm = ({ control, formState: { errors } }: OtherFieldsProps) => {
  return (
    <>
      <HorizontalGroup>
        <Field
          label="Storage Period"
          invalid={!!errors.timeToLive}
          error={errors.timeToLive && errors.timeToLive.message}
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
            defaultValue={AvailableTimeToLivePeriods[0].value}
            name="timeToLive"
          />
        </Field>

        <Field
          label="Poll interval"
          invalid={!!errors.pollinterval}
          error={errors.pollinterval && errors.pollinterval.message}
        >
          <InputControl
            render={({ field: { onChange, ref, ...field } }) => (
              <Select
                {...field}
                onChange={(selectable) => onChange(selectable.value)}
                options={AvailablePollIntervals}
              />
            )}
            rules={{
              required: 'Interval selection is required',
            }}
            name="pollinterval"
            control={control}
            defaultValue={AvailablePollIntervals[5].value}
          />
        </Field>
      </HorizontalGroup>
    </>
  );
};

interface ProcessingProps extends UseFormReturn<Processing> {}

const ProcessingSubForm = ({ control, watch, formState: { errors } }: ProcessingProps) => {
  const scaling = watch('scaling');

  return (
    <>
      <VerticalGroup>
        <Field label="Unit" invalid={!!errors?.unit} error={errors?.unit && errors?.unit?.message}>
          <InputControl
            render={({ field: { ref, ...field } }) => <Input {...field} placeholder="Unit" />}
            control={control}
            name="unit"
            defaultValue={''}
          />
        </Field>
        <HorizontalGroup>
          <Field label="Scaling" invalid={!!errors.scaling} error={errors.scaling && errors.scaling.message}>
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
              name="scaling"
            />
          </Field>

          {(scaling === ScalingFunction.lin || scaling === ScalingFunction.log || scaling === ScalingFunction.exp) && (
            <Field label="k" invalid={!!errors?.k} error={errors?.k && errors?.k?.message}>
              <InputControl
                render={({ field: { ref, ...field } }) => <Input {...field} placeholder="k" />}
                control={control}
                name="k"
                defaultValue={''}
              />
            </Field>
          )}
          {(scaling === ScalingFunction.lin || scaling === ScalingFunction.log || scaling === ScalingFunction.exp) && (
            <Field label="m" invalid={!!errors?.m} error={errors?.m && errors?.m?.message}>
              <InputControl
                render={({ field: { ref, ...field } }) => <Input {...field} placeholder="m" />}
                control={control}
                name="m"
                defaultValue={''}
              />
            </Field>
          )}
        </HorizontalGroup>

        <HorizontalGroup>
          <Field label="Minimum Value" invalid={!!errors.min} error={errors.min && errors.min.message}>
            <InputControl
              render={({ field: { ref, ...field } }) => <Input {...field} placeholder="Leave blank for no limit" />}
              control={control}
              name="min"
              defaultValue={''}
            />
          </Field>
          <Field label="Maximum Value" invalid={!!errors.max} error={errors.max && errors.max.message}>
            <InputControl
              render={({ field: { ref, ...field } }) => <Input {...field} placeholder="Leave blank for no limit" />}
              control={control}
              name="max"
              defaultValue={''}
            />
          </Field>
        </HorizontalGroup>
      </VerticalGroup>
    </>
  );
};

export const DatapointForm = React.forwardRef<HTMLFormElement, formInnerProps>(DatapointFormInner);
