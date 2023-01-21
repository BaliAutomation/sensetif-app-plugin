import React from 'react'

//
import './index.css'

//
import {
  Column,
  Table,
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  // getPaginationRowModel,
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

const EditableCell = (getValue: () => cellValue, table: Table<mydata>, rowIndex: number, colId: string) => {
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

  // const handleKeyDown = (key: string) => {
  //   console.log('clicked: ', key)
  //   if (key === 'Enter') {
  //     onBlur()
  //   }
  // };

  const tableStyles = useStyles2(getTableStyles);

  // const updateValue = (val: string) => {
  //   console.log(`updateValue: ${val}`)
  //   let newValue: any = val
  //   if (typeof initialValue === 'number') {
  //     newValue = Number(value)
  //   }

  //   // table.options.meta?.updateData(rowIndex, colId, value);
  //   setValue(newValue);
  //   // setEditMode(false);
  // }

  return (
    <div className={tableStyles.cellContainer}
      onClick={() => { if (!editMode) { setEditMode(true) } }}
    >
      {editMode && <Input autoFocus
        type='number'
        value={value as number}
        // onChange={e => updateValue(e.currentTarget.value)}
        onChange={e => setValue(e.currentTarget.value)}
        // onKeyDown={e => handleKeyDown(e.key)}
        onBlur={onBlur} />}
      {!editMode && <span>{value}</span>}
    </div>
  )
}

const editableColumn: Partial<ColumnDef<mydata, any>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {

    return EditableCell(getValue, table, index, id)
  }
}


// function useSkipper() {
//   const shouldSkipRef = React.useRef(true)
//   const shouldSkip = shouldSkipRef.current

//   // Wrap a function with this to skip a pagination reset temporarily
//   const skip = React.useCallback(() => {
//     shouldSkipRef.current = false
//   }, [])

//   React.useEffect(() => {
//     shouldSkipRef.current = true
//   })

//   return [shouldSkip, skip] as const
// }

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
    if (a.time < b.time) { return -1 };
    if (a.time === b.time) { return 0 };
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
  const md = dataFramesToMydata(frames)

  const valueColumns = React.useMemo<Array<ColumnDef<mydata, cellValue>>>(
    () => {
      if (!md || !md[0]) {
        return [];
      }

      return Object.keys(md[0].values).map(key => ({
        header: key,
        accessorFn: (val: mydata) => val.values[key],
        cell: editableColumn.cell,
        enableColumnFilter: true,
      }));
    }, [md]
  )

  const columns = React.useMemo<Array<ColumnDef<mydata, cellValue>>>(
    () => ([
      {
        header: 'Time',
        accessorFn: (row: mydata) => { return dateTimeFormat(row.time) },
        cell: (props) => (<span>{props.getValue()}</span>)
        // cell: (props) => {return ''}
      },
      ...valueColumns,
    ]), [valueColumns]
  )


  const [data, setData] = React.useState(() => md)
  // const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  const table = useReactTable<mydata>({
    data,
    columns,
    // defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    // autoResetPageIndex,
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        // console.log(`updated data: rowIdx: ${rowIndex}; colId: ${columnId}`)
        if (typeof value !== 'number') {
          // console.log(`skipping update of value of type: "${typeof value} "`)
          return
        }
        // console.log(`update with value: ${value}`)

        if (isNaN(value)) {
          return
        }

        // Skip age index reset until after next rerender
        // skipAutoResetPageIndex()
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
    <div className="tableContainer">
      <table style={{ width: '100%' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanFilter() ? (
                          <div>
                            <Filter column={header.column as Column<mydata, any>} table={table} />
                          </div>
                        ) : null}
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
              <tr key={row.id}>
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

      <div className="flex items-center gap-2">
      </div>
      <div>{table.getRowModel().rows.length} Rows</div>
    </div>
  )
}
function Filter({
  column,
  table,
}: {
  column: Column<mydata, cellValue>
  table: Table<mydata>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]
    ?.getValue<cellValue>(column.id)

  const columnFilterValue = column.getFilterValue()

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2">
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={e =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={e =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <input
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Search...`}
      className="w-36 border shadow rounded"
    />
  )
}
