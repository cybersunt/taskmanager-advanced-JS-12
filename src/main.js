import {generateTask} from "./mock/task.js";
import {render, RenderPosition} from "./utils/render.js";
import SiteMenu from './view/site-menu.js';
import BoardPresenter from "./presenter/board";
import FilterPresenter from "./presenter/filter.js";
import TasksModel from "./model/tasks.js";
import FilterModel from "./model/filter";
import {MenuItem, UpdateType, FilterType} from "./const.js";
import Statistics from "./view/statistics";
import {remove} from "./utils/render";

const TASK_COUNT = 22;

const tasks = new Array(TASK_COUNT).fill(``).map(generateTask);

let statisticsComponent = null;

const tasksModel = new TasksModel();
tasksModel.setTasks(tasks);

const filterModel = new FilterModel();

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);
const siteMenuComponent = new SiteMenu();

render(siteHeaderElement, siteMenuComponent.getElement(), RenderPosition.BEFOREEND);

const boardPresenter = new BoardPresenter(siteMainElement, tasksModel, filterModel);
const filterPresenter = new FilterPresenter(siteMainElement, filterModel, tasksModel);

const handleTaskNewFormClose = () => {
  siteMenuComponent.getElement().querySelector(`[value=${MenuItem.TASKS}]`).disabled = false;
  siteMenuComponent.setMenuItem(MenuItem.TASKS);
};

const handleSiteMenuClick = (menuItem) => {
  switch (menuItem) {
    case MenuItem.ADD_NEW_TASK:
      remove(statisticsComponent);
      boardPresenter.destroy();
      filterModel.setFilter(UpdateType.MAJOR, FilterType.ALL);
      boardPresenter.init();
      boardPresenter.createTask(handleTaskNewFormClose);
      siteMenuComponent.getElement().querySelector(`[value=${MenuItem.TASKS}]`).disabled = true;
      break;
    case MenuItem.TASKS:
      remove(statisticsComponent);
      boardPresenter.init();
      break;
    case MenuItem.STATISTICS:
      boardPresenter.destroy();
      statisticsComponent = new Statistics(tasksModel.getTasks());
      render(siteMainElement, statisticsComponent, RenderPosition.BEFOREEND);
      break;
  }
};

siteMenuComponent.setMenuClickHandler(handleSiteMenuClick);

filterPresenter.init();
// Для удобства отладки скроем доску
// boardPresenter.init();
// и отобразим сразу статистику
render(siteMainElement, new Statistics(tasksModel.getTasks()), RenderPosition.BEFOREEND);
