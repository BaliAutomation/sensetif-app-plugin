import { useStyles2 } from '@grafana/ui';
import React, { useMemo } from 'react';
import { Cell, Column, useFilters, useSortBy, useTable } from 'react-table';
import { HeaderRow } from './HeaderRow';
import { getTableStyles } from './styles';

interface Props<T> {
  frame: T[];
}
export const Table = <T extends Object>({ frame }: Props<T>) => {
  const tableStyles = useStyles2(getTableStyles);

  const memoizedData = useMemo(() => {
    if (!frame.length) {
      return [];
    }

    return Array(frame?.length).fill(0);
  }, [frame]);

  const memoizedColumns: ReadonlyArray<Column<T>> = useMemo(() => {
    const cols: Array<Column<T>> = [];

    let propNames: { [key: string]: boolean } = {};
    frame.forEach((f, fIdx) => {
      Object.keys(f).forEach((key) => {
        propNames[key] = true;
      });
    });

    return Object.keys(propNames).map((name, idx) => ({
      id: idx.toString(),
      Header: name,
      accessor: (_: any, i: number) => {
        //@ts-ignore
        return frame[i][name];
      },

      Cell: CellComponent,
    }));

    return cols;
  }, [frame]);

  const options: any = useMemo(
    () => ({
      columns: memoizedColumns,
      data: memoizedData,
      autoResetFilters: false,
    }),
    [memoizedColumns, memoizedData]
  );

  const tableInstance = useTable({ ...options }, useFilters, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  const TableCell = ({ cell, styles }: { cell: Cell<any>; styles: any }) => {
    const cellProps = cell.getCellProps();
    return (
      <td {...cellProps}>
        {cell.render('Cell', {
          cellProps,
          tableStyles: styles,
        })}
      </td>
    );
  };

  return (
    <table {...getTableProps()}>
      <HeaderRow headerGroups={headerGroups} />
      <tbody {...getTableBodyProps()}>
        {
          // Loop over the table rows
          rows.map((row, index) => {
            // Prepare the row for display
            prepareRow(row);
            return (
              // Apply the row props
              <tr {...row.getRowProps()} key={index}>
                {
                  // Loop over the rows cells
                  row.cells.map((cell, index) => {
                    // Apply the cell props
                    return <TableCell cell={cell} key={index} styles={tableStyles} />;
                  })
                }
              </tr>
            );
          })
        }
      </tbody>
    </table>
  );
};

const CellComponent = (props: any) => {
  return (
    <div {...props.cellProps} className={props.tableStyles.cellContainer}>
      <div className={props.tableStyles.cellText}>{props.value}</div>
    </div>
  );
};
