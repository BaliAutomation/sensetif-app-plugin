import React from 'react';
import { AlertErrorPayload, AlertPayload, AppEvents, AppRootProps } from '@grafana/data';
import { CodeEditor, Button, Input, FieldArray, HorizontalGroup, InputControl, Field, RadioButtonGroup, IconButton, TextArea, CustomScrollbar } from '@grafana/ui';
import { getAppEvents } from '@grafana/runtime';
import AutoSizer from 'react-virtualized-auto-sizer';
import { updateScript } from 'utils/api';
import { Script, ScriptLanguage, ScriptScope } from 'types';
import { useForm } from 'react-hook-form';
import { goToScripts } from 'utils/navigation';

const languageOptions = [
  { label: 'Javascript', value: ScriptLanguage.javascript },
  { label: 'Python', value: ScriptLanguage.pytnon },
  { label: 'Ruby', value: ScriptLanguage.ruby },
]

const scopeOptions = [
  { label: 'Global', value: ScriptScope.global, icon: 'cloud' },
  { label: 'Organization', value: ScriptScope.organization },
  { label: 'Project', value: ScriptScope.project },
];

export const AddScript = ({ query }: AppRootProps) => {
  const appEvents = getAppEvents();

  const notifyError = (payload: AlertErrorPayload) =>
    appEvents.publish({ type: AppEvents.alertError.name, payload });

  const notifySuccess = (payload: AlertPayload) =>
    appEvents.publish({ type: AppEvents.alertSuccess.name, payload });

  const {
    formState: { errors },
    control,
    register,
    watch,
    handleSubmit,
  } = useForm<Script>({
    defaultValues: {
      params: undefined
    }, mode: 'onSubmit',
  });

  const onCancel = () => goToScripts()

  const onSave = async (script: Script) => {
    try {
      await save(script)

      notifySuccess(['Saved'])
      goToScripts()
    } catch (e: any) {
      console.log('Failed to save script:', e)
      notifyError(['Failed to save script', e])
    }
  }

  const onValid = (s: Script) => {
    console.log('valid script: ', s)
    onSave(s)
  }

  const onInvalid = (v: any) => {
    console.log('errors:', v)
    return
  }

  const language = watch('language');

  return (
    <>
      <div>
        <form onSubmit={handleSubmit(onValid, onInvalid)}>
          <div style={{ display: 'flex' }}>
            {/* left column */}
            <div style={{ overflow: 'auto', height: '100%', flex: 4, marginRight: '1rem' }}>
              <div>
                <Field label="Name" invalid={!!errors.name} error={errors.name && errors.name.message}>
                  <Input
                    {...register('name', { required: 'Script name is required', })}
                    placeholder="Script name"
                  />
                </Field>

                <Field
                  label="Scope"
                  invalid={!!errors.scope}
                  error={errors.scope && errors.scope.message}
                >
                  <InputControl
                    name="scope"
                    render={({ field: { onChange, ref, ...field } }) => (
                      <RadioButtonGroup
                        {...field}
                        onChange={(selectable) => onChange(selectable)}
                        options={scopeOptions}
                        fullWidth={true}
                      />
                    )}
                    control={control}
                    rules={{
                      required: 'Script scope is required',
                    }}
                  />
                </Field>

                <Field
                  label="Language"
                  invalid={!!errors.language}
                  error={errors.language && errors.language.message}
                >
                  <InputControl
                    render={({ field: { onChange, ref, ...field } }) => (
                      <RadioButtonGroup
                        {...field}
                        onChange={(selectable) => onChange(selectable)}
                        options={languageOptions}
                        fullWidth={true}
                      />
                    )}
                    control={control}
                    rules={{
                      required: 'Script language is required',
                    }}
                    name="language"
                  />
                </Field>

                <Field label="Description"
                  invalid={!!errors.description}
                  error={errors.description && errors.description.message}>
                  <TextArea
                    {...register('description')}
                    placeholder="Script description"
                  />
                </Field>

                {/* params */}
                <Field label="Params">
                  {/* @ts-ignore-check: react-hook-form made me do this */}
                  <FieldArray control={control} name="params">
                    {({ fields, append, remove }) => (
                      <>
                        <Button onClick={() => append({ key: '', value: '' })}>Add param</Button>
                        <CustomScrollbar autoHeightMax='250px'>
                          {fields.map((field, index) => (
                            <HorizontalGroup key={field.id} align='center'>
                              <Field
                                invalid={!!errors.params?.[index]?.key}
                                error={errors.params?.[index]?.key?.message}
                              >
                                <Input
                                  {...register(`params.${index}.key`, { required: 'Field is required', })}
                                  placeholder="key"
                                />
                              </Field>

                              <Field
                                invalid={!!errors.params?.[index]?.value}
                                error={errors.params?.[index]?.value?.message}
                              >
                                <Input
                                  {...register(`params.${index}.value`, { required: 'Field is required', })}
                                  placeholder="value"
                                />
                              </Field>
                              <IconButton
                                // tooltip={t('correlations.transform-row.remove-tooltip', 'Remove transformation')}
                                tooltip={'Remove param'}
                                name="trash-alt"
                                onClick={() => {
                                  remove(index);
                                }}
                              >
                                {/* <Trans i18nKey="correlations.transform-row.remove-button">Remove</Trans> */}
                              </IconButton>
                            </HorizontalGroup>
                          ))}
                        </CustomScrollbar>
                      </>
                    )}
                  </FieldArray>
                </Field>
              </div>
            </div>
            {/* right column (params) */}
            <div style={{ overflow: 'auto', height: '100%', flex: 7 }}>
              <div>
                <Field
                  label="Code"
                  invalid={!!errors.code}
                  error={errors.code && errors.code.message}
                >
                  <AutoSizer style={{ width: '100%', height: '400px' }}>
                    {({ height, width }: { height: number, width: number }) => (
                      <InputControl
                        render={({ field }) => (
                          <FormCodeEditor width={width} height={height}
                            code={field.value}
                            language={language}
                            onChange={field.onChange}
                          />
                        )}
                        control={control}
                        rules={{
                          required: 'Script code is required',
                        }}
                        name="code"
                      />
                    )}
                  </AutoSizer>
                </Field>
              </div>
            </div>
          </div>

          <HorizontalGroup>
            <Button type="button" variant={'secondary'} onClick={onCancel}>{'Cancel'}</Button>
            <Button type="submit">{'Save'}</Button>
          </HorizontalGroup>
        </form>
      </div>
    </>
  );
};

const save = async (script: Script) => {
  if (script.name === '') {
    throw new Error("name cannot be empty")
  }

  const resp = await updateScript(script)
  console.log('saved: ')
  console.log(resp)
}

interface FormCodeEditorProps {
  width: number;
  height: number;
  code: string;
  language: string;
  onChange: (value: string) => void;
}

const FormCodeEditor: React.FC<FormCodeEditorProps> = ({ code, onChange, height, width, language }) => {
  return (
    <CodeEditor
      language={language}
      value={code}
      height={`${height}px`}
      width={`${width}px`}
      showLineNumbers

      onBlur={onChange}
      onSave={onChange}
    />
  );
};

export default FormCodeEditor;
