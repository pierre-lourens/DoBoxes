import React from "react";
import { connect } from "react-redux";
import { Draggable } from "react-beautiful-dnd";
import styled from "styled-components";

import ActiveTimerButton from "./Buttons/ActiveTimerButton";
import Tag from "../assets/Tag";
import InactiveTimerButton from "./Buttons/InactiveTimerButton";
import EmptyCircle from "./Buttons/EmptyCircleButton";
import CheckCircle from "./Buttons/CheckCircle";
import Timer from "react-compound-timer";
import EditTaskButton from "./Buttons/EditTaskButton";

const TaskCard = (props) => {
  const { task, index, userData } = props;

  let pixels = determineTaskHeight(task);

  const renderToggleCircle = (task) => {
    if (task.status !== "complete" || !task.status) {
      return <EmptyCircle task={task} />;
    } else {
      return <CheckCircle task={task} />;
    }
  };

  const renderTaskText = (task) => {
    const mostRecent = determineMostRecentTimeEntry(task);

    const timeEntry = userData.timeEntries.find(
      (entry) => entry._id === mostRecent
    );

    // initial values
    let milliSecondsElapsed = 0;
    let actualHours = 0;
    let actualMinutes = 0;
    let actualSeconds = 0;

    if (mostRecent && timeEntry && task.actualTime > 0) {
      milliSecondsElapsed = task.actualTime * 1000;
      actualHours = Math.floor(task.actualTime / 3600);
      actualMinutes = Math.floor(task.actualTime / 60 - actualHours * 60);
      actualSeconds = task.actualTime - actualMinutes * 60 - actualHours * 3600;
    }

    if (actualHours.toString().length < 2) {
      actualHours = "0" + actualHours;
    }
    if (actualMinutes.toString().length < 2) {
      actualMinutes = "0" + actualMinutes;
    }
    if (actualSeconds.toString().length < 2) {
      actualSeconds = "0" + actualSeconds;
    }

    if (task.status !== "complete") {
      return (
        <React.Fragment>
          <div className='text'>
            <div className='task-title'>{task.text}</div>
          </div>
          <div className='tag'>
            <div className='icon'>
              <Tag />
            </div>
            <div className='tag-text'>{task.tag}</div>
          </div>
          <div className='colfill'></div>
          <div className='time'>
            Estimate: <strong>{task.estimatedTime} mins</strong>
          </div>
          <div className='time'>
            Measured:{" "}
            <strong>
              {renderActualTime(
                timeEntry,
                actualHours,
                actualMinutes,
                actualSeconds,
                milliSecondsElapsed
              )}
            </strong>
          </div>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <div className='text'>
            <div className='task-title completed'>{task.text}</div>
          </div>
          <div className='tag'>
            <div className='icon'>
              <Tag />
            </div>
            <div className='tag-text'>{task.tag}</div>
          </div>
          <div className='colfill'></div>
          <div className='time'>
            Estimate: <strong>{task.estimatedTime} mins</strong>
          </div>
          <div className='time'>
            Measured:{" "}
            <strong>
              {renderActualTime(
                timeEntry,
                actualHours,
                actualMinutes,
                actualSeconds,
                milliSecondsElapsed
              )}
            </strong>
          </div>
        </React.Fragment>
      );
    }
  };

  function determineMostRecentTimeEntry(task) {
    return task.timeEntries[task.timeEntries.length - 1];
  }

  const renderTimerButton = (task) => {
    // edge cases
    if (task.status === "complete") {
      return <div> </div>; // need an empty div for css grid
    }
    if (task.timeEntries.length === 0) {
      return <InactiveTimerButton task={task} />;
    }

    // grab the latest task time entry from the task and find its corresponding
    // entry in timeEntries
    const mostRecent = task.timeEntries[task.timeEntries.length - 1];
    const timeEntry = userData.timeEntries.find(
      (entry) => entry._id === mostRecent
    );

    if (timeEntry && timeEntry.active === true) {
      return <ActiveTimerButton timeEntry={timeEntry} task={task} />;
    } else {
      return <InactiveTimerButton task={task} timeEntry={timeEntry} />;
    }
  };

  return (
    <Draggable draggableId={task._id} key={task._id} index={index}>
      {(provided) => (
        <Task
          key={task._id}
          ref={provided.innerRef}
          status={task.status}
          height={pixels}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <div className='toggleButtonWrapper'>{renderToggleCircle(task)}</div>
          {renderTaskText(task)}
          <div className='options'>
            {renderTimerButton(task)}
            <EditTaskButton task={task} />
          </div>
        </Task>
      )}
    </Draggable>
  );

  function determineTaskHeight(task) {
    let pixels = 55; // default
    if (task.estimatedTime) {
      pixels = Math.ceil(task.estimatedTime * 2.7);
    }
    return pixels;
  }

  function renderActualTime(
    timeEntry,
    actualHours,
    actualMinutes,
    actualSeconds,
    milliSecondsElapsed
  ) {
    // console.log("milliSecondsElapsed is", milliSecondsElapsed);
    if (timeEntry && timeEntry.active && milliSecondsElapsed === 0) {
      return (
        <strong>
          <span className='red'>
            <Timer
              formatValue={(value) => `${value < 10 ? `0${value}` : value}`}>
              {({ timerState }) => (
                <React.Fragment>
                  <Timer.Hours />:
                  <Timer.Minutes />:
                  <Timer.Seconds />
                </React.Fragment>
              )}
            </Timer>
          </span>
        </strong>
      );
    } else if (timeEntry && timeEntry.active) {
      return (
        <strong>
          <span className='red'>
            <Timer
              initialTime={milliSecondsElapsed}
              formatValue={(value) => `${value < 10 ? `0${value}` : value}`}>
              {({ start, resume, pause, stop, reset, timerState }) => (
                <React.Fragment>
                  <Timer.Hours />:
                  <Timer.Minutes />:
                  <Timer.Seconds />
                </React.Fragment>
              )}
            </Timer>
          </span>
        </strong>
      );
    } else {
      return `${actualHours}:${actualMinutes}:${actualSeconds}`;
    }
  }
};

