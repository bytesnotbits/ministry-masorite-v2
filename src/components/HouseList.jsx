// src/components/HouseList.jsx

import { useState, useEffect } from 'react';
import { getByIndex, getFromStore } from '../database.js';
import './HouseList.css';
import Icon from './Icon.jsx';
import ViewHeader from './ViewHeader.jsx';
import FilterBar from './FilterBar.jsx';

    // Note the new 'onHouseSelect' prop
    function HouseList({ streetId, onAddHouse, onHouseSelect, onEditStreet, filters, onFilterChange }) {
        
        console.log('onEditStreet prop received in HouseList:', onEditStreet);

        const [houses, setHouses] = useState([]);
        const [streetName, setStreetName] = useState('');


    useEffect(() => {
    const fetchData = async () => {
        // Fetch the street object itself to get its name
        const streetObject = await getFromStore('streets', streetId);
        console.log('Street object fetched in HouseList:', streetObject);
        if (streetObject) {
        setStreetName(streetObject.name);
        }

        // Fetch the list of houses for this street
        const houseData = await getByIndex('houses', 'streetId', streetId);
        houseData.sort((a, b) => a.address.localeCompare(b.address, undefined, { numeric: true }));
        setHouses(houseData);
    };

    fetchData();
    }, [streetId]);

    // Apply filters to the houses list
    const filteredHouses = houses.filter(house => {
        // If showNotAtHome is false, hide houses where isCurrentlyNH is true
        if (!filters.showNotAtHome && house.isCurrentlyNH) return false;
        // If showNotInterested is false, hide houses where isNotInterested is true
        if (!filters.showNotInterested && house.isNotInterested) return false;
        // If showGate is false, hide houses where hasGate is true
        if (!filters.showGate && house.hasGate) return false;
        // If showMailbox is false, hide houses where hasMailbox is true
        if (!filters.showMailbox && house.hasMailbox) return false;
        // If showNoTrespassing is false, hide houses where noTrespassing is true
        if (!filters.showNoTrespassing && house.noTrespassing) return false;

        return true;
    });

    return (
        <div>
            <ViewHeader title={streetName || 'Loading...'}>
                <button
                    className="secondary-action-btn"
                    onClick={() => onEditStreet(streetId)}
                >
                    Edit Street
                </button>
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
            {filteredHouses.map(house => (
                <li 
                    key={house.id} 
                    className="house-item"
                    onClick={() => onHouseSelect(house)}
                    >
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
                </li>
            ))}
            </ul>
        </div>
        );
    }

export default HouseList;