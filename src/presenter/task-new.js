import TaskEdit from "../view/task-edit.js";
import {remove, render, RenderPosition} from "../utils/render.js";
import {SortType, UpdateType, UserAction, FilterType} from "../const.js";
import {nanoid} from "nanoid";

export default class TaskNew {
  constructor(taskListContainer, changeData) {
    this._taskListContainer = taskListContainer;
    this._changeData = changeData;

    this._taskEditComponent = null;
    this._destroyCallback = null;

    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
    this._escKeyDownHandler = this._escKeyDownHandler.bind(this);
  }

  init(callback) {
    this._destroyCallback = callback;
    if (this._taskEditComponent !== null) {
      return;
    }

    this._taskEditComponent = new TaskEdit();
    this._taskEditComponent.setFormSubmitHandler(this._handleFormSubmit);
    this._taskEditComponent.setDeleteClickHandler(this._handleDeleteClick);

    render(this._taskListContainer, this._taskEditComponent, RenderPosition.AFTERBEGIN);

    document.addEventListener(`keydown`, this._escKeyDownHandler);
  }

  destroy() {
    if (this._taskEditComponent === null) {
      return;
    }

    if (this._destroyCallback !== null) {
      this._destroyCallback();
    }

    remove(this._taskEditComponent);
    this._taskEditComponent = null;

    document.removeEventListener(`keydown`, this._escKeyDownHandler);
  }

  createTask() {
    this._currentSortType = SortType.DEFAULT;
    this._filterModel.setFilter(UpdateType.MAJOR, FilterType.ALL);
    this._taskNewPresenter.init();
  }

  _handleFormSubmit(task) {
    this._changeData(
        UserAction.ADD_TASK,
        UpdateType.MINOR,
        // Пока у нас нет сервера, который бы после сохранения
        // выдывал честный id задачи, нам нужно позаботиться об этом самим
        Object.assign({id: nanoid()}, task)
    );
    this.destroy();
  }

  _handleDeleteClick() {
    this.destroy();
  }

  _escKeyDownHandler(evt) {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      evt.preventDefault();
      this.destroy();
    }
  }
}
