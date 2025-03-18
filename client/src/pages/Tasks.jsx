import React, { useState, useEffect, useMemo } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import { Plus, Trash2, RotateCcw, RotateCw, Layout } from "lucide-react";
import {
  useGetAllTasksQuery,
  useUpdateTaskMutation,
  useDeleteOrRestoreTaskMutation,
} from "../redux/slices/api/taskApiSlice";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import Tabs from "../components/Tabs";
import AddTask from "../components/task/AddTask";
import Table from "../components/task/Table";
import AddSubTask from "../components/task/AddSubTask";
import TaskCard from "../components/TaskCard";
import AddStageForm from "../components/AddStageForm";

// Tab configuration
const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

// Colors for stages
const STAGE_COLORS = {
  blue: "bg-blue-500 hover:bg-blue-600 border-blue-600",
  green: "bg-emerald-500 hover:bg-emerald-600 border-emerald-600",
  orange: "bg-amber-500 hover:bg-amber-600 border-amber-600",
  purple: "bg-purple-500 hover:bg-purple-600 border-purple-600",
  red: "bg-rose-500 hover:bg-rose-600 border-rose-600",
  teal: "bg-teal-500 hover:bg-teal-600 border-teal-600",
  indigo: "bg-indigo-500 hover:bg-indigo-600 border-indigo-600",
};

// Format tasks for display
const formatTasksForDisplay = (tasks) => {
  return tasks.map((task) => ({
    _id: task._id,
    title: task.title,
    stage: task.stage,
    dueDate: task.dueDate,
    remindonDate: task.remindonDate,
    isSelected: false,
    priority: task.priority,
    createdAt: task.createdAt,
    assignedTo: task.assignedTo,
    description: task.description,
    subtasks: task.subtasks,
    items: [
      task.assignedTo ? `@${task.assignedTo.split("@")[0]}` : "",
      ...(task.description ? [task.description] : []),
      ...(task.subtasks ? task.subtasks.map((st) => st.title) : []),
    ].filter(Boolean),
  }));
};