function mapStateToProps(state) {
  return {
    userData: state.userData,
  };
}

export default connect(mapStateToProps)(TaskCard);

const Task = styled.div`
  display: grid;
  grid-gap: 5px;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: 30px 20px 20px;
  align-items: top;
  margin-bottom: 10px;
  border: 0;
  border-radius: 4px;
  background: ${(props) => {
    if (props.status === "complete") {
      return props.theme.colors.offWhiteComplete;
    } else {
      return "#FCFEFF";
    }
  }};
  // box-shadow: 1px 4px 6px 0 rgba(100, 100, 100, 0.12);
  box-shadow: ${(props) => {
    if (props.status === "complete") {
      return "0 2px 5px 0 rgba(100, 100, 100, 0.15) inset;";
    } else {
      return "0 4px 5px 0 rgba(100, 100, 100, 0.15);";
    }
  }};
  padding: 10px;
  height: ${(props) => {
    if (props.height) {
      let str = props.height.toString();
      str += "px";
      return str;
    }
    return "55px";
  }};

  .colfill {
    grid-column: 1 / span 1;
    grid-row: 3;
  }

  .tag {
    grid-row: 2;
    grid-column: 2 / span 6;
    margin-left: -10px;
    width: 100%;
    display: grid;
    grid-template-columns: 30px auto;
    align-items: start;
    color: ${(props) => props.theme.colors.darkGray};
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    justify-self: center;

    .icon {
      grid-column: 1 / span 1;
    }
    .tag-text {
      grid-column: 2;
      margin-top: 2px;
      justify-self: start;
      margin-left: -5px;
      color: ${(props) => props.theme.colors.mediumGray};
    }

    strong {
      font-weight: 600;
    }

    svg {
      height: 20px;

      color: ${(props) => props.theme.colors.yellow};
    }
  }
  .time {
    grid-row: 3;
    grid-column: span 3;
    // text-align: center;
    color: ${(props) => props.theme.colors.mediumGray};
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    justify-items: center;

    strong {
      font-weight: 600;
      color: ${(props) => props.theme.colors.darkGray};
    }

    svg {
      height: 25px;
      width: 100%;
      color: ${(props) => props.theme.colors.yellow};
    }

    .red {
      color: #cf7a38;
    }
  }

  .text {
    grid-row: 1;
    grid-column: 2 / span 6;
    display: grid;
    margin-left: -10px;
    // padding: 10px 0;

    .task-title {
      margin: 5px 0;
      color: ${(props) => props.theme.colors.darkGray};
      font-size: ${(props) => props.theme.fontSizes.small};
      overflow: hidden;
      height: 18px;
    }
  }

  .completed {
    text-decoration: line-through;
  }

  .toggleButtonWrapper {
    grid-column: 1 / span 1;
    grid-row: 1;
    height: 25px;
    justify-self: center;
    align-self: center;
  }

  .options {
    grid-column: 8 / span 1;
    grid-row: 1;
    display: grid;
    grid-template-columns: 1;
    grid-template-rows: 30px;

    justify-items: end;

    button {
      grid-column: span 1;
      padding: 0;
      margin: 0;
      background-color: inherit;
      border: 0;
      outline: none;
      cursor: pointer;
      height: 25px;

      svg {
        height: 25px;
        width: 100%;
        color: ${(props) => {
          if (props.status === "complete") {
            return props.theme.colors.mediumGray;
          } else {
            return props.theme.colors.mediumGray;
          }
        }};
        &: hover {
          color: ${(props) => props.theme.colors.primaryBlue};
        }
      }
    }
    .running {
      svg {
        color: ${(props) => "darkred"};
        &: hover {
          color: ${(props) => props.theme.colors.darkBlue};
        }
      }
    }
  }
`;
