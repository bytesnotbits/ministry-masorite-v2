import React, { useState, useEffect } from 'react';
import AddLetterCampaignModal from './AddLetterCampaignModal';
import EditLetterCampaignModal from './EditLetterCampaignModal';
import LetterCampaignDetail from './LetterCampaignDetail';
import { getLetterCampaigns, addLetterCampaign, updateLetterCampaign } from '../database-api';
import './LetterCampaignList.css';

function LetterCampaignList({ onBack, onOpenLetterQueue, onOpenLetterTemplates, territories }) {
  const [campaigns, setCampaigns] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignToEdit, setCampaignToEdit] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const allCampaigns = await getLetterCampaigns();
      setCampaigns(allCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const handleSave = async (campaign) => {
    try {
      await addLetterCampaign(campaign);
      fetchCampaigns();
    } catch (error) {
      console.error("Error saving campaign:", error);
    }
  };

  const handleUpdate = async (campaign) => {
    try {
      await updateLetterCampaign(campaign);
      fetchCampaigns();
    } catch (error) {
      console.error("Error updating campaign:", error);
    }
  };

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleBack = () => {
    setSelectedCampaign(null);
  };

  const handleEdit = (campaign) => {
    setCampaignToEdit(campaign);
    setIsEditModalOpen(true);
  };

  if (selectedCampaign) {
    return <LetterCampaignDetail campaign={selectedCampaign} onBack={handleBack} onEdit={() => handleEdit(selectedCampaign)} territories={territories} />;
  }

  return (
    <div className="letter-campaign-list">
      <button className="breadcrumb-button" onClick={onBack}>&larr; Back</button>
      <h2>Letter Writing Campaigns</h2>
      <div className="header-actions">
        <button className="secondary-action-btn" onClick={onOpenLetterQueue}>
          Letter Queue
        </button>
        <button className="secondary-action-btn" onClick={onOpenLetterTemplates}>
          Letter Templates
        </button>
        <button className="primary-action-btn" onClick={() => setIsAddModalOpen(true)}>
          + New Campaign
        </button>
      </div>
      <ul>
        {campaigns.map(campaign => (
          <li key={campaign.id} onClick={() => handleCampaignClick(campaign)}>{campaign.name}</li>
        ))}
      </ul>
      {isAddModalOpen && (
        <AddLetterCampaignModal
          onSave={handleSave}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
      {isEditModalOpen && (
        <EditLetterCampaignModal
          campaign={campaignToEdit}
          onSave={handleUpdate}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}

export default LetterCampaignList;
