import { START_TIMER } from "../actions/index";
import { STOP_TIMER } from "../actions/index";

export default function (state = [], action) {
  switch (action.type) {
    case START_TIMER:
      return [action.payload.data, ...state];
    case STOP_TIMER:
      return [action.payload.data, ...state];
    default:
      return state;
  }
}
