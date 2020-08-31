import SiteMenu from './view/site-menu.js';
import Filter from './view/filter.js';
import Board from './view/board.js';
import Sort from './view/sort';
import Tasks from './view/tasks';
import Task from './view/task.js';
import TaskEdit from './view/task-edit.js';
import LoadMoreButton from './view/load-more-button.js';
import {generateTask} from "./mock/task.js";
import {generateFilter} from "./mock/filter.js";
import {render, RenderPosition} from "./utils/render.js";
import NoTask from "./view/no-task";

const TASK_COUNT = 22;
const TASK_COUNT_PER_STEP = 8;

const tasks = new Array(TASK_COUNT).fill().map(generateTask);
const filters = generateFilter(tasks);

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

const renderTask = (taskListElement, task) => {
  const taskComponent = new Task(task);
  const taskEditComponent = new TaskEdit(task);

  const onEscKeyDown = (evt) => {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      evt.preventDefault();
      replaceFormToCard();
      document.removeEventListener(`keydown`, onEscKeyDown);
    }
  };

  const replaceCardToForm = () => {
    taskListElement.replaceChild(taskEditComponent.getElement(), taskComponent.getElement());
    document.addEventListener(`keydown`, onEscKeyDown);
  };

  const replaceFormToCard = () => {
    taskListElement.replaceChild(taskComponent.getElement(), taskEditComponent.getElement());
    document.removeEventListener(`keydown`, onEscKeyDown);
  };

  taskComponent.getElement().querySelector(`.card__btn--edit`).addEventListener(`click`, () => {
    replaceCardToForm();
  });

  taskEditComponent.getElement().querySelector(`form`).addEventListener(`submit`, (evt) => {
    evt.preventDefault();
    replaceFormToCard();
  });

  render(taskListElement, taskComponent.getElement(), RenderPosition.BEFOREEND);
};

const renderBoard = (boardContainer, boardTasks) => {
  const boardComponent = new Board();
  const taskListComponent = new Tasks();

  render(boardContainer, boardComponent.getElement(), RenderPosition.BEFOREEND);
  render(boardComponent.getElement(), taskListComponent.getElement(), RenderPosition.BEFOREEND);

  if (boardTasks.every((task) => task.isArchive)) {
    render(boardComponent.getElement(), new NoTask().getElement(), RenderPosition.AFTERBEGIN);
    return;
  }

  render(boardComponent.getElement(), new Sort().getElement(), RenderPosition.AFTERBEGIN);

  boardTasks
    .slice(0, Math.min(tasks.length, TASK_COUNT_PER_STEP))
    .forEach((boardTask) => renderTask(taskListComponent.getElement(), boardTask));

  if (boardTasks.length > TASK_COUNT_PER_STEP) {
    let renderedTaskCount = TASK_COUNT_PER_STEP;

    const loadMoreButtonComponent = new LoadMoreButton();

    render(boardComponent.getElement(), loadMoreButtonComponent.getElement(), RenderPosition.BEFOREEND);

    loadMoreButtonComponent.getElement().addEventListener(`click`, (evt) => {
      evt.preventDefault();
      boardTasks
        .slice(renderedTaskCount, renderedTaskCount + TASK_COUNT_PER_STEP)
        .forEach((boardTask) => renderTask(taskListComponent.getElement(), boardTask));

      renderedTaskCount += TASK_COUNT_PER_STEP;

      if (renderedTaskCount >= boardTasks.length) {
        loadMoreButtonComponent.getElement().remove();
        loadMoreButtonComponent.removeElement();
      }
    });
  }
};

render(siteHeaderElement, new SiteMenu().getElement(), RenderPosition.BEFOREEND);
render(siteMainElement, new Filter(filters).getElement(), `beforeend`);

renderBoard(siteMainElement, tasks);
