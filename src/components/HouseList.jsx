// src/components/HouseList.jsx

import { useState, useEffect } from 'react';
import { getByIndex, getFromStore } from '../database.js';
import './HouseList.css';

    // Note the new 'onHouseSelect' prop
    function HouseList({ streetId, onAddHouse, onHouseSelect, onEditStreet }) {
        const [houses, setHouses] = useState([]);
        const [streetName, setStreetName] = useState('');


    useEffect(() => {
    const fetchData = async () => {
        // Fetch the street object itself to get its name
        const streetObject = await getFromStore('streets', streetId);
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

    return (
        <div>
            <div className="view-header">
                <div className="header-actions">
                    <button className="secondary-action-btn" onClick={() => onEditStreet(streetId)}>
                    Edit Street
                    </button>
                    <button className="primary-action-btn" onClick={onAddHouse}>
                    + Add New House
                    </button>
                </div>
            </div>

            <ul className="house-list">
            {houses.map(house => (
                <li 
                    key={house.id} 
                    className="house-item"
                    onClick={() => onHouseSelect(house)}
                    >
                    <div className="house-address">{house.address}</div>
                    
                    {/* --- START: Updated Tag Logic --- */}
                    <div className="house-status-tags">
                        {house.isCurrentlyNH && <span className="status-tag nh-tag">NH</span>}
                        {house.isNotInterested && <span className="status-tag dnc-tag">NI</span>}
                        {house.hasMailbox && <span className="status-tag info-tag">MBox</span>}
                        {house.noTrespassing && <span className="status-tag warning-tag">NT</span>}
                        {house.hasGate && <span className="status-tag warning-tag">Gate</span>}
                    </div>
                    {/* --- END: Updated Tag Logic --- */}
                </li>
            ))}
            </ul>
        </div>
        );
    }

export default HouseList;