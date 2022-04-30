import { FilterPill, HorizontalGroup, useStyles2 } from '@grafana/ui';
import React, { useMemo } from 'react';
import { Cell, Column, TableOptions, useFilters, useSortBy, useTable } from 'react-table';
import { HeaderRow } from './HeaderRow';
import { getTableStyles } from './styles';

interface Props<T> {
  frame: T[];
  hiddenColumns?: Array<keyof T>;
}
export const Table = <T extends Object>({ frame, hiddenColumns }: Props<T>) => {
  const tableStyles = useStyles2(getTableStyles);

  const memoizedData = useMemo(() => {
    if (!frame.length) {
      return [];
    }

    return Array(frame?.length).fill(0);
  }, [frame]);

  const memoizedColumns: ReadonlyArray<Column<any>> = useMemo(() => {
    const cols: Array<Column<any>> = [];

    let propNames: { [key: string]: boolean } = {};
    frame.forEach((f, fIdx) => {
      Object.keys(f).forEach((key) => {
        propNames[key] = true;
      });
    });

    return Object.keys(propNames).map((name, idx) => ({
      // id: idx.toString(),
      id: name,
      Header: name,
      accessor: (_: any, i: number) => {
        //@ts-ignore
        return frame[i][name];
      },

      Cell: CellComponent,
    }));

    return cols;
  }, [frame]);

  const options: TableOptions<any> = useMemo(
    () => ({
      columns: memoizedColumns,
      data: memoizedData,
      autoResetFilters: false,
      autoResetHiddenColumns: false,
      initialState: {
        hiddenColumns: hiddenColumns?.map((k) => k.toString()),
      },
    }),
    [memoizedColumns, memoizedData, hiddenColumns]
  );

  const tableInstance = useTable({ ...options }, useFilters, useSortBy);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // getToggleHideAllColumnsProps,
    allColumns,
    visibleColumns,
  } = tableInstance;

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

  const tableProps = getTableProps();
  return (
    <>
      <div>
        <HorizontalGroup width="100%">
          <FilterPill
            selected={allColumns.length === visibleColumns.length}
            onClick={() => {
              if (visibleColumns.length === 0 || visibleColumns.length === allColumns.length) {
                allColumns.forEach((c) => c.toggleHidden());
              } else {
                allColumns.forEach((c) => c.toggleHidden(false));
              }
            }}
            label={'Toggle All'}
          />
          {allColumns.map((column) => {
            // let props = column.getToggleHiddenProps();
            // console.log(props);
            return (
              <div key={column.id}>
                <label>
                  <FilterPill
                    // {...props}
                    selected={column.isVisible}
                    onClick={() => column.toggleHidden()}
                    label={column.Header!.toString()}
                  />
                </label>
              </div>
            );
          })}
        </HorizontalGroup>
      </div>
      <table {...tableProps} style={{ ...tableProps.style, width: '100%' }}>
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
    </>
  );
};

const CellComponent = (props: any) => {
  return (
    <div {...props.cellProps} className={props.tableStyles.cellContainer}>
      <div className={props.tableStyles.cellText}>{props.value}</div>
    </div>
  );
};
