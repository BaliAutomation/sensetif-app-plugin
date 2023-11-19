import React, { useState, useEffect } from 'react';
import { AlertErrorPayload, AlertPayload, AppEvents, AppRootProps } from '@grafana/data';
import { CodeEditor, Button, Select, Input } from '@grafana/ui';
import { getAppEvents } from '@grafana/runtime';
import { updateScript, listScripts } from 'utils/api';
import { Script } from 'types';

const supportedLanguages = ['javascript', 'python', 'ruby']

export const Scripts = ({ query }: AppRootProps) => {
  const [language, setLanguage] = useState(supportedLanguages[0])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')

  const [scripts, setScripts] = useState()

  useEffect(() => {
    loadScripts()
  }, []);

  const appEvents = getAppEvents();

  const notifyError = (payload: AlertErrorPayload) =>
    appEvents.publish({ type: AppEvents.alertError.name, payload });

  const notifySuccess = (payload: AlertPayload) =>
    appEvents.publish({ type: AppEvents.alertSuccess.name, payload });

  const onSave = async () => {
    try {
      await save({
        code: code,
        language: language,
        name: name
      })

      notifySuccess(['Saved'])
      loadScripts()
    } catch (e: any) {
      console.log('Failed to save script:', e)
      notifyError(['Failed to save script', e])
    }
  }

  const loadScripts = async () => {
    const scripts = await listScripts()
    setScripts(scripts)
  }

  return (
    <>
      <div>
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
          height={'250px'}
          showLineNumbers

          onBlur={setCode}
          onSave={setCode}
        />
        <Button onClick={onSave}>Save</Button>
      </div>
      <div>
        <h1>Organization Scripts:</h1>
        <pre>
          {JSON.stringify(scripts, null, '  ')}
        </pre>
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
