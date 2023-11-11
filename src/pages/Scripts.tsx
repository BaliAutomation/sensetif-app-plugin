import React, { useState } from 'react';
import { AlertErrorPayload, AppEvents, AppRootProps } from '@grafana/data';
import { CodeEditor, Button, Select, Input } from '@grafana/ui';
import { getAppEvents } from '@grafana/runtime';
import { updateScript } from 'utils/api';
import { Script } from 'types';

const supportedLanguages = ['javascript', 'python', 'ruby']

export const Scripts = ({ query }: AppRootProps) => {
  const [language, setLanguage] = useState(supportedLanguages[0])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')


  const appEvents = getAppEvents();

  const notifyError = (payload: AlertErrorPayload) => appEvents.publish({ type: AppEvents.alertError.name, payload });

  const onSave = async () => {
    try {
      await save({
        code: code,
        language: language,
        name: name
      })
    } catch (e: any) {
      console.log('Failed to save script:', e)
      notifyError(['Failed to save script', e])
    }
  }

  return (
    <>
      {/* TODO: Rework to sit's a Form with validation */}
      <h1>Add Script</h1>

      <Input name='name' value={name} onChange={e => setName(e.currentTarget.value)} />

      <Select<string>
        value={language}
        onChange={v => setLanguage(v.value!)}
        options={supportedLanguages.map(sl => ({ label: sl, value: sl }))} />

      <CodeEditor
        language={language}
        value={code}
        height={'350px'}
        showLineNumbers

        onBlur={setCode}
        onSave={setCode}
      />
      <Button onClick={onSave}>Save</Button>
    </>
  );
};

const save = async (script: Script) => {
  if (script.name === '') {
    throw new Error("name cannot be empty")
  }
  
  updateScript(script).then(r => { console.log('respose:'); console.log(r) })
}
