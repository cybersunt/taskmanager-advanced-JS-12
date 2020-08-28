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
import {renderElement, RenderPosition} from "./utils.js";

const TASK_COUNT = 22;
const TASK_COUNT_PER_STEP = 8;

const tasks = new Array(TASK_COUNT).fill().map(generateTask);
const filters = generateFilter(tasks);

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

renderElement(siteHeaderElement, new SiteMenu().getElement(), RenderPosition.BEFOREEND);
renderElement(siteMainElement, new Filter(filters).getElement(), RenderPosition.BEFOREEND);

const boardComponent = new Board();

renderElement(siteMainElement, boardComponent.getElement(), RenderPosition.BEFOREEND);
renderElement(boardComponent.getElement(), new Sort().getElement(), RenderPosition.BEFOREEND);

const tasksListComponent = new Tasks();

renderElement(boardComponent.getElement(), tasksListComponent.getElement(), RenderPosition.BEFOREEND);


renderElement(tasksListComponent.getElement(), new TaskEdit(tasks[0]).getElement(), RenderPosition.BEFOREEND);

for (let i = 1; i < Math.min(tasks.length, TASK_COUNT_PER_STEP); i++) {
  renderElement(tasksListComponent.getElement(), new Task(tasks[i]).getElement(), RenderPosition.BEFOREEND);
}

if (tasks.length > TASK_COUNT_PER_STEP) {
  let renderedTaskCount = TASK_COUNT_PER_STEP;

  const loadMoreButtonComponent = new LoadMoreButton();

  renderElement(boardComponent.getElement(), loadMoreButtonComponent.getElement(), RenderPosition.BEFOREEND);

  loadMoreButtonComponent.getElement().addEventListener(`click`, (evt) => {
    evt.preventDefault();
    tasks
      .slice(renderedTaskCount, renderedTaskCount + TASK_COUNT_PER_STEP)
      .forEach((task) => renderElement(tasksListComponent.getElement(), new Task(task).getElement(), RenderPosition.BEFOREEND));

    renderedTaskCount += TASK_COUNT_PER_STEP;

    if (renderedTaskCount >= tasks.length) {
      loadMoreButtonComponent.getElement().remove();
      loadMoreButtonComponent.removeElement();
    }
  });
}
