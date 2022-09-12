import { Field, HorizontalGroup, Input, InputControl, Select } from '@grafana/ui';
import { OriginDocumentFormat, TimestampSelection, TimestampType } from '../types';
import React, { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface Props extends UseFormReturn<TimestampSelection> {
  format: OriginDocumentFormat;
}

export const TimestampSelector: FC<Props> = ({ format, control, watch, register, formState: { errors } }) => {
  const timestampType = watch('timestampType');

  return (
    <>
      <HorizontalGroup>
        <Field
          label="Type of Timestamp"
          invalid={!!errors?.timestampType}
          error={errors?.timestampType && errors?.timestampType.message}
        >
          <InputControl
            render={({ field: { onChange, ref, ...field } }) => (
              <Select
                {...field}
                onChange={(selectable) => onChange(selectable.value)}
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
            defaultValue={TimestampType.polltime}
            name="timestampType"
          />
        </Field>
        {timestampType && timestampType !== TimestampType.polltime && (
          <Field
            label={
              format === OriginDocumentFormat.xmldoc
                ? 'XPath Expression for Timestamp'
                : 'JSON Path Expression for Timestamp'
            }
            invalid={!!errors?.timestampExpression}
            error={errors?.timestampExpression && errors?.timestampExpression.message}
          >
            <Input
              {...register('timestampExpression', {})}
              placeholder={format === OriginDocumentFormat.jsondoc ? 'JSON Path' : 'XPath'}
            />
          </Field>
        )}
      </HorizontalGroup>
    </>
  );
};
