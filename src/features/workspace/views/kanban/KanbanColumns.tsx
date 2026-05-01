import type { ReactNode } from "react";

export interface KanbanColumnDefinition<TState extends string> {
  state: TState;
  header: ReactNode;
  count: number;
}

interface KanbanColumnsProps<TState extends string, TItem> {
  boardClassName: string;
  columnBodyClassName: string;
  columnClassName: string;
  columnEmptyClassName: string;
  columnHeaderClassName: string;
  columnCountClassName: string;
  columns: readonly KanbanColumnDefinition<TState>[];
  emptyLabel: string;
  itemsByState: Record<TState, readonly TItem[]>;
  renderItem: (item: TItem, state: TState) => ReactNode;
}

export function KanbanColumns<TState extends string, TItem>({
  boardClassName,
  columnBodyClassName,
  columnClassName,
  columnEmptyClassName,
  columnHeaderClassName,
  columnCountClassName,
  columns,
  emptyLabel,
  itemsByState,
  renderItem,
}: KanbanColumnsProps<TState, TItem>) {
  return (
    <div className={boardClassName}>
      {columns.map((column) => {
        const items = itemsByState[column.state];

        return (
          <section className={columnClassName} key={column.state}>
            <div className={columnHeaderClassName}>
              {column.header}
              <span className={columnCountClassName}>{column.count}</span>
            </div>
            <div className={columnBodyClassName}>
              {items.length > 0 ? (
                items.map((item) => renderItem(item, column.state))
              ) : (
                <p className={columnEmptyClassName}>{emptyLabel}</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
