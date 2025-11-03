import React, { useState, useEffect } from 'react';
import { getByIndex, getFromStore } from '../database.js';
import { addLetter, deleteLetter, deleteLetterCampaign, updateLetter } from '../database-api.js';
import AddLetterModal from './AddLetterModal';
import EditLetterModal from './EditLetterModal';
import './LetterCampaignDetail.css';

function LetterCampaignDetail({ campaign, onBack, onDelete, onEdit }) {
  const [letters, setLetters] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [letterToEdit, setLetterToEdit] = useState(null);

  useEffect(() => {
    fetchLetters();
  }, [campaign]);

  const fetchLetters = async () => {
    const allLetters = await getByIndex('letters', 'campaignId', campaign.id);
    const lettersWithHouses = await Promise.all(allLetters.map(async (letter) => {
      const house = await getFromStore('houses', letter.houseId);
      return { ...letter, address: house.address };
    }));
    setLetters(lettersWithHouses);
  };

  const handleSave = async (letter) => {
    await addLetter({ ...letter, campaignId: campaign.id });
    fetchLetters();
  };

  const handleUpdate = async (letter) => {
    await updateLetter(letter);
    fetchLetters();
  };

  const handleDeleteCampaign = async () => {
    if (window.confirm(`Are you sure you want to delete the "${campaign.name}" campaign?`)) {
      await deleteLetterCampaign(campaign.id);
      onBack();
    }
  };

  const handleDeleteLetter = async (letterId) => {
    if (window.confirm('Are you sure you want to delete this letter?')) {
      await deleteLetter(letterId);
      fetchLetters();
    }
  };

  const handleEditLetter = (letter) => {
    setLetterToEdit(letter);
    setIsEditModalOpen(true);
  };

  return (
    <div className="letter-campaign-detail">
      <div className="view-header">
        <button className="back-btn" onClick={onBack}>&larr; Back</button>
        <h2>{campaign.name}</h2>
        <div>
          <button className="secondary-action-btn" onClick={onEdit}>Edit Campaign</button>
          <button className="secondary-action-btn" onClick={handleDeleteCampaign}>Delete Campaign</button>
          <button className="primary-action-btn" onClick={() => setIsAddModalOpen(true)}>
            + New Letter
          </button>
        </div>
      </div>
      <ul>
        {letters.map(letter => (
          <li key={letter.id}>
            <span>{letter.address}</span>
            <div>
              <button className="secondary-action-btn" onClick={() => handleEditLetter(letter)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDeleteLetter(letter.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {isAddModalOpen && (
        <AddLetterModal
          onSave={handleSave}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
      {isEditModalOpen && (
        <EditLetterModal
          letter={letterToEdit}
          onSave={handleUpdate}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}

export default LetterCampaignDetail;
