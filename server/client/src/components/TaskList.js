import React from "react";
import styled from "styled-components";
import {
  getTasks,
  editTask,
  startTimer,
  stopTimer,
  sendTaskBoxes,
  getTaskBoxes,
  addBox,
} from "../actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import uuid from "react-uuid";
import PlayIcon from "../assets/PlayIcon";
import PauseIcon from "../assets/PauseIcon";
import PencilAltIcon from "../assets/PencilAltIcon";
import CheckCircleIcon from "../assets/CheckCircleIcon";
import EmptyCircleIcon from "../assets/emptycircle.png";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import _ from "lodash";

// import { Overlay } from "react-portal-overlay";

const Button = styled.button`
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  margin: 0.5rem;
  padding: 0.5rem;
  color: #000;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 3px;
  font-size: 1rem;
  cursor: pointer;
`;

const ButtonText = styled.div`
  margin: 0 1rem;
`;

const List = styled.div`
  border: 1px ${(props) => (props.isDraggingOver ? "dashed #000" : "solid #ddd")};
  background: #fff;
  padding: 0.5rem 0.5rem 0;
  border-radius: 3px;
  flex: 0 0 150px;
  font-family: sans-serif;
`;
const Container = styled(List)`
  margin: 0.5rem 0.5rem 1.5rem;
  background: #ccc;
`;

const StyledAgendaContainer = styled.div`
  grid-column: 3 / span 4;
  @media (max-width: 800px) {
    grid-column: 2 / span 10;
  }
`;

const StyledTaskContainer = styled.div`
  grid-column: 7 / span 4;
  @media (max-width: 800px) {
    grid-column: 2 / span 10;
  }
`;

const Task = styled.div`
  display: grid;
  grid-gap: 10px;

  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: 40px auto;
  background-color: white;
  margin-bottom: 5px;
  border: 0;
  border-radius: 4px;
  min-height: 40px; // 20 pixels per 10 minutes, including padding
  background-color: white;
  box-shadow: 0 4px 6px 0 rgba(100, 100, 100, 0.15);
  padding: 10px;

  .text {
    grid-column: 2 / span 6;
    margin-left: -10px;
    padding: 10px 0;
    color: gray;
    align-self: center;
  }

  .completed {
    text-decoration: line-through;
  }

  button {
    grid-column: span 1;
    padding: 0;
    margin: 0;
    background-color: inherit;
    border: 0;
    outline: none;
    cursor: pointer;
    height: 25px;
    align-self: center;

    img {
      height: 100%;
      opacity: 0.1;

      &: hover {
        opacity: 0.5;
      }
    }
    svg {
      height: 25px;
      width: 100%;
      color: lightgray;
      &: hover {
        color: ${(props) => props.theme.colors.primaryBlue};
      }
    }
  }

  .options {
    grid-column: 8 / span 1;
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
        color: lightgray;
        &: hover {
          color: ${(props) => props.theme.colors.primaryBlue};
        }
      }
    }
    .running {
      svg {
        color: ${(props) => props.theme.colors.primaryBlue};
        &: hover {
          color: lightgray;
        }
      }
    }
  }
`;

