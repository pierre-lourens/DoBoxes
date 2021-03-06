import axios from "axios";

export const CHECK_FOR_USER = "CHECK_FOR_USER";
export const ADD_TASK = "ADD_TASK";
export const EDIT_TASK = "EDIT_TASK";
export const GET_TASKS = "GET_TASKS";
export const SHOW_EDIT_MODAL = "SHOW_EDIT_MODAL";
export const START_TIMER = "START_TIMER";
export const STOP_TIMER = "STOP_TIMER";
export const SEND_SESSION = "SEND_SESSION";
export const SEND_TASK_BOXES = "SEND_TASK_BOXES";
export const ADD_TASK_TO_BOX = "ADD_TASK_TO_BOX";
export const GET_TASK_BOXES = "GET_TASK_BOXES";
export const ADD_BOX = "ADD_BOX";
export const REMOVE_TASK_FROM_BOX = "REMOVE_TASK_FROM_BOX";
export const GENERATE_FAKE_DATA = "GENERATE_FAKE_DATA";

export function checkForUser() {
  const url = `/api/current_user`;
  const request = axios.get(url, { withCredentials: true });

  return {
    type: CHECK_FOR_USER,
    payload: request,
  };
}

export function addTask(task, userId) {
  const url = `/api/me/task`;

  // console.log("taskToAdd is", task);

  const request = axios({
    method: "post",
    url: url,
    withCredentials: true,
    data: {
      task,
      userId,
    },
  });

  return {
    type: ADD_TASK,
    payload: request,
  };
}

export function editTask(taskId, changesObject) {
  const url = `/api/tasks/${taskId}`;

  // console.log("CHANGES OBJECT IS", changesObject);

  const request = axios({
    method: "put",
    url: url,
    withCredentials: true,
    data: {
      task: changesObject,
    },
  });

  return {
    type: EDIT_TASK,
    payload: request,
  };
}

export function startTimer(taskId, userId) {
  const url = `/api/me/timeEntry`;

  const request = axios({
    method: "post",
    url: url,
    withCredentials: true,
    data: {
      taskId,
      userId,
    },
  });

  return {
    type: START_TIMER,
    payload: request,
  };
}

export function stopTimer(timeEntryId, userId, taskId) {
  const url = `/api/me/timeEntry`;

  const request = axios({
    method: "put",
    url: url,
    withCredentials: true,
    data: { timeEntryId, userId, taskId },
  });

  return {
    type: STOP_TIMER,
    payload: request,
  };
}

export function sendSession(taskId, userId, startDate, endDate) {
  const url = `/api/me/timeEntrySession`;

  const request = axios({
    method: "post",
    url: url,
    withCredentials: true,
    data: { taskId, userId, startDate, endDate },
  });

  return {
    type: SEND_SESSION,
    payload: request,
  };
}

export function getTasks(userId) {
  const url = `/api/${userId}/tasks`;

  // console.log("userid being sent is", userId);

  const request = axios({
    method: "get",
    url: url,
    withCredentials: true,
  });

  return {
    type: GET_TASKS,
    payload: request,
  };
}

export function sendTaskBoxes(userId, boxes) {
  const url = `/api/me/boxes`;

  // console.log("BOXES BEING SENT ARE", boxes);

  // let's get it back in the format that we store in the db
  const boxesObject = Object.values(boxes);

  const request = axios({
    method: "put",
    url: url,
    withCredentials: true,
    data: { userId, boxes: boxesObject },
  });

  return {
    type: SEND_TASK_BOXES,
    payload: request,
  };
}

export function addTaskToBox(task, boxName, userId) {
  // const url = `${ROOT_URL}/api/${userId}/boxes`;
  // const request = axios({
  //   method: "post",
  //   url: url,
  //   withCredentials: true,
  //   data: { taskId: task._id, boxName },
  // });
  // return {
  //   type: ADD_TASK_TO_BOX,
  //   payload: request,
  // };
}

export function getTaskBoxes(userId) {
  const url = `/api/${userId}/boxes`;

  const request = axios({
    method: "get",
    url: url,
    withCredentials: true,
  });

  return {
    type: GET_TASK_BOXES,
    payload: request,
  };
}

export function addBox(userId, boxTitle, time) {
  const url = `/api/${userId}/boxes`;

  // console.log("ADD BOX", userId, boxTitle, time);

  const request = axios({
    method: "post",
    url: url,
    withCredentials: true,
    data: { boxTitle, time },
  });

  return {
    type: ADD_BOX,
    payload: request,
  };
}

export function removeTaskFromBox(userId, boxTitle, taskId) {
  const url = `/api/${userId}/boxes`;

  const request = axios({
    method: "delete",
    url: url,
    withCredentials: true,
    data: { title: boxTitle, taskId },
  });

  return {
    type: REMOVE_TASK_FROM_BOX,
    payload: request,
  };
}

export function generateFakeData(userId) {
  const url = `/api/${userId}/generate-fake-data`;

  // console.log("request being made for fake data with user", userId);

  const request = axios({
    method: "get",
    url: url,
    withCredentials: true,
  });

  return {
    type: GENERATE_FAKE_DATA,
    payload: request,
  };
}
