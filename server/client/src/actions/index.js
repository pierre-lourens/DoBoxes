import axios from "axios";

export const CHECK_FOR_USER = "CHECK_FOR_USER";
export const ADD_TASK = "ADD_TASK";

const ROOT_URL = "http://localhost:5000";

export function checkForUser() {
  const url = `${ROOT_URL}/api/current_user`;
  const request = axios.get(url, { withCredentials: true });

  return {
    type: CHECK_FOR_USER,
    payload: request,
  };
}

export function addTask(taskToAdd, userId) {
  const url = `${ROOT_URL}/api/me/task`;

  console.log("taskToAdd is", taskToAdd);

  const request = axios({
    method: "post",
    url: url,
    withCredentials: true,
    data: {
      text: taskToAdd.text,
      userId,
    },
  });

  return {
    type: ADD_TASK,
    payload: request,
  };
}
