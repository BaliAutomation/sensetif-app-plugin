import React from 'react'

import {
  Table,
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  RowData,
} from '@tanstack/react-table'
import { Input, useStyles2 } from '@grafana/ui'
import { DataFrame, dateTimeFormat } from '@grafana/data'
import { getTableStyles } from 'components/table/styles'


export type UpdateValue = {
  time: Date;
  refId: string;
  value: number;
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: cellValue) => void
  }
}

const EditableCell = (getValue: () => cellValue, table: Table<mydata>, rowIndex: number, colId: string, tableStyles: any) => {
  const initialValue = getValue()
  const [value, setValue] = React.useState(initialValue)
  const [editMode, setEditMode] = React.useState<boolean>(false)


  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    table.options.meta?.updateData(rowIndex, colId, Number(value));
    setEditMode(false);
  }

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <div onClick={() => { if (!editMode) { setEditMode(true) } }} className={tableStyles.cellContainer}>
      {editMode && <Input autoFocus
        type='number'
        value={value as number}
        onChange={e => setValue(e.currentTarget.value)}
        onBlur={onBlur} />}

      {!editMode && <div className={tableStyles.cellText}><span style={{ display: 'inline-table' }}>{value}</span></div>}
    </div>
  )
}

const SimpleColumn = (getValue: () => cellValue, tableStyles: any) => (
  <div className={tableStyles.cellContainer}>
          <div className={tableStyles.cellText}>
            <span>{getValue()}</span>
          </div>
        </div>
)

const editableColumnStyled = (tableStyles: any): Partial<ColumnDef<mydata, any>> => ({
  cell: ({ getValue, row: { index }, column: { id }, table }) => (
    EditableCell(getValue, table, index, id, tableStyles)
  )
})

const simpleColumnStyled = (tableStyles: any): Partial<ColumnDef<mydata, any>> => ({
  cell: ({ getValue }) => (
    SimpleColumn(getValue, tableStyles)
  )
})

type cellValue = number | string

type mydata = {
  time: Date,
  values: {
    [name: string]: cellValue
  }
}

function dataFramesToMydata(frames: DataFrame[]): mydata[] {
  type byTime = {
    [timestamp: string]: {
      [refId: string]: any
    }
  }

  let byTimeValues: byTime = {}
  frames.forEach(f => {
    let timeField = f.fields[0]
    let valueField = f.fields[1]

    for (let i = 0; i < f.length; i++) {
      let time = timeField.values.get(i)
      let value = valueField.values.get(i)
      if (!byTimeValues[time]) { byTimeValues[time] = {} }
      if (!byTimeValues[time][f.refId!]) { byTimeValues[time][f.refId!] = {} }

      byTimeValues[time][f.refId!] = value
    }
  })

  // flatten
  const out: mydata[] = []
  Object.entries(byTimeValues).forEach(([timestamp, results]) => {
    let o: mydata = { time: new Date(Number(timestamp)), values: {} }

    Object.entries(results).forEach(([refId, value]) => {
      o.values[refId] = Number(value)
    })

    out.push(o)
  })

  out.sort((a, b: mydata): number => {
    if (a.time < b.time) { return -1 }
    if (a.time === b.time) { return 0 }
    return 1;
  })

  return out
}

export function InteractiveTable({
  frames,
  onUpdate
}: {
  frames: DataFrame[],
  onUpdate: (value: UpdateValue) => void
}) {
  const tableStyles = useStyles2(getTableStyles);

  const md = dataFramesToMydata(frames)

  const valueColumns = React.useMemo<Array<ColumnDef<mydata, cellValue>>>(
    () => {
      if (!md || !md[0]) {
        return [];
      }

      return Object.keys(md[0].values).map(key => ({
        header: key,
        accessorFn: (val: mydata) => val.values[key],
        cell: editableColumnStyled(tableStyles).cell,
        enableColumnFilter: true,
      }));
    }, [md, tableStyles]
  )

  const columns = React.useMemo<Array<ColumnDef<mydata, cellValue>>>(
    () => ([
      {
        header: 'Time',
        accessorFn: (row: mydata) => { return dateTimeFormat(row.time) },
        cell: simpleColumnStyled(tableStyles).cell
      },
      ...valueColumns,
    ]), [valueColumns, tableStyles]
  )


  const [data, setData] = React.useState(() => md)

  const table = useReactTable<mydata>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        if (typeof value !== 'number') {
          return
        }

        if (isNaN(value)) {
          return
        }

        setData(old => {
          let fresh = old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                values: {
                  ...old[rowIndex].values,
                  [columnId]: value
                }
              }
            }
            return row
          })

          return fresh
        })

        const updatedValue = {
          time: table.getRow(String(rowIndex)).original.time,
          refId: columnId,
          value: value,
        }

        onUpdate(updatedValue)
      },
    },
    debugTable: true,
  })

  return (
    <div className={tableStyles.table}>
      <table style={{ width: '100%' }}>
        <thead className={tableStyles.thead}>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className={tableStyles.headerRow}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div className={tableStyles.headerCell}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => {
            return (
              <tr key={row.id} className={tableStyles.row}>
                {row.getVisibleCells().map(cell => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

