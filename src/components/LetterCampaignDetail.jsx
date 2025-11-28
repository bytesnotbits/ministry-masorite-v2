import React, { useState, useEffect } from 'react';
import AddLetterModal from './AddLetterModal';
import EditLetterModal from './EditLetterModal';
import './LetterCampaignDetail.css';

function LetterCampaignDetail({ campaign, onBack, onDelete, onEdit, territories }) {
  const [letters, setLetters] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [letterToEdit, setLetterToEdit] = useState(null);

  useEffect(() => {
    fetchLetters();
  }, [campaign, territories]);

  const fetchLetters = async () => {
    const response = await fetch(`http://localhost:3001/api/letters?campaignId=${campaign.id}`);
    const allLetters = await response.json();

    // Enrich with house address from territories prop
    const lettersWithHouses = allLetters.map(letter => {
      let house = null;
      if (territories) {
        for (const t of territories) {
          for (const s of t.streets) {
            const h = s.houses.find(h => h.id === letter.houseId);
            if (h) { house = h; break; }
          }
          if (house) break;
        }
      }
      return { ...letter, address: house ? house.address : 'Unknown Address' };
    });
    setLetters(lettersWithHouses);
  };

  const handleSave = async (letter) => {
    // await addLetter({ ...letter, campaignId: campaign.id });
    await fetch('http://localhost:3001/api/letters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...letter, campaignId: campaign.id })
    });
    fetchLetters();
  };

  const handleUpdate = async (letter) => {
    // await updateLetter(letter);
    await fetch(`http://localhost:3001/api/letters/${letter.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(letter)
    });
    fetchLetters();
  };

  const handleDeleteCampaign = async () => {
    if (window.confirm(`Are you sure you want to delete the "${campaign.name}" campaign?`)) {
      // await deleteLetterCampaign(campaign.id);
      await fetch(`http://localhost:3001/api/letter-campaigns/${campaign.id}`, {
        method: 'DELETE'
      });
      onBack();
    }
  };

  const handleDeleteLetter = async (letterId) => {
    if (window.confirm('Are you sure you want to delete this letter?')) {
      // await deleteLetter(letterId);
      await fetch(`http://localhost:3001/api/letters/${letterId}`, {
        method: 'DELETE'
      });
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
          territories={territories}
        />
      )}
      {isEditModalOpen && (
        <EditLetterModal
          letter={letterToEdit}
          onSave={handleUpdate}
          onClose={() => setIsEditModalOpen(false)}
          territories={territories}
        />
      )}
    </div>
  );
}

export default LetterCampaignDetail;
