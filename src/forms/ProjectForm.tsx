import React, { FC } from 'react';
import { ProjectSettings } from '../types';
import {
  TimeZonePicker,
  Button,
  Field,
  FieldSet,
  Form,
  Input,
  InputControl,
  Select,
  HorizontalGroup,
} from '@grafana/ui';
import { getNames as getCountryNames } from 'country-list';
import { SelectableValue } from '@grafana/data';
import { PROJECT_PATTERN_NAME } from './common';

interface Props {
  project?: ProjectSettings;
  onSubmit: (data: ProjectSettings, event?: React.BaseSyntheticEvent) => void | Promise<void>;
  onCancel: () => void;
}

export const ProjectForm: FC<Props> = ({ project, onSubmit, onCancel }) => {
  return (
    <Form<ProjectSettings>
      onSubmit={onSubmit}
      defaultValues={{
        ...project,
      }}
    >
      {({ register, errors, control }) => {
        return (
          <>
            <FieldSet label="Project details">
              <Field label="Name" invalid={!!errors.name} error={errors.name && errors.name.message}>
                <Input
                  {...register('name', {
                    required: 'Project name is required',
                    pattern: {
                      value: PROJECT_PATTERN_NAME,
                      message: 'Allowed letters, numbers and ".-_". Must start with a letter.',
                    },
                  })}
                  readOnly={!!project}
                  placeholder="Project name"
                />
              </Field>

              <Field label="Title" invalid={!!errors.title} error={errors.title && errors.title.message}>
                <Input
                  {...register('title', {
                    required: 'Project title is required',
                  })}
                  placeholder="Project title"
                />
              </Field>

              <Field label="Country" invalid={!!errors.country} error={errors.country && errors.country.message}>
                <InputControl
                  render={({ field: { onChange, ref, ...field } }) => (
                    <Select
                      {...field}
                      onChange={(value) => onChange(value.value)}
                      options={getCountryNames().map((c) => ({ label: c, value: c } as SelectableValue))}
                    />
                  )}
                  rules={{
                    required: 'Country selection is required',
                  }}
                  control={control}
                  name="country"
                />
              </Field>

              <Field label="City" invalid={!!errors.city} error={errors.city && errors.city.message}>
                <Input
                  {...register('city', {
                    required: 'City is required',
                  })}
                  placeholder="City"
                />
              </Field>

              <Field label="Time zone" invalid={!!errors.timezone} error={errors.timezone && errors.timezone.message}>
                <InputControl
                  {...register('timezone', {
                    required: 'Timezone selection is required',
                  })}
                  render={({ field }) => <TimeZonePicker {...field} />}
                  name="timezone"
                  control={control}
                />
              </Field>

              <Field
                label="Geolocation"
                invalid={!!errors.geolocation}
                error={errors.geolocation && errors.geolocation.message}
              >
                <Input
                  {...register('geolocation', {
                    required: 'Geolocation is required',
                  })}
                  placeholder="latitude,longitude"
                />
              </Field>
              <HorizontalGroup>
                <Button type="button" variant={'secondary'} onClick={onCancel}>
                  {'Cancel'}
                </Button>
                <Button type="submit">{!!project ? 'Update' : 'Save'}</Button>
              </HorizontalGroup>
            </FieldSet>
          </>
        );
      }}
    </Form>
  );
};
