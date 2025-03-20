import Task from "../models/task.js";
import User from "../models/user.js";
import Attachment from "../models/Attachment.js";
import { s3 } from "../awsConfig.js";
import dotenv from "dotenv";
dotenv.config();

export const uploadToS3 = async (file) => {
  try {
    if (!file || !file.buffer) {
      throw new Error("No file buffer found for upload.");
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadResult = await s3.upload(params).promise();

    return uploadResult.Location; // Return file URL
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("File upload failed.");
  }
};

/**
 * *DELETE FILE FROM S3
 */
export const deleteFromS3 = async (url) => {
  // Extract the key from the URL
  const key = url.split(".com/")[1];

  if (!key) {
    throw new Error("Invalid S3 URL format");
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};

export const getNotesByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Validate taskId
    if (!taskId) {
      return res
        .status(400)
        .json({ status: false, message: "Task ID is required." });
    }

    // Find task and populate notes details
    const task = await Task.findById(taskId)
      .populate({
        path: "notes.attachment",
        select: "url fileType createdAt",
      })
      .populate({
        path: "notes.createdBy",
        select: "name email",
      });

    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Task not found." });
    }

    // Format notes for client
    const formattedNotes = task.notes.map((note) => {
      const formattedNote = {
        id: note._id,
        type: note.type,
        timestamp: note.createdAt,
        user: note.createdBy
          ? {
              id: note.createdBy._id,
              name: note.createdBy.name,
              email: note.createdBy.email,
            }
          : null,
      };

      if (note.type === "text") {
        formattedNote.content = note.content;
      } else if (note.type === "voice") {
        formattedNote.url = note.attachment?.url;
        formattedNote.fileType = note.attachment?.fileType;
      }

      return formattedNote;
    });

    res.status(200).json({
      status: true,
      notes: formattedNotes,
      message: "Notes retrieved successfully.",
    });
  } catch (error) {
    console.error("Error in getNotesByTaskId:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Add text note
export const addTextNote = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.user;
    const { message } = req.body;

    // Validate message
    if (!message || message.trim() === "") {
      return res
        .status(400)
        .json({ status: false, message: "Message cannot be empty." });
    }

    // Find task - ensure valid ObjectId
    if (!taskId || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid Task ID format." });
    }

    // Use findByIdAndUpdate to directly update the notes array without full validation
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $push: {
          notes: {
            type: "text",
            content: message,
            createdBy: userId,
            createdAt: new Date(),
          },
        },
      },
      { new: true } // Return the updated document
    ).populate({
      path: "notes.createdBy",
      select: "name email",
    });

    if (!updatedTask) {
      return res
        .status(404)
        .json({ status: false, message: "Task not found." });
    }

    // Get the newly added note (last item in the notes array)
    const addedNote = updatedTask.notes[updatedTask.notes.length - 1];

    res.status(201).json({
      status: true,
      note: {
        id: addedNote._id,
        type: addedNote.type,
        content: addedNote.content,
        timestamp: addedNote.createdAt,
        user: addedNote.createdBy
          ? {
              id: addedNote.createdBy._id,
              name: addedNote.createdBy.name,
              email: addedNote.createdBy.email,
            }
          : null,
      },
      message: "Text note added successfully.",
    });
  } catch (error) {
    console.error("Error in addTextNote:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Add voice note
export const addVoiceNote = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.user;

    // Validate uploaded file
    if (!req.file) {
      return res
        .status(400)
        .json({ status: false, message: "No voice note file uploaded." });
    }

    // Check if file is audio
    if (!req.file.mimetype.startsWith("audio/")) {
      return res
        .status(400)
        .json({ status: false, message: "File must be an audio file." });
    }

    // Validate task exists
    const taskExists = await Task.exists({ _id: taskId });
    if (!taskExists) {
      return res
        .status(404)
        .json({ status: false, message: "Task not found." });
    }

    // Upload file to S3
    const fileUrl = await uploadToS3(req.file);

    // Create attachment entry in DB
    const attachment = await Attachment.create({
      task: taskId,
      url: fileUrl,
      fileType: req.file.mimetype,
      uploadedBy: userId,
    });

    // Create a new voice note using findByIdAndUpdate to avoid validation
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $push: {
          notes: {
            type: "voice",
            content: `Voice note ${new Date().toISOString()}`,
            attachment: attachment._id,
            createdBy: userId,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    // Get the newly added note
    const addedNote = updatedTask.notes[updatedTask.notes.length - 1];

    // Return response
    res.status(201).json({
      status: true,
      note: {
        id: addedNote._id,
        type: "voice",
        url: fileUrl,
        fileType: req.file.mimetype,
        timestamp: addedNote.createdAt,
        user: { id: userId },
      },
      message: "Voice note added successfully.",
    });
  } catch (error) {
    console.error("Error in addVoiceNote:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Delete specific note
export const deleteNote = async (req, res) => {
  try {
    const { taskId, noteId } = req.params;
    const { userId } = req.user;

    // Find task to check if note exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res
        .status(404)
        .json({ status: false, message: "Task not found." });
    }

    // Find the note index to verify it exists
    const noteIndex = task.notes.findIndex(
      (note) => note._id.toString() === noteId
    );

    if (noteIndex === -1) {
      return res
        .status(404)
        .json({ status: false, message: "Note not found." });
    }

    const noteToDelete = task.notes[noteIndex];

    // If voice note, delete the attachment
    if (noteToDelete.type === "voice" && noteToDelete.attachment) {
      const attachment = await Attachment.findById(noteToDelete.attachment);

      if (attachment) {
        // Delete file from S3
        await deleteFromS3(attachment.url);

        // Delete attachment record from DB
        await Attachment.findByIdAndDelete(attachment._id);
      }
    }

    // Use $pull operator to remove the note by its ID
    await Task.findByIdAndUpdate(
      taskId,
      {
        $pull: {
          notes: { _id: noteId },
        },
      },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteNote:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
