document.addEventListener("DOMContentLoaded", () => {
    // 1. STATE MANAGEMENT
    const state = {
        unlockedIds: new Set(),
        achievements: {
            flaneur: false, // 5 different neighborhoods (simplified to 5 total for prototype)
            timetraveler: false, // 3 archives from 19th c.
            ghosts: false // Specific trigger
        }
    };

    // 2. INITIALIZE LEAFLET MAP
    // Center on Paris
    const map = L.map('map', {
        zoomControl: false // Custom minimal controls later if needed
    }).setView([48.8566, 2.3522], 13);

    // Dark Matter provides a dark, cinematic background perfect for night-time / moody archival exploration
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
    }).addTo(map);

    // 3. ARCHIVE CONSTELLATION LAYER
    // Show all archives as subtle, clean dots instead of a red heatmap
    const archiveLayer = L.layerGroup().addTo(map);
    const markersById = {};
    
    archiveData.forEach(item => {
        const circle = L.circleMarker([item.lat, item.lng], {
            radius: 3,
            color: '#8b7355', // subtle sepia/brown
            weight: 1,
            fillColor: '#8b7355',
            fillOpacity: 0.3
        }).addTo(archiveLayer);
        
        markersById[item.id] = circle;
    });

    // 5. CORE FUNCTIONS
    function simulateDiscovery() {
        // Find an undiscovered archive
        const available = archiveData.filter(item => !state.unlockedIds.has(item.id));
        
        if (available.length === 0) {
            alert("All known archives in this region have been discovered.");
            return;
        }

        // Pick random
        const index = Math.floor(Math.random() * available.length);
        const discovered = available[index];
        
        unlockArchive(discovered);
    }

    function unlockArchive(archive) {
        state.unlockedIds.add(archive.id);
        
        // Update Stats
        document.getElementById('archive-count').innerText = state.unlockedIds.size;

        // Visual Map Updates: Fly to location
        map.flyTo([archive.lat, archive.lng], 15, { animate: true, duration: 1.5 });
        
        // Remove the small circle if it exists
        if (markersById[archive.id]) {
            archiveLayer.removeLayer(markersById[archive.id]);
            delete markersById[archive.id];
        }
        
        // Add Marker for exact spot now that it's discovered
        const marker = L.marker([archive.lat, archive.lng]).addTo(map);
        
        // Custom Retro Popup Content (Vertical Layout)
        const popupContent = `
            <div class="retro-popup">
                <div class="popup-img-container">
                    <img src="${archive.image_url}" alt="Archive preview" class="popup-img" referrerpolicy="no-referrer">
                </div>
                <div class="popup-info">
                    <h4>${archive.label}</h4>
                    <p><strong>Date :</strong> ${archive.year}</p>
                    <a href="${archive.source_url}" target="_blank" class="retro-link">Access Archives</a>
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent, { minWidth: 400, maxWidth: 450, closeButton: false }).openPopup();

        // Add to Gallery
        addGalleryEntry(archive);

        // Check Achievements
        checkAchievements();
    }

    function addGalleryEntry(archive) {
        const container = document.getElementById('gallery-content');
        
        // Create card
        const card = document.createElement('div');
        card.className = 'journal-entry';
        
        card.innerHTML = `
            <img src="${archive.image_url}" alt="Historical image" referrerpolicy="no-referrer">
            <div class="cap-info">${archive.year} - ${archive.label}</div>
        `;
        
        // Prepend (newest first)
        container.insertBefore(card, container.firstChild);
    }

    function checkAchievements() {
        const unlockedCount = state.unlockedIds.size;
        
        // Badge 1: Flaneur (5 discoveries)
        if (!state.achievements.flaneur && unlockedCount >= 5) {
            state.achievements.flaneur = true;
            unlockBadge('badge-flaneur');
        }

        // Badge 2: Time Traveler (3 from 19th Century)
        if (!state.achievements.timetraveler) {
            let ninteenthCenturyCount = 0;
            state.unlockedIds.forEach(id => {
                const item = archiveData.find(a => a.id === id);
                if (item && item.century === 19) ninteenthCenturyCount++;
            });
            
            if (ninteenthCenturyCount >= 3) {
                state.achievements.timetraveler = true;
                unlockBadge('badge-timetraveler');
            }
        }
    }

    function unlockBadge(badgeId) {
        const badgeElement = document.getElementById(badgeId);
        if (badgeElement) {
            badgeElement.classList.remove('locked');
            // Subtle animation could be added here
        }
    }

    // 6. UI EVENT LISTENERS
    document.getElementById('btn-simulate').addEventListener('click', simulateDiscovery);
    
    // Add badge explanations via click
    const badgeDescriptions = {
        'badge-flaneur': "The Flâneur : Discovered 5 different historical archives across the city.",
        'badge-timetraveler': "Time Traveler : Uncovered at least 3 photographs from the 19th Century.",
        'badge-ghosts': "Ghosts of the Past : Found a special forgotten archive hidden on the map."
    };
    
    document.querySelectorAll('.badge').forEach(badge => {
        badge.addEventListener('click', (e) => {
            const desc = document.getElementById('badge-description');
            if (desc) {
                desc.innerText = badgeDescriptions[e.target.id];
                desc.classList.remove('hidden');
            }
        });
    });

    const galleryModal = document.getElementById('gallery-modal');
    const btnOpenGallery = document.getElementById('btn-open-gallery');
    if (btnOpenGallery && galleryModal) {
        btnOpenGallery.addEventListener('click', () => {
            galleryModal.classList.remove('hidden');
        });
    }
    
    const btnCloseGallery = document.getElementById('btn-close-gallery');
    if (btnCloseGallery && galleryModal) {
        btnCloseGallery.addEventListener('click', () => {
            galleryModal.classList.add('hidden');
        });
    }

    // Discovery History
    const historyWindow = document.getElementById('history-window');
    const btnOpenHistory = document.getElementById('btn-open-history');
    if (btnOpenHistory && historyWindow) {
        btnOpenHistory.addEventListener('click', () => {
            updateHistoryView();
            historyWindow.classList.remove('hidden');
        });
    }
    
    const btnCloseHistory = document.getElementById('btn-close-history');
    if (btnCloseHistory && historyWindow) {
        btnCloseHistory.addEventListener('click', () => {
            historyWindow.classList.add('hidden');
        });
    }

    // Draggable Window Helper
    function makeDraggable(windowEl, headerSelector) {
        if (!windowEl) return;
        const header = windowEl.querySelector(headerSelector);
        if (!header) return;

        let isDragging = false;
        let diffX = 0;
        let diffY = 0;

        header.addEventListener('mousedown', (e) => {
            // Only drag if not clicking the close button
            if (e.target.tagName.toLowerCase() === 'button') return;
            
            isDragging = true;
            const rect = windowEl.getBoundingClientRect();
            diffX = e.clientX - rect.left;
            diffY = e.clientY - rect.top;
            
            // Bring to front
            const currentZ = parseInt(window.getComputedStyle(windowEl).zIndex || 10000);
            windowEl.style.zIndex = isNaN(currentZ) ? 10001 : currentZ + 1;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            windowEl.style.left = `${e.clientX - diffX}px`;
            windowEl.style.top = `${e.clientY - diffY}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    makeDraggable(historyWindow, '.history-header');

    // Project Overview
    const overviewWindow = document.getElementById('overview-window');
    const btnOpenOverview = document.getElementById('btn-open-overview');
    if (btnOpenOverview && overviewWindow) {
        btnOpenOverview.addEventListener('click', () => {
            overviewWindow.classList.remove('hidden');
        });
    }
    
    const btnCloseOverview = document.getElementById('btn-close-overview');
    if (btnCloseOverview && overviewWindow) {
        btnCloseOverview.addEventListener('click', () => {
            overviewWindow.classList.add('hidden');
        });
    }
    makeDraggable(overviewWindow, '.overview-header');

    function updateHistoryView() {
        const historyContent = document.getElementById('history-content');
        if (!historyContent) return;
        historyContent.innerHTML = '';
        
        // Group discovered archives by arrondissement
        const grouped = {};
        state.unlockedIds.forEach(id => {
            const archive = archiveData.find(a => a.id === id);
            if (!archive) return;
            
            // Use precise geocoded arrondissement from data.js
            let arrLabel = "Other";
            if (archive.arrondissement && archive.arrondissement !== "Other") {
                arrLabel = `${archive.arrondissement}${archive.arrondissement === 1 ? 'er' : 'e'} Arrondissement`;
            }
            
            if (!grouped[arrLabel]) {
                grouped[arrLabel] = [];
            }
            grouped[arrLabel].push(archive);
        });
        
        // Sort keys numerically where possible
        const sortedKeys = Object.keys(grouped).sort((a, b) => {
            if (a === "Other") return 1;
            if (b === "Other") return -1;
            const numA = parseInt(a);
            const numB = parseInt(b);
            return numA - numB;
        });
        
        sortedKeys.forEach(key => {
            const archives = grouped[key];
            const section = document.createElement('div');
            section.className = 'history-arrondissement';
            
            section.innerHTML = `
                <h3>${key} <span style="font-size: 0.8em; color: #555;">${archives.length} discovered</span></h3>
                <ul class="history-list">
                    ${archives.map(a => `<li><strong>${a.year}</strong> - <a href="${a.source_url}" target="_blank" style="color: inherit; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${a.label}</a></li>`).join('')}
                </ul>
            `;
            historyContent.appendChild(section);
        });
    }
});
