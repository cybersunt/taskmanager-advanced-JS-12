import {generateTask} from "./mock/task.js";
import {generateFilter} from "./mock/filter.js";
import {render, RenderPosition} from "./utils/render.js";
import SiteMenu from './view/site-menu.js';
import Filter from './view/filter.js';
import BoardPresenter from "./presenter/board";

const TASK_COUNT = 22;

const tasks = new Array(TASK_COUNT).fill(``).map(generateTask);
const filters = generateFilter(tasks);

const siteMainElement = document.querySelector(`.main`);
const siteHeaderElement = siteMainElement.querySelector(`.main__control`);

const boardPresenter = new BoardPresenter(siteMainElement);

render(siteHeaderElement, new SiteMenu().getElement(), RenderPosition.BEFOREEND);
render(siteMainElement, new Filter(filters).getElement(), `beforeend`);

boardPresenter.init(tasks);
