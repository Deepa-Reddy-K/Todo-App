import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";
import "./App.css";

const initialColumns = {
  todo: [],
  inProgress: [],
  done: []
};

const App = () => {
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : initialColumns;
  });

  const [input, setInput] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("todo");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(columns));
  }, [columns]);

  const addTask = () => {
    if (!input.trim()) return;
    const newTask = { id: Date.now().toString(), text: input, completed: false };
    setColumns(prev => ({
      ...prev,
      [selectedColumn]: [...prev[selectedColumn], newTask]
    }));
    setInput("");
  };

  const editTask = (col, id, newText) => {
    setColumns(prev => ({
      ...prev,
      [col]: prev[col].map(task =>
        task.id === id ? { ...task, text: newText } : task
      )
    }));
  };

  const deleteTask = (col, id) => {
    setColumns(prev => ({
      ...prev,
      [col]: prev[col].filter(task => task.id !== id)
    }));
  };

  const toggleComplete = (col, id) => {
    setColumns(prev => ({
      ...prev,
      [col]: prev[col].map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // If dropped in the same column
    if (source.droppableId === destination.droppableId) {
      const column = columns[source.droppableId];
      const reorderedTasks = Array.from(column);
      const [movedTask] = reorderedTasks.splice(source.index, 1);
      reorderedTasks.splice(destination.index, 0, movedTask);

      setColumns(prev => ({
        ...prev,
        [source.droppableId]: reorderedTasks
      }));
    } else {
      // Moving to a different column
      const sourceTasks = Array.from(columns[source.droppableId]);
      const destTasks = Array.from(columns[destination.droppableId]);
      const [movedTask] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, movedTask);

      setColumns(prev => ({
        ...prev,
        [source.droppableId]: sourceTasks,
        [destination.droppableId]: destTasks
      }));
    }
  };

  return (
    <div className="app">
      <h1>Todo Board</h1>

      {/* Input Section */}
      <div className="task-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Task"
        />

        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
        >
          <option value="todo">Todo</option>
          <option value="inProgress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <button onClick={addTask}>Add Task</button>
      </div>

      {/* Board with Drag & Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {Object.entries(columns).map(([colId, tasks]) => (
            <Droppable key={colId} droppableId={colId}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>
                    {colId} <span>({tasks.length})</span>
                  </h2>
                  {tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="task"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleComplete(colId, task.id)}
                          />
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              editTask(colId, task.id, e.target.textContent)
                            }
                          >
                            {task.text}
                          </span>
                          <button onClick={() => deleteTask(colId, task.id)}>
                            x
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default App;
