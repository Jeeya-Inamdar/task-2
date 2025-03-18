import React, { useState } from "react";
import { BiMessageAltDetail } from "react-icons/bi";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import { toast } from "sonner";
import { BGS, PRIORITYSTYLES, TASK_TYPE, formatDate } from "../../utils";
import clsx from "clsx";
import { FaList } from "react-icons/fa";
import UserInfo from "../UserInfo";
import Button from "../Button";
import ConfirmatioDialog from "../Dialogs";
import { useDeleteOrRestoreTaskMutation } from "../../redux/slices/api/taskApiSlice";
import AddTask from "./AddTask";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Table = ({ tasks, availableStages, refetch }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  // RTK Query hook for delete operation
  const [deleteOrRestoreTask, { isLoading: isDeleting }] =
    useDeleteOrRestoreTaskMutation();

  const deleteClicks = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  const deleteHandler = () => {
    if (selected) {
      deleteOrRestoreTask({ id: selected, actionType: "delete" })
        .unwrap()
        .then(() => {
          toast.success("Task deleted successfully");
          setOpenDialog(false);
          setSelected(null);
          refetch();
        })
        .catch((error) => {
          toast.error(error?.data?.message || "Failed to delete task");
        });
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setOpenEditModal(true);
  };

  const TableHeader = () => (
    <thead className="w-full bg-gray-100 border-b border-gray-300 sticky top-0">
      <tr className="w-full text-gray-700 text-left">
        <th className="py-3 px-4 font-semibold">Task Title</th>
        <th className="py-3 px-4 font-semibold">Priority</th>
        <th className="py-3 px-4 font-semibold">Created At</th>
        <th className="py-3 px-4 font-semibold">Assets</th>
        <th className="py-3 px-4 font-semibold">Team</th>
        <th className="py-3 px-4 text-right font-semibold">Actions</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div
            className={clsx("w-3 h-3 rounded-full", TASK_TYPE[task.stage])}
          />
          <p className="w-full line-clamp-2 text-base text-gray-800 font-medium">
            {task?.title}
          </p>
        </div>
      </td>

      <td className="py-3 px-4">
        <div className="flex gap-1 items-center px-2 py-1 rounded-full bg-gray-100 w-fit">
          <span className={clsx("text-lg", PRIORITYSTYLES[task?.priority])}>
            {ICONS[task?.priority]}
          </span>
          <span className="capitalize text-sm font-medium">
            {task?.priority}
          </span>
        </div>
      </td>

      <td className="py-3 px-4">
        <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
          {formatDate(new Date(task?.createdAt || task?.date))}
        </span>
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 items-center text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
            <BiMessageAltDetail className="text-blue-500" />
            <span>{task?.activities?.length || 0}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
            <MdAttachFile className="text-green-500" />
            <span>{task?.assets?.length || 0}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
            <FaList className="text-orange-500" />
            <span>
              {task?.subTasks?.filter((st) => st.completed).length || 0}/
              {task?.subTasks?.length || 0}
            </span>
          </div>
        </div>
      </td>

      <td className="py-3 px-4">
        <div className="flex -space-x-2">
          {task?.team?.map((m, index) => (
            <div
              key={m._id}
              className={clsx(
                "w-8 h-8 rounded-full text-white flex items-center justify-center text-sm border-2 border-white",
                BGS[index % BGS?.length]
              )}
              title={m.name || m.email}
            >
              <UserInfo user={m} />
            </div>
          ))}
        </div>
      </td>

      <td className="py-3 px-4">
        <div className="flex gap-2 justify-end">
          <button
            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors"
            onClick={() => handleEditTask(task)}
            disabled={isDeleting && selected === task._id}
            title="Edit Task"
          >
            <MdEdit size={18} />
          </button>

          <button
            className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
            onClick={() => deleteClicks(task._id)}
            disabled={isDeleting && selected === task._id}
            title="Delete Task"
          >
            <MdDelete size={18} />
          </button>
        </div>
      </td>
    </tr>
  );

  const EmptyState = () => (
    <tr>
      <td colSpan={6} className="py-8 text-center text-gray-500">
        <div className="flex flex-col items-center">
          <FaList className="text-gray-400 text-4xl mb-2" />
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm">Create a new task to get started</p>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <div className="bg-white px-4 pt-4 pb-4 shadow-md rounded overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full border-collapse">
            <TableHeader />
            <tbody>
              {tasks && tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <TableRow key={task._id || index} task={task} />
                ))
              ) : (
                <EmptyState />
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
        isLoading={isDeleting}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
      />

      {/* Edit Task Modal */}
      <AddTask
        open={openEditModal}
        setOpen={setOpenEditModal}
        task={editingTask}
        availableStages={availableStages}
        onSuccess={() => {
          setOpenEditModal(false);
          setEditingTask(null);
          refetch();
        }}
      />
    </>
  );
};

export default Table;