const Tasks = () => {
  const params = useParams();
  const navigate = useNavigate();

  // State
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [subTaskOpen, setSubTaskOpen] = useState(false);
  const [addTaskStatus, setAddTaskStatus] = useState("");
  const [draggingTask, setDraggingTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropTarget, setDropTarget] = useState(null);

  // Custom stages state
  const [stages, setStages] = useState([
    { id: "todo", name: "TO DO", color: "blue" },
    { id: "in-progress", name: "IN PROGRESS", color: "orange" },
    { id: "completed", name: "COMPLETE", color: "green" },
  ]);
  const [showAddStageForm, setShowAddStageForm] = useState(false);

  // API hooks
  const { data, isLoading, refetch } = useGetAllTasksQuery({
    stage: params.status,
    isTrashed: "",
    viewType: "",
  });

  const [updateTask] = useUpdateTaskMutation();

  // Memoized values
  const allTasks = useMemo(
    () => formatTasksForDisplay(data?.tasks || []),
    [data]
  );

  // Group tasks by stage
  const tasksByStage = useMemo(() => {
    const result = {};

    // Initialize with empty arrays for all stages
    stages.forEach((stage) => {
      result[stage.id.replace(/-/g, " ")] = [];
    });

    // Fill with tasks
    allTasks.forEach((task) => {
      const stageKey = task.stage.toLowerCase();
      if (result[stageKey]) {
        result[stageKey].push(task);
      } else {
        // If the stage doesn't exist in our stages list, add the task to the first stage
        const firstStageKey = stages[0]?.id.replace(/-/g, " ");
        if (firstStageKey && result[firstStageKey]) {
          result[firstStageKey].push({ ...task, stage: firstStageKey });
        }
      }
    });

    return result;
  }, [allTasks, stages]);

  // Drag and drop handlers
  const onDragStart = (e, task) => {
    e.dataTransfer.setData("text/plain", task._id);
    setIsDragging(true);
    setDraggingTask(task);

    // Create a ghost image for drag
    const ghostElement = document.createElement("div");
    ghostElement.classList.add("ghost-card");
    ghostElement.innerHTML = `<div class="p-2 bg-white rounded shadow border border-blue-500">${task.title}</div>`;
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 20, 20);

    // Remove the ghost element after it's no longer needed
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);

    // Add dragging class to original element
    setTimeout(() => {
      const element = document.querySelector(`[data-task-id="${task._id}"]`);
      if (element) {
        element.classList.add("opacity-50", "scale-95");
      }
    }, 0);
  };

  const onDragEnd = (e) => {
    setIsDragging(false);
    setDraggingTask(null);
    setDropTarget(null);

    document.querySelectorAll(".task-card").forEach((card) => {
      card.classList.remove("opacity-50", "scale-95");
    });

    document.querySelectorAll(".drop-zone").forEach((zone) => {
      zone.classList.remove("bg-blue-50", "border-blue-400", "border-dashed");
    });
  };

  const onDragOver = (e, stage) => {
    e.preventDefault();

    if (isDragging) {
      setDropTarget(stage);
      document.querySelectorAll(".drop-zone").forEach((zone) => {
        if (zone.getAttribute("data-stage") === stage) {
          zone.classList.add("bg-blue-50", "border-blue-400", "border-dashed");
        } else {
          zone.classList.remove(
            "bg-blue-50",
            "border-blue-400",
            "border-dashed"
          );
        }
      });
    }
  };

  const onDragLeave = (e) => {
    if (e.currentTarget && !e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove(
        "bg-blue-50",
        "border-blue-400",
        "border-dashed"
      );
      setDropTarget(null);
    }
  };

  const onDrop = async (e, newStage) => {
    e.preventDefault();

    const taskId = e.dataTransfer.getData("text/plain");

    if (!taskId) {
      console.error("No task ID found in drop data");
      return;
    }

    const taskToUpdate = allTasks.find((task) => task._id === taskId);
    if (!taskToUpdate) {
      console.error("Task not found:", taskId);
      return;
    }

    if (taskToUpdate.stage === newStage) {
      return;
    }

    try {
      // Show optimistic UI update
      const dropZone = document.querySelector(`[data-stage="${newStage}"]`);
      if (dropZone) {
        dropZone.classList.add("bg-green-50", "border-green-500");
        setTimeout(() => {
          dropZone.classList.remove("bg-green-50", "border-green-500");
        }, 500);
      }

      await updateTask({
        id: taskId,
        data: { stage: newStage },
      }).unwrap();

      refetch();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsDragging(false);
      setDraggingTask(null);
      setDropTarget(null);

      document.querySelectorAll(".drop-zone").forEach((zone) => {
        zone.classList.remove("bg-blue-50", "border-blue-400", "border-dashed");
      });
    }
  };

  const handleAddTask = (status) => {
    setAddTaskStatus(status);
    setOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setOpen(true);
  };

  const handleAddSubtask = (task) => {
    setSelectedTaskId(task._id);
    setSubTaskOpen(true);
  };

  const handleTaskUpdate = (taskId, updatedTask) => {
    refetch();
  };

  const handleAddStage = (newStage) => {
    setStages([...stages, newStage]);
    setShowAddStageForm(false);

    // Store the updated stages in localStorage to persist them
    localStorage.setItem("taskStages", JSON.stringify([...stages, newStage]));
  };

  const handleRemoveStage = (stageId) => {
    // Don't allow removing if it's one of the last two stages
    if (stages.length <= 2) {
      alert("You must have at least two stages in your workflow.");
      return;
    }

    // Find all tasks in this stage
    const tasksInStage = allTasks.filter(
      (task) => task.stage === stageId.replace(/-/g, " ")
    );

    // If there are tasks, confirm deletion and determine where to move them
    if (tasksInStage.length > 0) {
      const confirmDelete = window.confirm(
        `This stage contains ${tasksInStage.length} tasks. Removing it will move all tasks to the first stage. Continue?`
      );

      if (!confirmDelete) return;

      // Move tasks to the first available stage (that's not being deleted)
      const targetStage =
        stages.find((s) => s.id !== stageId)?.id.replace(/-/g, " ") || "todo";

      // Update all tasks in this stage
      Promise.all(
        tasksInStage.map((task) =>
          updateTask({
            id: task._id,
            data: { stage: targetStage },
          }).unwrap()
        )
      )
        .then(() => {
          console.log(`Moved ${tasksInStage.length} tasks to ${targetStage}`);
          refetch();
        })
        .catch((error) => {
          console.error("Failed to move tasks:", error);
        });
    }

    // Remove the stage
    const updatedStages = stages.filter((stage) => stage.id !== stageId);
    setStages(updatedStages);

    // Store the updated stages in localStorage
    localStorage.setItem("taskStages", JSON.stringify(updatedStages));
  };

  // Load saved stages on component mount
  useEffect(() => {
    const savedStages = localStorage.getItem("taskStages");
    if (savedStages) {
      try {
        setStages(JSON.parse(savedStages));
      } catch (error) {
        console.error("Failed to parse saved stages:", error);
      }
    }
  }, []);

  // Event listener setup and cleanup
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setIsDragging(false);
      setDraggingTask(null);
      setDropTarget(null);

      document.querySelectorAll(".task-card").forEach((card) => {
        card.classList.remove("opacity-50", "scale-95");
      });

      document.querySelectorAll(".drop-zone").forEach((zone) => {
        zone.classList.remove("bg-blue-50", "border-blue-400", "border-dashed");
      });
    };

    document.addEventListener("dragend", handleGlobalDragEnd);

    return () => {
      document.removeEventListener("dragend", handleGlobalDragEnd);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Layout className="text-blue-600 mr-2" size={24} />
          <Title
            title={params.status ? `${params.status} Tasks` : "Tasks"}
            className="text-2xl text-gray-800"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleAddTask("todo")}
            label="Add Task"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 transition-all duration-300 shadow-sm hover:shadow"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-6 flex items-center gap-4">
        <button
          className="px-3 py-1.5 rounded-md bg-white border border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-1 shadow-sm"
          onClick={() => navigate(-1)}
        >
          <RotateCcw size={16} />
          <span>Undo</span>
        </button>
        <button
          className="px-3 py-1.5 rounded-md bg-white border border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-1 shadow-sm"
          onClick={() => navigate(1)}
        >
          <RotateCw size={16} />
          <span>Redo</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <Tabs tabs={TABS} setSelected={setSelected}>
          {selected === 0 ? (
            <div className="p-4">
              {/* Board view with stages */}
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Workflow Stages
                </h2>
                {!showAddStageForm && (
                  <button
                    onClick={() => setShowAddStageForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus size={18} />
                    <span>Add Stage</span>
                  </button>
                )}
              </div>

              {showAddStageForm && (
                <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200 animate-fadeIn">
                  <AddStageForm
                    onAddStage={handleAddStage}
                    onCancel={() => setShowAddStageForm(false)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stages.map((stage) => {
                  const stageKey = stage.id.replace(/-/g, " ");
                  const stageTasks = tasksByStage[stageKey] || [];
                  const colorClass =
                    STAGE_COLORS[stage.color] || STAGE_COLORS.blue;
                  const isTargeted = dropTarget === stageKey;

                  return (
                    <div
                      key={stage.id}
                      className={`flex-1 flex flex-col transition-all duration-300 ${
                        isTargeted ? "scale-102" : ""
                      }`}
                    >
                      <div
                        className={`${colorClass} rounded-t-lg px-4 py-3 flex justify-between items-center transition-colors shadow-sm`}
                      >
                        <h2 className="text-lg font-bold text-white">
                          {stage.name}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="bg-white text-blue-700 rounded-full px-2 py-0.5 text-sm font-bold shadow-sm">
                            {stageTasks.length}
                          </span>
                          {stages.length > 2 && (
                            <button
                              onClick={() => handleRemoveStage(stage.id)}
                              className="text-white hover:text-red-200 transition-colors"
                              title="Remove Stage"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div
                        data-stage={stageKey}
                        className={`drop-zone flex-1 min-h-64 border-2 border-gray-200 rounded-b-lg p-3 bg-white transition-all duration-200 ${
                          isTargeted
                            ? "border-blue-400 border-dashed bg-blue-50"
                            : ""
                        }`}
                        onDragOver={(e) => onDragOver(e, stageKey)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => onDrop(e, stageKey)}
                      >
                        {stageTasks.length > 0 ? (
                          <div className="space-y-3">
                            {stageTasks.map((task) => (
                              <TaskCard
                                key={task._id}
                                task={task}
                                onDragStart={onDragStart}
                                onEdit={handleEditTask}
                                onAddSubtask={handleAddSubtask}
                                onTaskUpdate={handleTaskUpdate}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <button
                              onClick={() => handleAddTask(stageKey)}
                              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-all"
                            >
                              <Plus size={18} />
                              <span>Add Task</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <Table
                tasks={data?.tasks}
                availableStages={stages.map((s) => ({
                  value: s.id.replace(/-/g, " "),
                  label: s.name,
                }))}
                refetch={refetch}
              />
            </div>
          )}
        </Tabs>
      </div>

      {/* Add/Edit Task modal */}
      <AddTask
        open={open}
        setOpen={setOpen}
        initialStatus={addTaskStatus}
        task={editingTask}
        // Pass available stages to the task form
        availableStages={stages.map((s) => ({
          value: s.id.replace(/-/g, " "),
          label: s.name,
        }))}
        onSuccess={() => {
          setOpen(false);
          setEditingTask(null);
          refetch();
        }}
      />

      {/* AddSubTask modal */}
      <AddSubTask
        open={subTaskOpen}
        setOpen={setSubTaskOpen}
        id={selectedTaskId}
        onSuccess={() => {
          setSubTaskOpen(false);
          setSelectedTaskId(null);
          refetch();
        }}
      />

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        .scale-95 {
          transform: scale(0.95);
        }

        .scale-102 {
          transform: scale(1.02);
        }

        .task-card {
          transition: all 0.2s ease-in-out;
        }

        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .ghost-card {
          position: absolute;
          top: -1000px;
          left: -1000px;
          z-index: 9999;
        }
      `}</style>
    </div>
  );
};

export default Tasks;
