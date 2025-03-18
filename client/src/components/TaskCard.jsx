import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdKeyboardDoubleArrowUp,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { Edit, Plus, Calendar, Trash2, UserCircle, Clock } from "lucide-react";
import {
  useUpdateTaskMutation,
  useDeleteOrRestoreTaskMutation,
} from "../redux/slices/api/taskApiSlice";

const PRIORITY_STYLES = {
  high: {
    icon: <MdKeyboardDoubleArrowUp />,
    classes: "bg-red-100 text-red-800 border-red-200",
  },
  medium: {
    icon: <MdKeyboardArrowUp />,
    classes: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  low: {
    icon: <MdKeyboardArrowDown />,
    classes: "bg-green-100 text-green-800 border-green-200",
  },
};

const TaskCard = ({
  task,
  onDragStart,
  onEdit,
  onAddSubtask,
  onTaskUpdate,
}) => {
  const navigate = useNavigate();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteOrRestoreTaskMutation();
  const [showCalendar, setShowCalendar] = useState(false);
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [hovered, setHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNavigate = () => {
    navigate(`/task/${task._id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (confirmDelete) {
      try {
        await deleteTask({ id: task._id, actionType: "delete" });
        // Success animation handled by optimistic UI update
      } catch (error) {
        console.error("Failed to delete task:", error);
        setIsDeleting(false);
      }
    } else {
      setIsDeleting(false);
    }
  };

  const handleDateChange = async (event) => {
    event.stopPropagation();
    const newDate = event.target.value;
    setDueDate(newDate);

    try {
      await updateTask({ id: task._id, data: { dueDate: newDate } });

      // Call the onTaskUpdate function from props to notify parent
      if (onTaskUpdate) {
        onTaskUpdate(task._id, { ...task, dueDate: newDate });
      }

      // Close the calendar after successful update with a slight delay for better UX
      setTimeout(() => {
        setShowCalendar(false);
      }, 300);
    } catch (error) {
      console.error("Failed to update due date:", error);
      // Revert to original date on error
      setDueDate(task?.dueDate || "");
    }
  };

  const isPastDue = (dateString) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    return dueDate < today;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const priorityStyle = task.priority ? PRIORITY_STYLES[task.priority] : null;

  return (
    <div
      className={`task-card bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 ${
        isDeleting ? "opacity-50 scale-95" : hovered ? "shadow-md" : ""
      }`}
      draggable="true"
      onDragStart={(e) => onDragStart(e, task)}
      data-task-id={task._id}
      onClick={handleNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-800">{task.title}</h3>
        <div
          className={`flex gap-2 ${
            hovered ? "opacity-100" : "opacity-0"
          } transition-opacity duration-200`}
        >
          {/* Edit Task Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Edit Task"
          >
            <Edit size={16} className="text-gray-500 hover:text-blue-600" />
          </button>

          {/* Add Subtask Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddSubtask(task);
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Add Subtask"
          >
            <Plus size={16} className="text-gray-500 hover:text-blue-600" />
          </button>

          {/* Set Due Date */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCalendar(!showCalendar);
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Set Due Date"
          >
            <Calendar size={16} className="text-gray-500 hover:text-blue-600" />
          </button>

          {/* Delete Task Button */}
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 rounded-full transition-colors"
            title="Delete Task"
          >
            <Trash2 size={16} className="text-red-500 hover:text-red-700" />
          </button>
        </div>
      </div>

      {/* Display Due Date Picker */}
      {showCalendar && (
        <div className="mb-3 bg-blue-50 p-2 rounded-md border border-blue-200 animate-fadeIn">
          <label className="block text-xs text-blue-700 mb-1 font-medium">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={handleDateChange}
            className="block w-full p-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Display Assigned User Profile */}
      {task.assignedTo && (
        <div className="flex items-center mt-2 mb-2 gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
          <UserCircle size={18} className="text-blue-500" />
          <span>{task.assignedTo.split("@")[0]}</span>
        </div>
      )}

      {/* Task Details */}
      {task.items && task.items.length > 0 && (
        <div className="text-sm text-gray-600 mt-3 space-y-1">
          {task.items
            .filter((item) => !item.startsWith("@"))
            .map((item, idx) => (
              <div key={idx} className="pl-2 border-l-2 border-gray-200">
                {item}
              </div>
            ))}
        </div>
      )}

      {/* Display Task Priority and Due Date */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        {/* Priority Tag */}
        {priorityStyle && (
          <div
            className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md border ${priorityStyle.classes}`}
          >
            {priorityStyle.icon}
            <span>{task.priority}</span>
          </div>
        )}

        {/* Due Date Display */}
        {task.dueDate && (
          <div
            className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${
              isPastDue(task.dueDate)
                ? "bg-red-100 text-red-800 border border-red-200 font-medium"
                : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
          >
            <Calendar size={12} />
            {formatDate(task.dueDate)}
            {isPastDue(task.dueDate) && (
              <span className="ml-1 font-bold">• Past Due</span>
            )}
          </div>
        )}
        {/* Keep the remind date if it exists */}
        {task.remindOnDate && (
          <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {new Date(task.remindOnDate).toDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
