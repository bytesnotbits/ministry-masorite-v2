import React, { useState, useEffect } from 'react';
import { getStudyHistory, addStudyHistory, updateStudyHistory, deleteStudyHistory } from '../database-api';
import './StudyDetail.css';

function StudyDetail({ study, person, onBack }) {
  const [history, setHistory] = useState([]);
  const [newEntry, setNewEntry] = useState({ date: '', notes: '', nextSessionDate: '' });
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    if (study) {
      fetchHistory();
    }
  }, [study]);

  const fetchHistory = async () => {
    try {
      const historyData = await getStudyHistory(study.id);
      // Sort by date descending
      historyData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching study history:", error);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.date) return;
    try {
      await addStudyHistory({ ...newEntry, studyId: study.id });
      setNewEntry({ date: '', notes: '', nextSessionDate: '' });
      fetchHistory();
    } catch (error) {
      console.error("Error adding history entry:", error);
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !editingEntry.date) return;
    try {
      await updateStudyHistory(editingEntry);
      setEditingEntry(null);
      fetchHistory();
    } catch (error) {
      console.error("Error updating history entry:", error);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Delete this entry?')) {
      try {
        await deleteStudyHistory(id);
        fetchHistory();
      } catch (error) {
        console.error("Error deleting history entry:", error);
      }
    }
  };

  return (
    <div className="study-detail">
      <button className="back-btn" onClick={onBack}>&larr; Back</button>
      <h2>Bible Study: {person.name}</h2>
      <div className="study-info">
        <p><strong>Publication:</strong> {study.publication}</p>
        <p><strong>Current Lesson:</strong> {study.currentLesson}</p>
      </div>

      <div className="history-section">
        <h3>Study History</h3>

        <div className="add-entry-form">
          <h4>Add New Entry</h4>
          <input
            type="date"
            value={newEntry.date}
            onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
          />
          <textarea
            placeholder="Notes on what was covered..."
            value={newEntry.notes}
            onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })}
          />
          <label>Next Session:</label>
          <input
            type="date"
            value={newEntry.nextSessionDate}
            onChange={e => setNewEntry({ ...newEntry, nextSessionDate: e.target.value })}
          />
          <button onClick={handleAddEntry}>Add Entry</button>
        </div>

        <ul className="history-list">
          {history.map(entry => (
            <li key={entry.id} className="history-item">
              {editingEntry && editingEntry.id === entry.id ? (
                <div className="edit-entry-form">
                  <input
                    type="date"
                    value={editingEntry.date}
                    onChange={e => setEditingEntry({ ...editingEntry, date: e.target.value })}
                  />
                  <textarea
                    value={editingEntry.notes}
                    onChange={e => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                  />
                  <input
                    type="date"
                    value={editingEntry.nextSessionDate}
                    onChange={e => setEditingEntry({ ...editingEntry, nextSessionDate: e.target.value })}
                  />
                  <button onClick={handleUpdateEntry}>Save</button>
                  <button onClick={() => setEditingEntry(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <div className="entry-header">
                    <span className="entry-date">{entry.date}</span>
                    <div className="entry-actions">
                      <button onClick={() => setEditingEntry(entry)}>Edit</button>
                      <button onClick={() => handleDeleteEntry(entry.id)}>Delete</button>
                    </div>
                  </div>
                  <p className="entry-notes">{entry.notes}</p>
                  {entry.nextSessionDate && <p className="next-session">Next: {entry.nextSessionDate}</p>}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StudyDetail;