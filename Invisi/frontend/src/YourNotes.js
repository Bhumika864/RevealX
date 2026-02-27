

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const backendUrl = process.env.REACT_APP_API_URL;

const YourNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        /*
          IMPORTANT DESIGN DECISION:
          We DO NOT try to fetch notes using stored keys.
          We ONLY rely on backend-provided metadata.
          If a note is expired or revealed, backend may return 404 / 410.
          That is treated as a valid state, not an error.
        */

        const res = await fetch(`${backendUrl}/api/notes/summary`);

        if (!res.ok) {
          throw new Error("Failed to fetch notes summary");
        }

        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load your notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  if (loading) return <p>Loading your notes…</p>;
  if (error) return <p>{error}</p>;

  if (notes.length === 0) {
    return (
      <div className="your-notes-container">
        <h2>Your Notes</h2>
        <p>No active notes.</p>
      </div>
    );
  }

  return (
    <div className="your-notes-container">
      <h2>Your Notes</h2>

      <div className="notes-list">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            // onClick={() => navigate(`/notes/${note.id}`)}
            onClick={() => {
  if (note.status === "ready" || note.status === "hidden") {
    navigate(`/notes/${note.id}`);
  }
}}
          >
            <p><strong>From:</strong> {note.sender}</p>
            <p><strong>To:</strong> {note.receiver}</p>
            <p>
              <strong>Status:</strong>{" "}
              {note.status === "hidden"
                ? "🔒 Hidden"
                : note.status === "revealed"
                ? "🔓 Revealed"
                : "⌛ Expired"}
            </p>
            <p>
              <strong>Reveal Date:</strong>{" "}
              {new Date(note.revealDate).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourNotes;