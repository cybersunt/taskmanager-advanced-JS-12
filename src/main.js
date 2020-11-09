import {generateTask} from "./mock/task.js";
import {render, RenderPosition} from "./utils/render.js";
import SiteMenu from './view/site-menu.js';
import BoardPresenter from "./presenter/board";
import FilterPresenter from "./presenter/filter.js";
import TasksModel from "./model/tasks.js";
import FilterModel from "../../taskmanager-12/src/model/filter";

const TASK_COUNT = 22;

const tasks = new Array(TASK_COUNT).fill(``).map(generateTask);

const tasksModel = new TasksModel();
tasksModel.setTasks(tasks);

const filterModel = new FilterModel();

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

render(siteHeaderElement, new SiteMenu().getElement(), RenderPosition.BEFOREEND);

const boardPresenter = new BoardPresenter(siteMainElement, tasksModel, filterModel);
const filterPresenter = new FilterPresenter(siteMainElement, filterModel, tasksModel);

filterPresenter.init();
boardPresenter.init();
