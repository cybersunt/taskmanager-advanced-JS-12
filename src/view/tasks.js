import Abstract from "./abstract";

const createTasksTemplate = () => `<div class='board__tasks'></div>`;

export default class Tasks extends Abstract{
  getTemplate() {
    return createTasksTemplate();
  }
}