class TaskList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editingOpen: false,
      userData: null,
      boxesMounted: false,
      boxes: { allTasks: { taskIds: [] } },
    };

    this.renderTaskCards = this.renderTaskCards.bind(this);
    this.handleTaskToggle = this.handleTaskToggle.bind(this);
    this.renderToggleCircle = this.renderToggleCircle.bind(this);
  }

  addBox = (e) => {
    // we need to modify the lists in userData
    e.preventDefault();
    console.log("clicked");
    const randomTitle = uuid();
    this.props.addBox(this.props.userId, randomTitle);
  };

  componentDidUpdate(prevProps, prevState) {
    // make our boxes from our data store
    console.log("this.props.task is", this.props.task);
    if (
      this.props.userId !== prevProps.userId ||
      this.props.task !== prevProps.task ||
      this.props.timer !== prevProps.timer
      // this.props.userData.tasks !== prevProps.userData.tasks
    ) {
      this.props.getTasks(this.props.userId);
      this.props.getTaskBoxes(this.props.userId);
    }

    if (prevProps.boxes !== this.props.boxes) {
      this.setState({ boxes: this.props.boxes });
    }
  }

  handleTaskToggle(taskId, status) {
    // use the taskId to send a post request via redux store
    this.props.editTask(taskId, { status });
  }

  renderToggleCircle(task) {
    if (task.status != "complete" || !task.status) {
      return (
        <button
          onClick={(e) => {
            this.handleTaskToggle(task._id, "complete");
          }}>
          <img src={EmptyCircleIcon} />
        </button>
      );
    } else {
      return (
        <button
          onClick={(e) => {
            this.handleTaskToggle(task._id, "incomplete");
          }}>
          <CheckCircleIcon />
        </button>
      );
    }
  }

  renderTaskText(task) {
    if (task.status != "complete" || !task.status) {
      return <div className='text'>{task.text}</div>;
    } else {
      return <div className='text completed'>{task.text}</div>;
    }
  }

  renderTimerButton(task) {
    // edge cases
    if (task.status === "complete") {
      return <div> </div>; // need an empty div for css grid
    }
    if (task.timeEntries.length === 0) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            this.props.startTimer(task._id, this.props.userId);
          }}>
          <PlayIcon />
        </button>
      );
    }

    // grab the latest task time entry to do our check
    const mostRecent = task.timeEntries[task.timeEntries.length - 1];

    // find the time entry that most recent entry
    // don't use task, as there may be multiple entries per task
    const timeEntry = this.props.userData.timeEntries.find((entry) => entry._id === mostRecent);
    // error handling, in case people are clicking too fast

    if (timeEntry.active) {
      // if it's running
      return (
        <button
          className='running'
          onClick={(e) => {
            e.preventDefault();
            this.props.stopTimer(timeEntry._id, this.props.userId);
          }}>
          <PauseIcon />
        </button>
      );
    } else {
      // if it is inactive (not running)
      return (
        <button
          onClick={(e) => {
            e.preventDefault();
            this.props.startTimer(task._id, this.props.userId);
          }}>
          <PlayIcon />
        </button>
      );
    }
  }

  renderTaskCards() {
    if (
      this.state.boxes.hasOwnProperty("allTasks") &&
      this.props.userData.hasOwnProperty("tasks")
    ) {
      return this.state.boxes.allTasks.taskIds.map((taskIdFromBox, index) => {
        const task = this.props.userData.tasks.find((task) => taskIdFromBox === task._id);

        if (!task) {
          return null;
        }

        return (
          <Draggable draggableId={task._id} key={task._id} index={index}>
            {(provided) => (
              <Task
                key={task._id}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}>
                {this.renderToggleCircle(task)}
                {this.renderTaskText(task)}
                <div className='options'>
                  {this.renderTimerButton(task)}
                  <button onClick={this.handleEditClick}>
                    <PencilAltIcon />
                  </button>
                </div>
              </Task>
            )}
          </Draggable>
        );
      });
    }
  }

  renderAgendaBoxes() {
    if (
      this.state.boxes.hasOwnProperty("allTasks") &&
      this.props.userData.hasOwnProperty("tasks")
    ) {
      return this.state.boxes.allTasks.taskIds.map((taskIdFromBox, index) => {
        const task = this.props.userData.tasks.find((task) => taskIdFromBox === task._id);

        if (!task) {
          return null;
        }

        return (
          <Draggable key={task._id} draggableId={task._id} index={index}>
            {(provided) => (
              <Task
                key={task._id}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}>
                {this.renderToggleCircle(task)}
                {this.renderTaskText(task)}
                <div className='options'>
                  {this.renderTimerButton(task)}
                  <button onClick={this.handleEditClick}>
                    <PencilAltIcon />
                  </button>
                </div>
              </Task>
            )}
          </Draggable>
        );
      });
    }
  }

  onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // edge cases
    if (!destination) {
      return;
    }

    // in case the user dropped it back into its position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    console.log("source is ", source);
    console.log("destination is ", destination);
    console.log("draggableId is ", draggableId);
    console.log("this.state.boxes is", this.state.boxes);
    console.log("box is", this.state.boxes[source.droppableId]);

    const box = _.cloneDeep(this.state.boxes[source.droppableId]);
    const newTasks = Array.from(box.taskIds);
    newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, draggableId);
    const newBox = { ...box, taskIds: newTasks };

    console.log("newBox is", newBox);

    const newState = {
      ...this.state,
      boxes: { ...this.state.boxes, [newBox.title]: newBox },
    };
    console.log("newState is", newState);

    this.setState(newState);
    console.log("starting 2s wait, the local state should render the drag and drop correctly");
    await new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
    console.log("done waiting");
    this.props.sendTaskBoxes(this.props.userId, newState.boxes);

    // we need to call an endpoint to update the server that a reorder has occurred
  };

  render() {
    console.log("Props upon render is", this.props);
    return (
      <React.Fragment>
        <Button onClick={this.addBox}>
          <svg width='24' height='24' viewBox='0 0 24 24'>
            <path fill='currentColor' d='M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z' />
          </svg>
          <ButtonText>Add List</ButtonText>
        </Button>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId={"allTasks"}>
            {(provided) => (
              <StyledTaskContainer ref={provided.innerRef}>
                {this.renderTaskCards()}
                {provided.placeholder}
              </StyledTaskContainer>
            )}
          </Droppable>
          {/* filter the object to everything but allTasks before mapping*/}
          {console.log("this.props.boxes is", this.props.boxes)}
          {this.props.boxes.hasOwnProperty("allTasks") &&
          this.props.userData.hasOwnProperty("tasks")
            ? Object.keys(this.props.boxes)
                .filter((box) => box != "allTasks")
                .map((boxTitle, i) => {
                  console.log("==> list", boxTitle);

                  return (
                    <Droppable key={boxTitle} droppableId={boxTitle}>
                      {(provided) => (
                        <Container ref={provided.innerRef}>
                          {this.props.boxes[boxTitle].taskIds.length
                            ? this.props[boxTitle].taskIds.map((task, index) => (
                                <Draggable key={task._id} draggableId={task._id} index={index}>
                                  {(provided) => (
                                    <Task
                                      key={task._id}
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}>
                                      {this.renderToggleCircle(task)}
                                      {this.renderTaskText(task)}
                                      <div className='options'>
                                        {this.renderTimerButton(task)}
                                        <button onClick={this.handleEditClick}>
                                          <PencilAltIcon />
                                        </button>
                                      </div>
                                    </Task>
                                  )}
                                </Draggable>
                              ))
                            : !provided.placeholder}
                          {provided.placeholder}
                        </Container>
                      )}
                    </Droppable>
                  );
                })
            : console.log("hi")}
        </DragDropContext>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  console.log("state being mapped to props in tasklist is is", state);
  return {
    userId: state.user._id,
    userData: state.userData,
    task: state.task,
    timer: state.timer,
    boxes: state.boxes,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { getTasks, editTask, startTimer, stopTimer, sendTaskBoxes, getTaskBoxes, addBox },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);
