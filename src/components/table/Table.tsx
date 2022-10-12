import { FilterPill, HorizontalGroup, Pagination, useStyles2 } from '@grafana/ui';
import React, { useMemo } from 'react';
import { Cell, Column, TableOptions, useFilters, usePagination, useSortBy, useTable } from 'react-table';
import { HeaderRow } from './HeaderRow';
import { getTableStyles } from './styles';

interface Props<T> {
  frame: T[];
  columns: Array<{
    id: keyof T;
    displayValue: string;
    sortType?: string;
    renderCell?: (props: any) => JSX.Element;
  }>;
  onRowClick?: (rowID: number, t: T) => void;
  hiddenColumns?: Array<keyof T>;
  pageSize?: number;
  sortBy?: Array<{ id: string; desc: boolean }>;
  selectedRowIDs?: number[];
}

export const Table = <T extends Object>({
  frame,
  columns,
  hiddenColumns,
  selectedRowIDs,
  pageSize,
  sortBy,
  onRowClick,
}: Props<T>) => {
  const tableStyles = useStyles2(getTableStyles);

  const memoizedData = useMemo(() => {
    if (!frame.length) {
      return [];
    }

    return Array(frame?.length).fill(0);
  }, [frame]);

  const memoizedColumns: ReadonlyArray<Column<any>> = useMemo(() => {
    return columns.map(
      (c) =>
        ({
          // id: idx.toString(),
          id: c.id,
          Header: c.displayValue,
          accessor: (_: any, i: number) => {
            return frame[i][c.id];
          },
          sortType: c.sortType ?? 'basic',
          Cell: c.renderCell ? c.renderCell : CellComponent,
        } as Column<any>)
    );
  }, [frame, columns]);

  const options: TableOptions<any> = useMemo(
    () => ({
      columns: memoizedColumns,
      data: memoizedData,
      autoResetFilters: false,
      autoResetHiddenColumns: false,
      autoResetPage: false,
      initialState: {
        pageSize: pageSize ?? 50,
        hiddenColumns: hiddenColumns?.map((k) => k.toString()),
        sortBy: sortBy ?? [],
      },
    }),
    [sortBy, pageSize, memoizedColumns, memoizedData, hiddenColumns]
  );

  const tableInstance = useTable({ ...options }, useFilters, useSortBy, usePagination);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    // rows,
    prepareRow,
    // getToggleHideAllColumnsProps,

    //@ts-ignore
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    //@ts-ignore
    pageCount,
    //@ts-ignore
    gotoPage,

    //@ts-ignore
    state: { pageIndex },

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
            return (
              <div key={column.id}>
                <label>
                  <FilterPill
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
            //@ts-ignore
            page.map((row, index) => {
              // Prepare the row for display
              prepareRow(row);
              return (
                // Apply the row props
                <tr
                  {...row.getRowProps()}
                  onClick={() => {
                    onRowClick?.(row.id, row.values);
                  }}
                  style={selectedRowIDs?.includes(row.id) ? { outline: 'rgb(110, 159, 255) solid 2px' } : {}}
                  key={index}
                >
                  {
                    // Loop over the rows cells
                    //@ts-ignore
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
      <Pagination
        currentPage={pageIndex + 1}
        numberOfPages={pageCount}
        onNavigate={(page) => gotoPage(page - 1)}
        hideWhenSinglePage
      />
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
