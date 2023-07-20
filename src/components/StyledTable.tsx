import React from 'react'

import {
  Table,
  flexRender,
} from '@tanstack/react-table'
import { useStyles2 } from '@grafana/ui'
import { getTableStyles } from 'components/table/styles'

export function StyledTable<T>({table}: {table: Table<T>}) {
  const tableStyles = useStyles2(getTableStyles);

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
