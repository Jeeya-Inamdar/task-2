import React, { useState } from "react"; // Import React and useState for state management

const AddStageForm = ({ onAddStage, onCancel }) => {
  const [stageName, setStageName] = useState("");
  const [color, setColor] = useState("blue");

  const colorOptions = [
    { name: "Blue", value: "blue", class: "bg-blue-500" },
    { name: "Orange", value: "orange", class: "bg-orange-500" },
    { name: "Green", value: "green", class: "bg-green-500" },
    { name: "Red", value: "red", class: "bg-red-500" },
    { name: "Purple", value: "purple", class: "bg-purple-500" },
    { name: "Teal", value: "teal", class: "bg-teal-500" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (stageName.trim()) {
      onAddStage({
        id: stageName.toLowerCase().replace(/\s+/g, "-"),
        name: stageName,
        color,
      });
      setStageName("");
      setColor("blue");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-md shadow border border-gray-200"
    >
      <h3 className="font-bold text-lg mb-4">Add New Stage</h3>

      <div className="mb-4">
        <label htmlFor="stageName" className="block mb-1 font-medium">
          Stage Name
        </label>
        <input
          id="stageName"
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={stageName}
          onChange={(e) => setStageName(e.target.value)}
          placeholder="Enter stage name"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Color</label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`w-8 h-8 rounded-full ${option.class} ${
                color === option.value
                  ? "ring-2 ring-offset-2 ring-gray-500"
                  : ""
              }`}
              onClick={() => setColor(option.value)}
              title={option.name}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Stage
        </button>
      </div>
    </form>
  );
};

export default AddStageForm; // Export the AddStageForm component
