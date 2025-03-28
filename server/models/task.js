import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    // notes: {
    //   text: { type: String },
    //   voiceNote: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
    // },
    notes: [
      {
        type: { type: String, enum: ["text", "voice"] },
        content: String,
        attachment: { type: Schema.Types.ObjectId, ref: "Attachment" },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    dueDate: { type: Date, required: true },
    remindOnDate: { type: Date },
    remindOnTime: { type: String },
    location: { type: String },
    meetingWith: { type: String },
    earlyReminder: { type: Boolean, default: false },
    repeat: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly", "custom"],
      default: "none",
    },
    repeatEndDate: { type: Date }, // Optional end date for recurring tasks
    repeatCustomInterval: { type: Number }, // For custom recurrence (in days)
    isRecurring: { type: Boolean, default: false }, // Flag for recurring template tasks
    isRecurringInstance: { type: Boolean, default: false }, // Flag for instances of recurring tasks
    recurringParentId: { type: Schema.Types.ObjectId, ref: "Task" }, // Link instances to template
    lastGeneratedDate: { type: Date }, // Track when instances were last generated,
    flagged: { type: Boolean, default: false },

    priority: {
      type: String,
      default: "normal",
      enum: ["low", "medium", "high"],
    },

    stage: {
      type: String,
      default: "todo",
      // enum: ["todo", "in progress", "completed" ],
    },

    activities: [
      {
        type: {
          type: String,
          default: "assigned",
          enum: [
            "assigned",
            "started",
            "in progress",
            "bug",
            "completed",
            "commented",
          ],
        },
        activity: String,
        date: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],

    subTasks: [
      {
        title: String,
        date: Date,
        tag: String,
      },
    ],

    assets: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
