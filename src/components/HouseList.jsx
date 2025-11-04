// src/components/HouseList.jsx

import { useState, useEffect } from 'react';
import { getByIndex, getFromStore } from '../database.js';
import './HouseList.css';
import Icon from './Icon.jsx';
import ViewHeader from './ViewHeader.jsx';
import FilterBar from './FilterBar.jsx';
import InlineEditableText from './InlineEditableText.jsx';

    // Note the new 'onHouseSelect' prop
    function HouseList({ streetId, onAddHouse, onHouseSelect, onSaveStreet, filters, onFilterChange, onLogNH, onPhoneCall }) {
        const [houses, setHouses] = useState([]);
        const [streetDetails, setStreetDetails] = useState(null);


    useEffect(() => {
    const fetchData = async () => {
        // Fetch the street object itself
        const streetObject = await getFromStore('streets', streetId);
        if (streetObject) {
        setStreetDetails(streetObject);
        }

        // Fetch the list of houses for this street
        const houseData = await getByIndex('houses', 'streetId', streetId);
        houseData.sort((a, b) => a.address.localeCompare(b.address, undefined, { numeric: true }));
        setHouses(houseData);
    };

    fetchData();
    }, [streetId]);

    const handleStreetNameSave = (newName) => {
        const updatedStreet = {
            ...streetDetails,
            name: newName
        };
        onSaveStreet(updatedStreet);
        setStreetDetails(updatedStreet); // Update local state
    };

    // Apply filters to the houses list
    const filteredHouses = houses.filter(house => {
        // Collect all active filters (those set to true)
        const activeFilters = [];
        if (filters.showNotAtHome) activeFilters.push('isCurrentlyNH');
        if (filters.showNotInterested) activeFilters.push('isNotInterested');
        if (filters.showGate) activeFilters.push('hasGate');
        if (filters.showMailbox) activeFilters.push('hasMailbox');
        if (filters.showNoTrespassing) activeFilters.push('noTrespassing');

        // If no filters are active, show all houses
        if (activeFilters.length === 0) return true;

        // House must match ALL active filters (AND logic)
        return activeFilters.every(filterKey => house[filterKey] === true);
    });

    if (!streetDetails) {
        return <p>Loading street details...</p>;
    }

    return (
        <div>
            <div style={{ marginBottom: '1rem' }}>
                <InlineEditableText
                    value={streetDetails.name}
                    onSave={handleStreetNameSave}
                    as="h2"
                    placeholder="Street name"
                />
            </div>

            <ViewHeader>
                <button className="primary-action-btn" onClick={onAddHouse}>
                    + Add New House
                </button>
                </ViewHeader>

            <FilterBar
                filters={filters}
                onFilterChange={onFilterChange}
                availableFilters={['showNotAtHome', 'showNotInterested', 'showGate', 'showMailbox', 'showNoTrespassing']}
            />

            <ul className="house-list">
            {filteredHouses.map(house => {
                const isCompleted = !house.isCurrentlyNH; // House is completed when not at home is false
                return (
                <li
                    key={house.id}
                    className={`house-item ${isCompleted ? 'completed' : ''}`}
                    >
                    <div className="house-card-content" onClick={() => onHouseSelect(house)}>
                        <div className="house-address">{house.address}</div>

                        {/* --- START: Icon Logic --- */}
                        <div className="house-status-tags">
                            {house.isCurrentlyNH && <Icon name="notAtHome" className="house-tag-icon icon-nh" />}
                            {house.isNotInterested && <Icon name="notInterested" className="house-tag-icon icon-ni" />}
                            {house.hasMailbox && <Icon name="mailbox" className="house-tag-icon icon-mailbox" />}
                            {house.noTrespassing && <Icon name="noTrespassing" className="house-tag-icon icon-no-trespassing" />}
                            {house.hasGate && <Icon name="gate" className="house-tag-icon icon-gate" />}
                        </div>
                        {/* --- END: Icon Logic --- */}
                    </div>

                    {/* --- START: Action Buttons --- */}
                    <div className="house-action-buttons">
                        <button
                            className="btn-log-nh"
                            onClick={(e) => {
                                e.stopPropagation();
                                onLogNH(house);
                            }}
                        >
                            Log 'NH'
                        </button>
                        <button
                            className="btn-phone-call"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPhoneCall(house);
                            }}
                        >
                            Phone Call
                        </button>
                    </div>
                    {/* --- END: Action Buttons --- */}
                </li>
                );
            })}
            </ul>
        </div>
        );
    }

export default HouseList;