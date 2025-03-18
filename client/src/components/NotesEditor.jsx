import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  FaMicrophone,
  FaPaperPlane,
  FaStop,
  FaTrash,
  FaPlayCircle,
  FaPauseCircle,
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import clsx from "clsx";

const NotesEditor = ({
  existingNotes,
  onSendText,
  onSendVoice,
  onDeleteNote,
  isLoading,
}) => {
  // Text message state
  const [message, setMessage] = useState("");

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);

  // Audio playback states
  const [playingNoteId, setPlayingNoteId] = useState(null);

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRefs = useRef({});

  // Handle recording start
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      console.log(stream);
      console.log("Audio tracks:", stream.getAudioTracks());

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Please allow microphone access to record voice notes");
    }
  };

  // Handle recording stop
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  // Reset recording data
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
  };

  // Send voice note
  const sendVoiceNote = () => {
    if (audioBlob) {
      // Create a file from the blob with a timestamp name
      const file = new File([audioBlob], `voice-note-${Date.now()}.wav`, {
        type: "audio/webm",
      });
      onSendVoice(file);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };

  // Send text message
  const sendTextMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendText(message.trim());
      setMessage("");
    }
  };

  // Handle playing audio
  const togglePlayPause = (noteId, audioUrl) => {
    // If currently playing this note, pause it
    if (playingNoteId === noteId) {
      audioPlayerRefs.current[noteId].pause();
      setPlayingNoteId(null);
    } else {
      // If playing something else, pause that first
      if (playingNoteId && audioPlayerRefs.current[playingNoteId]) {
        audioPlayerRefs.current[playingNoteId].pause();
      }

      // Start playing this note
      if (!audioPlayerRefs.current[noteId]) {
        audioPlayerRefs.current[noteId] = new Audio(audioUrl);
        audioPlayerRefs.current[noteId].addEventListener("ended", () => {
          setPlayingNoteId(null);
        });
      }

      audioPlayerRefs.current[noteId].play();
      setPlayingNoteId(noteId);
    }
  };

  // Format recording time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear timer if component unmounts while recording
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Stop any active audio playback
      Object.values(audioPlayerRefs.current).forEach((player) => {
        if (player && !player.paused) {
          player.pause();
        }
      });
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Notes display area */}
      <div className="flex-1 overflow-y-auto mb-4 bg-gray-100 rounded-md p-3">
        {existingNotes && existingNotes.length > 0 ? (
          <div className="space-y-3">
            {existingNotes.map((note) => (
              <div
                key={note.id}
                className={clsx(
                  "p-3 rounded-lg max-w-[80%]",
                  note.type === "text"
                    ? "bg-white text-gray-800"
                    : "bg-blue-50 text-gray-700",
                  note.sentByMe ? "ml-auto" : "mr-auto"
                )}
              >
                {/* Text Note */}
                {note.type === "text" && (
                  <div className="break-words relative">
                    <ReactMarkdown>{note.content}</ReactMarkdown>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                      title="Delete Note"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                )}
                {/* Voice Note */}
                {note.type === "voice" && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => togglePlayPause(note.id, note.url)}>
                      {playingNoteId === note.id ? (
                        <FaPauseCircle className="text-blue-600" size={20} />
                      ) : (
                        <FaPlayCircle className="text-blue-600" size={20} />
                      )}
                    </button>
                    <div className="flex-1 h-1 bg-gray-300 rounded">
                      <div
                        className="h-1 bg-blue-500 rounded"
                        style={{
                          width: playingNoteId === note.id ? "70%" : "0%",
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {note.duration || "0:00"}
                    </span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                )}

                <div className="text-xs text-gray-500 text-right mt-1">
                  {note.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No notes yet. Start the conversation!
          </div>
        )}
      </div>

      {/* Recording visualization */}
      {isRecording && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-600 font-medium">
              Recording... {formatTime(recordingTime)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cancelRecording}
              className="p-2 text-red-600 hover:bg-red-100 rounded-full"
              title="Cancel recording"
            >
              <FaTrash size={16} />
            </button>
            <button
              onClick={stopRecording}
              className="p-2 text-red-600 hover:bg-red-100 rounded-full"
              title="Stop recording"
            >
              <FaStop size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Recorded audio preview */}
      {audioBlob && !isRecording && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaPlayCircle className="text-blue-600" size={18} />
            <span className="text-blue-600 font-medium">
              Voice note recorded ({formatTime(recordingTime)})
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cancelRecording}
              className="p-2 text-red-600 hover:bg-red-100 rounded-full"
              title="Discard recording"
            >
              <FaTrash size={16} />
            </button>
            <button
              onClick={sendVoiceNote}
              className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Message input */}
      <form onSubmit={sendTextMessage} className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          disabled={isRecording || isLoading}
        />

        {!isRecording && !audioBlob ? (
          <>
            <button
              type="button"
              onClick={startRecording}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              title="Record voice note"
              disabled={isLoading}
            >
              <FaMicrophone size={20} />
            </button>
            <button
              type="submit"
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full disabled:opacity-50"
              disabled={!message.trim() || isLoading}
              title="Send message"
            >
              <FaPaperPlane size={20} />
            </button>
          </>
        ) : null}
      </form>
    </div>
  );
};

export default NotesEditor;
