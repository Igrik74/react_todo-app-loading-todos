import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { getTodos } from './api/todos';
import { Todo } from './types/Todo';

enum FilterStatus {
  All = 'all',
  Active = 'active',
  Completed = 'completed',
}

const ERROR_HIDE_DELAY = 3000;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterStatus>(FilterStatus.All);
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const errorTimerId = useRef<number | null>(null);
  const newTodoFieldRef = useRef<HTMLInputElement>(null);

  const clearErrorTimer = useCallback(() => {
    if (errorTimerId.current) {
      window.clearTimeout(errorTimerId.current);
      errorTimerId.current = null;
    }
  }, []);

  const hideError = useCallback(() => {
    clearErrorTimer();
    setIsErrorVisible(false);
  }, [clearErrorTimer]);

  const showError = useCallback(
    (message: string) => {
      clearErrorTimer();
      setErrorMessage(message);
      setIsErrorVisible(true);

      errorTimerId.current = window.setTimeout(() => {
        setIsErrorVisible(false);
      }, ERROR_HIDE_DELAY);
    },
    [clearErrorTimer],
  );

  useEffect(() => {
    newTodoFieldRef.current?.focus();
  }, []);

  useEffect(() => {
    hideError();

    getTodos()
      .then(setTodos)
      .catch(() => {
        showError('Unable to load todos');
      });

    return () => {
      clearErrorTimer();
    };
  }, [clearErrorTimer, hideError, showError]);

  const visibleTodos = useMemo(() => {
    switch (filter) {
      case FilterStatus.Active:
        return todos.filter(todo => !todo.completed);

      case FilterStatus.Completed:
        return todos.filter(todo => todo.completed);

      default:
        return todos;
    }
  }, [todos, filter]);

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.length - activeTodosCount;
  const hasTodos = todos.length > 0;

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        {hasTodos && (
          <button
            type="button"
            className={classNames('todoapp__toggle-all', {
              active: activeTodosCount === 0,
            })}
            data-cy="ToggleAllButton"
          />
        )}

        <form>
          <input
            ref={newTodoFieldRef}
            data-cy="NewTodoField"
            type="text"
            className="todoapp__new-todo"
            placeholder="What needs to be done?"
          />
        </form>

        {hasTodos && (
          <section className="todoapp__main">
            {visibleTodos.map(todo => (
              <div
                key={todo.id}
                data-cy="Todo"
                className={classNames('todo', {
                  completed: todo.completed,
                })}
              >
                <label
                  htmlFor={`todo-status-${todo.id}`}
                  className="todo__status-label"
                >
                  <input
                    id={`todo-status-${todo.id}`}
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                    readOnly
                    aria-label="Toggle todo status"
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {todo.title}
                </span>

                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                >
                  ×
                </button>

                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            ))}
          </section>
        )}

        {hasTodos && (
          <footer className="todoapp__footer">
            <span className="todo-count" data-cy="TodosCounter">
              {`${activeTodosCount} item${activeTodosCount === 1 ? '' : 's'} left`}
            </span>

            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                data-cy="FilterLinkAll"
                className={classNames('filter__link', {
                  selected: filter === FilterStatus.All,
                })}
                onClick={event => {
                  event.preventDefault();
                  setFilter(FilterStatus.All);
                }}
              >
                All
              </a>

              <a
                href="#/active"
                data-cy="FilterLinkActive"
                className={classNames('filter__link', {
                  selected: filter === FilterStatus.Active,
                })}
                onClick={event => {
                  event.preventDefault();
                  setFilter(FilterStatus.Active);
                }}
              >
                Active
              </a>

              <a
                href="#/completed"
                data-cy="FilterLinkCompleted"
                className={classNames('filter__link', {
                  selected: filter === FilterStatus.Completed,
                })}
                onClick={event => {
                  event.preventDefault();
                  setFilter(FilterStatus.Completed);
                }}
              >
                Completed
              </a>
            </nav>

            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={completedTodosCount === 0}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !isErrorVisible },
        )}
      >
        <button
          type="button"
          className="delete"
          data-cy="HideErrorButton"
          onClick={hideError}
        />

        {errorMessage}
      </div>
    </div>
  );
};
