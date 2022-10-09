import React from 'react';

export enum status {
  unknown = 'unknown',
  running ='running',
  done = 'done',
  error = 'error',

}
export type task = {
  id: string
  status: status;
  error?: Error

  subtasks: task[],
}
export const TasksProgress = ({
  tasks
}: {
  tasks: task[]
}) => {
  return (
   <>
   {tasks.map(t => <div><TaskProgress task={t} subtaskLevel={0}/></div>)}
   </>
  )
};


const TaskProgress = ({
  task,
  subtaskLevel
}:{
  task: task
  subtaskLevel: number,
}) => {
  return <>
  {'- - '.repeat(subtaskLevel)}
  {task.id} - {task.status} - {task.error}
  {
    task.subtasks && <>
      {task.subtasks.map(st => <div><TaskProgress task={st} subtaskLevel={subtaskLevel+1}/></div>)}
    </>
  }
   </>
}