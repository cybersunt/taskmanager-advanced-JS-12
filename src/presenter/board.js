import Board from "../view/board.js";
import Sort from "../view/sort.js";
import Tasks from "../view/tasks.js";
import NoTask from "../view/no-task.js";
import LoadMoreButton from "../view/load-more-button.js";
import {render, RenderPosition, remove} from "../utils/render.js";
import {SortType, UpdateType, UserAction} from "../const.js";
import {sortTaskDown, sortTaskUp} from "../utils/task";
import TaskPresenter from "./task";
import TaskNewPresenter from "./task-new.js";
import {filter} from "../utils/filter";
import Loading from "../view/loading";

const TASK_COUNT_PER_STEP = 8;

export default class BoardPresenter {
  constructor(boardContainer, tasksModel, filterModel, api) {
    this._boardContainer = boardContainer;
    this._tasksModel = tasksModel;
    this._filterModel = filterModel;
    this._renderedTaskCount = TASK_COUNT_PER_STEP;
    this._currentSortType = SortType.DEFAULT;
    this._taskPresenter = {};
    this._isLoading = true;
    this._api = api;

    this._sortComponent = null;
    this._loadMoreButtonComponent = null;

    this._boardComponent = new Board();
    this._sortComponent = new Sort();
    this._taskListComponent = new Tasks();
    this._noTaskComponent = new NoTask();
    this._loadingComponent = new Loading();
    this._loadMoreButtonComponent = new LoadMoreButton();

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleLoadMoreButtonClick = this._handleLoadMoreButtonClick.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);

    this._taskNewPresenter = new TaskNewPresenter(this._taskListComponent, this._handleViewAction);
  }

  init() {
    render(this._boardContainer, this._boardComponent, RenderPosition.BEFOREEND);
    render(this._boardComponent, this._taskListComponent, RenderPosition.BEFOREEND);

    this._tasksModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);

    this._renderBoard();
  }

  destroy() {
    this._clearBoard({resetRenderedTaskCount: true, resetSortType: true});

    remove(this._taskListComponent);
    remove(this._boardComponent);

    this._tasksModel.removeObserver(this._handleModelEvent);
    this._filterModel.removeObserver(this._handleModelEvent);
  }

  createTask(callback) {
    this._taskNewPresenter.init(callback);
  }

  _getTasks() {
    const filterType = this._filterModel.getFilter();
    const tasks = this._tasksModel.getTasks();
    const filteredTasks = filter[filterType](tasks);

    switch (this._currentSortType) {
      case SortType.DATE_UP:
        return filteredTasks.sort(sortTaskUp);
      case SortType.DATE_DOWN:
        return filteredTasks.sort(sortTaskDown);
    }
    return filteredTasks;
  }

  _handleModeChange() {
    Object
      .values(this._taskPresenter)
      .forEach((presenter) => presenter.resetView());

    this._taskNewPresenter.destroy();
  }

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.UPDATE_TASK:
        this._api.updateTask(update).then((response) => {
          this._tasksModel.updateTask(updateType, response);
        });
        break;
      case UserAction.ADD_TASK:
        this._tasksModel.addTask(updateType, update);
        break;
      case UserAction.DELETE_TASK:
        this._tasksModel.deleteTask(updateType, update);
        break;
    }
  }

  _handleModelEvent(updateType, data) {
    switch (updateType) {
      case UpdateType.PATCH:
        // - обновить часть списка (например, когда поменялось описание)
        this._taskPresenter[data.id].init(data);
        break;
      case UpdateType.MINOR:
        this._clearBoard();
        this._renderBoard();
        break;
      case UpdateType.MAJOR:
        this._clearBoard({resetRenderedTaskCount: true, resetSortType: true});
        this._renderBoard();
        break;
      case UpdateType.INIT:
        this._isLoading = false;
        remove(this._loadingComponent);
        this._renderBoard();
        break;
    }
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }
    this._currentSortType = sortType;
    this._clearBoard({resetRenderedTaskCount: true});
    this._renderBoard();
  }

  _renderSort() {
    if (this._sortComponent !== null) {
      this._sortComponent = null;
    }

    this._sortComponent = new Sort(this._currentSortType);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);

    render(this._boardComponent, this._sortComponent, RenderPosition.AFTERBEGIN);
  }

  _renderTask(task) {
    const taskPresenter = new TaskPresenter(this._taskListComponent, this._handleViewAction, this._handleModeChange);
    taskPresenter.init(task);
    this._taskPresenter[task.id] = taskPresenter;
  }

  _renderTasks(tasks) {
    tasks.forEach((task) => this._renderTask(task));
  }

  _renderLoading() {
    render(this._boardComponent, this._loadingComponent, RenderPosition.AFTERBEGIN);
  }

  _renderNoTasks() {
    render(this._boardComponent, this._noTaskComponent, RenderPosition.AFTERBEGIN);
  }

  _handleLoadMoreButtonClick() {
    const taskCount = this._getTasks().length;
    const newRenderedTaskCount = Math.min(taskCount, this._renderedTaskCount + TASK_COUNT_PER_STEP);
    const tasks = this._getTasks().slice(this._renderedTaskCount, newRenderedTaskCount);

    this._renderTasks(tasks);
    this._renderedTaskCount = newRenderedTaskCount;

    if (this._renderedTaskCount >= taskCount) {
      remove(this._loadMoreButtonComponent);
    }
  }

  _renderLoadMoreButton() {
    render(this._boardComponent, this._loadMoreButtonComponent, RenderPosition.BEFOREEND);

    this._loadMoreButtonComponent.setClickHandler(this._handleLoadMoreButtonClick);
  }

  _clearBoard({resetRenderedTaskCount = false, resetSortType = false} = {}) {
    const taskCount = this._getTasks().length;

    Object
      .values(this._taskPresenter)
      .forEach((presenter) => presenter.destroy());
    this._taskPresenter = {};

    remove(this._sortComponent);
    remove(this._noTaskComponent);
    remove(this._loadMoreButtonComponent);

    if (resetRenderedTaskCount) {
      this._renderedTaskCount = TASK_COUNT_PER_STEP;
    } else {
      // На случай, если перерисовка доски вызвана
      // уменьшением количества задач (например, удаление или перенос в архив)
      // нужно скорректировать число показанных задач
      this._renderedTaskCount = Math.min(taskCount, this._renderedTaskCount);
    }

    if (resetSortType) {
      this._currentSortType = SortType.DEFAULT;
    }
  }

  _renderBoard() {
    if (this._isLoading) {
      this._renderLoading();
      return;
    }

    const tasks = this._getTasks();
    const taskCount = tasks.length;

    if (taskCount === 0) {
      this._renderNoTasks();
      return;
    }

    this._renderSort();

    // Теперь, когда _renderBoard рендерит доску не только на старте,
    // но и по ходу работы приложения, нужно заменить
    // константу TASK_COUNT_PER_STEP на свойство _renderedTaskCount,
    // чтобы в случае перерисовки сохранить N-показанных карточек
    this._renderTasks(tasks.slice(0, Math.min(taskCount, this._renderedTaskCount)));

    if (taskCount > this._renderedTaskCount) {
      this._renderLoadMoreButton();
    }
  }
}
