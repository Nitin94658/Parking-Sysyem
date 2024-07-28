// Global variables
let parkingSpots = [];
let totalSpots = 0;
let availableSpots = 0;
let currentCapacity = 100; // Default capacity

// DOM Elements
const parkingLot = document.getElementById('parkingLot');
const totalSpotsElem = document.getElementById('totalSpots');
const availableSpotsElem = document.getElementById('availableSpots');
const capacityInput = document.getElementById('capacityInput');
const addSpotButton = document.getElementById('addSpot');
const removeLastSpotButton = document.getElementById('removeLastSpot');
const setCapacityButton = document.getElementById('setCapacity');

// Modal Elements
const detailsModal = document.getElementById('detailsModal');
const closeModalButton = document.getElementById('closeModal');
const spotNumberElem = document.getElementById('spotNumber');
const spotStatusElem = document.getElementById('spotStatus');
const vehicleNumberInput = document.getElementById('vehicleNumber');
const entryTimeElem = document.getElementById('entryTime');
const updateSpotButton = document.getElementById('updateSpot');

// Function to update spot counts
function updateSpotCounts() {
    totalSpotsElem.textContent = totalSpots;
    availableSpotsElem.textContent = availableSpots;
    saveDataToLocalStorage();
}

// Function to save parking data to local storage
function saveDataToLocalStorage() {
    const data = {
        parkingSpots: parkingSpots,
        totalSpots: totalSpots,
        availableSpots: availableSpots,
        currentCapacity: currentCapacity
    };
    localStorage.setItem('parkingData', JSON.stringify(data));
}

// Function to load parking data from local storage
function loadDataFromLocalStorage() {
    const data = localStorage.getItem('parkingData');
    if (data) {
        const parsedData = JSON.parse(data);
        parkingSpots = parsedData.parkingSpots;
        totalSpots = parsedData.totalSpots;
        availableSpots = parsedData.availableSpots;
        currentCapacity = parsedData.currentCapacity;

        parkingSpots.forEach((spot, index) => {
            createParkingSpotElement(spot, index);
        });

        updateSpotCounts();
    }
}

// Function to create parking spot element
function createParkingSpotElement(spot, index) {
    const spotElement = document.createElement('div');
    spotElement.classList.add('parking-spot');
    spotElement.textContent = `Spot ${index + 1}`;

    if (spot.isOccupied) {
        spotElement.classList.add('occupied');
    } else {
        spotElement.classList.add('available');
    }

    spotElement.addEventListener('click', () => openModal(index));
    parkingLot.appendChild(spotElement);
}

// Function to open the modal for spot details
function openModal(spotIndex) {
    const spot = parkingSpots[spotIndex];
    spotNumberElem.textContent = spot.index + 1;
    spotStatusElem.textContent = spot.isOccupied ? 'Occupied' : 'Available';
    vehicleNumberInput.value = spot.vehicleNumber || '';
    entryTimeElem.textContent = spot.entryTime ? spot.entryTime.toLocaleString() : 'N/A';

    updateSpotButton.onclick = () => updateSpotDetails(spotIndex);

    detailsModal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    detailsModal.style.display = 'none';
}

// Function to update spot details
function updateSpotDetails(spotIndex) {
    const spot = parkingSpots[spotIndex];
    const vehicleNumber = vehicleNumberInput.value.trim();

    if (vehicleNumber === '') {
        if (spot.isOccupied) {
            spot.isOccupied = false;
            spot.vehicleNumber = null;
            spot.entryTime = null;
            availableSpots++;
            parkingLot.children[spotIndex].classList.remove('occupied');
            parkingLot.children[spotIndex].classList.add('available');
        }
    } else {
        if (!spot.isOccupied) {
            spot.isOccupied = true;
            spot.entryTime = new Date();
            availableSpots--;
            parkingLot.children[spotIndex].classList.remove('available');
            parkingLot.children[spotIndex].classList.add('occupied');
        }
        spot.vehicleNumber = vehicleNumber;
    }

    updateSpotCounts();
    closeModal();
}

// Function to add a parking spot
function addParkingSpot() {
    if (totalSpots < currentCapacity) {
        const spotIndex = totalSpots++;
        availableSpots++;

        // Add a new spot object to the array
        const newSpot = {
            index: spotIndex,
            isOccupied: false,
            vehicleNumber: null,
            entryTime: null
        };

        parkingSpots.push(newSpot);
        createParkingSpotElement(newSpot, spotIndex);
        updateSpotCounts();
    } else {
        alert('Maximum capacity reached. Cannot add more spots.');
    }
}

// Function to remove the last parking spot
function removeLastParkingSpot() {
    const spots = parkingLot.getElementsByClassName('parking-spot');

    if (spots.length > 0) {
        const lastSpot = spots[spots.length - 1];
        const lastSpotIndex = spots.length - 1;
        const spotDetails = parkingSpots[lastSpotIndex];

        if (!spotDetails.isOccupied) {
            availableSpots--;
        }

        totalSpots--;

        // Remove the last spot from the array
        parkingSpots.pop();

        lastSpot.remove(); // Remove the last spot from the DOM
        updateSpotCounts();
    } else {
        alert('No spots to remove.');
    }
}

// Function to set a new parking lot capacity
function setNewCapacity() {
    const newCapacity = parseInt(capacityInput.value);

    if (isNaN(newCapacity) || newCapacity < 1) {
        alert('Please enter a valid positive number for capacity.');
        return;
    }

    currentCapacity = newCapacity;

    if (totalSpots > currentCapacity) {
        const spots = parkingLot.getElementsByClassName('parking-spot');

        // Remove extra spots beyond the new capacity
        while (totalSpots > currentCapacity) {
            const lastSpot = spots[spots.length - 1];
            const lastSpotIndex = spots.length - 1;
            const spotDetails = parkingSpots[lastSpotIndex];

            if (!spotDetails.isOccupied) {
                availableSpots--;
            }

            totalSpots--;
            parkingSpots.pop();
            lastSpot.remove();
        }
    } else {
        // Add spots if capacity increased
        for (let i = totalSpots; i < currentCapacity; i++) {
            addParkingSpot();
        }
    }

    updateSpotCounts();
    capacityInput.value = ''; // Clear the input field
}

// Initialize the parking lot with default capacity or load from local storage
function initializeParkingLot() {
    loadDataFromLocalStorage();
    if (totalSpots === 0) { // If no data in local storage
        for (let i = 0; i < currentCapacity; i++) {
            addParkingSpot();
        }
    }
}

// Event listeners for buttons
addSpotButton.addEventListener('click', addParkingSpot);
removeLastSpotButton.addEventListener('click', removeLastParkingSpot);
setCapacityButton.addEventListener('click', setNewCapacity);
closeModalButton.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
    if (event.target === detailsModal) {
        closeModal();
    }
});

// Initialize on load
initializeParkingLot();
