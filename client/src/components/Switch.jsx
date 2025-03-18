export const Switch = ({ checked, onChange, disabled, className }) => {
  const handleToggle = () => {
    if (!disabled) {
      console.log(`Switch toggled to: ${!checked ? "ON" : "OFF"}`);
      onChange(!checked); // Pass the new status to the parent component
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
            relative inline-flex h-6 w-12 rounded-full transition-colors duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
            ${checked ? "bg-blue-600" : "bg-gray-300"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        aria-checked={checked}
        role="switch"
      >
        <span
          className={`
              inline-block h-5 w-5 transform rounded-full bg-white shadow-md
              transition-transform duration-300 ease-in-out
              ${checked ? "translate-x-6" : "translate-x-1"}
            `}
        />
      </button>
      <span
        className={`text-sm font-medium ${
          checked ? "text-blue-700" : "text-gray-700"
        }`}
      >
        {checked ? "Admin" : "User"}
      </span>
    </div>
  );
};
