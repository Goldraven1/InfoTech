document.addEventListener('DOMContentLoaded', function() {
  
    setupUIElements();
    

    loadMusic();
    

    setupNavigation();
});

function setupUIElements() {

    const coverFileInput = document.getElementById('cover-file');
    const coverPreview = document.getElementById('cover-preview');
    const modal = document.getElementById('modal');
    const uploadButton = document.getElementById('upload');
    const openModal = document.getElementById('uploadButton');
    
    if(coverFileInput) {
        coverFileInput.addEventListener('change', handleCoverPreview);
    }
    
    if(openModal) {
        openModal.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });
    }
    
    if(uploadButton) {
        uploadButton.addEventListener('click', handleUpload);
    }
    
    if(modal) {
        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
}

async function loadMusic() {
    try {
        const mainContainer = document.querySelector('.main-container');
        if (!mainContainer) return;

   
        const analyticsContainer = document.querySelector('.analytics-container');
        if (analyticsContainer) {
            analyticsContainer.style.display = 'none';
        }


        mainContainer.innerHTML = '';


        const topSection = await createTopTracksSection();
        if (topSection) {
            mainContainer.appendChild(topSection);
        }

        const response = await eel.get_tracks_by_genre()();
        if (!response.success) return;

        Object.entries(response.genres).forEach(([genre, tracks]) => {
            if (tracks.length === 0) return;

            const genreSection = createGenreSection(genre, tracks);
            mainContainer.appendChild(genreSection);
        });

 
        setupCustomPlayers();

    } catch (error) {
        console.error('Error loading music:', error);
    }
}

async function createTopTracksSection() {
    const response = await eel.get_top_tracks(3)();
    if (!response.success) return '';

    const topTracks = response.tracks;
    if (topTracks.length === 0) return '';

    const section = document.createElement('div');
    section.className = 'top-music-section';
    section.innerHTML = `
        <h2>Топ треков</h2>
        <div class="top-tracks">
            ${topTracks.map(track => createTrackCard(track, true)).join('')}
        </div>
    `;
    return section;
}

function createGenreSection(genre, tracks) {
    const section = document.createElement('div');
    section.className = 'genre-section';
    section.innerHTML = `
        <h2>${genre}</h2>
        <button class="scroll-btn left">
            <i class="fas fa-chevron-left"></i>
        </button>
        <button class="scroll-btn right">
            <i class="fas fa-chevron-right"></i>
        </button>
        <div class="tracks-grid">
            ${tracks.map(track => createTrackCard(track)).join('')}
        </div>
    `;


    const tracksGrid = section.querySelector('.tracks-grid');
    const leftBtn = section.querySelector('.scroll-btn.left');
    const rightBtn = section.querySelector('.scroll-btn.right');

    leftBtn.addEventListener('click', () => {
        tracksGrid.scrollBy({
            left: -400,
            behavior: 'smooth'
        });
    });

    rightBtn.addEventListener('click', () => {
        tracksGrid.scrollBy({
            left: 400,
            behavior: 'smooth'
        });
    });

    return section;
}


const playlists = {
    data: new Map(), 

    add(playlistName, track) {
        if (!this.data.has(playlistName)) {
            this.data.set(playlistName, new Set());
        }
        this.data.get(playlistName).add(track);
        this.save();
    },

    remove(playlistName, trackId) {
        if (this.data.has(playlistName)) {
            const playlist = this.data.get(playlistName);
            playlist.delete(trackId);
            this.save();
        }
    },

    getAll() {
        return Array.from(this.data.entries()).reduce((acc, [name, tracks]) => {
            acc[name] = Array.from(tracks);
            return acc;
        }, {});
    },

    save() {
        localStorage.setItem('playlists', JSON.stringify(this.getAll()));
    },

    load() {
        const saved = JSON.parse(localStorage.getItem('playlists') || '{}');
        this.data.clear();
        Object.entries(saved).forEach(([name, tracks]) => {
            this.data.set(name, new Set(tracks));
        });
    }
};


function createTrackCard(track, isTopTrack = false) {
    return `
        <div class="track-card ${isTopTrack ? 'featured' : ''}" data-track-id="${track.id}">
            <div class="track-image">
                <img src="${decodeURIComponent(track.cover_file)}" alt="${track.name}">
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
                <button class="add-to-playlist" title="Добавить в плейлист">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="track-info">
                <h3>${track.name}</h3>
                <p>${track.type}</p>
            </div>
            <div class="custom-player">
                <div class="progress-bar">
                    <div class="progress"></div>
                </div>
                <div class="controls">
                    <button class="prev-btn"><i class="fas fa-step-backward"></i></button>
                    <button class="play-btn"><i class="fas fa-play"></i></button>
                    <button class="next-btn"><i class="fas fa-step-forward"></i></button>
                    <div class="volume-control">
                        <i class="fas fa-volume-up"></i>
                        <input type="range" class="volume-slider" min="0" max="100" value="100">
                    </div>
                </div>
                <audio src="${decodeURIComponent(track.music_file)}" preload="metadata"></audio>
            </div>
        </div>
    `;
}


document.addEventListener('click', (e) => {
    if (e.target.closest('.add-to-playlist')) {
        const card = e.target.closest('.track-card');
        const trackId = card.dataset.trackId;
        playlists.add('Мой плейлист', trackId);
        alert('Трек добавлен в плейлист!');
        showPlaylists(); 
    }
});


async function performSearch(query) {
    try {
        const response = await eel.search_tracks(query)();
        if (response.success) {
            displaySearchResults(response.tracks);
        } else {
            alert(`Ошибка поиска: ${response.error}`);
        }
    } catch (error) {
        console.error('Ошибка выполнения поиска:', error);
    }
}

function displaySearchResults(tracks) {
    const mainContainer = document.querySelector('.main-container');
    const analyticsContainer = document.querySelector('.analytics-container');
    
    mainContainer.innerHTML = '';
    analyticsContainer.style.display = 'none';

    if (tracks.length === 0) {
        mainContainer.innerHTML = '<p>Ничего не найдено.</p>';
        return;
    }

    const searchSection = document.createElement('div');
    searchSection.className = 'search-results-section';
    searchSection.innerHTML = `
        <h2>Результаты поиска</h2>
        <div class="tracks-grid">
            ${tracks.map(track => createTrackCard(track)).join('')}
        </div>
    `;
    
    mainContainer.appendChild(searchSection);
    setupCustomPlayers();
}

function setupNavigation() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const homeButton = document.getElementById('homeButton');
    const chartsButton = document.getElementById('chartsButton');
    const playlistButton = document.getElementById('playlistButton');
    const profileButton = document.getElementById('profileButton');


    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        loadMusic();
    });


    searchInput.addEventListener('input', (e) => {
        const searchQuery = e.target.value.trim();
        if (searchQuery.length > 0) {
            performSearch(searchQuery);
        } else {
            loadMusic();
        }
    });


    homeButton.addEventListener('click', () => {
        const mainContainer = document.querySelector('.main-container');
        const analyticsContainer = document.querySelector('.analytics-container');
        
        mainContainer.style.display = 'block';
        analyticsContainer.style.display = 'none';
        loadMusic();
    });

    chartsButton.addEventListener('click', () => {
        const mainContainer = document.querySelector('.main-container');
        const analyticsContainer = document.querySelector('.analytics-container');
        
        mainContainer.style.display = 'none';
        analyticsContainer.style.display = 'grid';
        initCharts();
    });

    playlistButton.addEventListener('click', () => {
        const mainContainer = document.querySelector('.main-container');
        const analyticsContainer = document.querySelector('.analytics-container');
        
        showPlaylists();
        
        mainContainer.style.display = 'block';
        analyticsContainer.style.display = 'none';
    });

    profileButton.addEventListener('click', () => {
        document.querySelector('.analytics-container').style.display = 'none';
    });


    initCharts();
}

async function showPlaylists() {
    playlists.load();
    const playlistsData = playlists.getAll();
    const mainContainer = document.querySelector('.main-container');
    
    mainContainer.innerHTML = `
        <div class="playlist-section">
            <h2>Мои плейлисты</h2>
            ${Object.entries(playlistsData).map(([name, tracks]) => `
                <div class="genre-section">
                    <h3>${name}</h3>
                    <div class="tracks-grid">
                        ${tracks.map(trackId => {
                            const track = findTrackById(trackId);
                            return track ? createTrackCard(track) : '';
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    mainContainer.style.display = 'block';
}

function findTrackById(trackId) {
    return null; 
}

function setupCustomPlayers() {
    document.querySelectorAll('.track-card').forEach(card => {
        const audio = card.querySelector('audio');
        const playBtn = card.querySelector('.play-btn');
        const volumeSlider = card.querySelector('.volume-slider');
        const progress = card.querySelector('.progress');
        const trackId = card.dataset.trackId;
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                audio.volume = e.target.value / 100;
            });
        }
        

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                pauseAllPlayers();
                audio.play().then(() => {
                    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    card.classList.add('playing');
                    updateListeningTime(trackId, audio);
                }).catch(error => {
                    console.error('Playback error:', error);
                });
            } else {
                audio.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                card.classList.remove('playing');
            }
        });

        audio.addEventListener('ended', () => {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            card.classList.remove('playing');
        });
        
        progress.parentElement.addEventListener('click', (e) => {
            const rect = progress.parentElement.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pos * audio.duration;
        });
        
        audio.addEventListener('timeupdate', () => {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = percent + '%';
        });


        const addToPlaylistBtn = card.querySelector('.add-to-playlist');
        if (addToPlaylistBtn) {
            addToPlaylistBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const trackId = card.dataset.trackId;
                const playlistName = prompt('Введите название плейлиста:');
                
                if (playlistName) {
                    playlists.add(playlistName, trackId);
                    alert('Трек добавлен в плейлист!');
                }
            });
        }
    });
}

async function updateListeningTime(trackId, audio) {
    let lastTime = 0;
    audio.addEventListener('timeupdate', () => {
        const currentTime = Math.floor(audio.currentTime);
        if (currentTime > lastTime) {
            lastTime = currentTime;
            eel.update_listening_time(trackId, 1);
        }
    });
}

function playPrevTrack(currentCard) {
    const allCards = Array.from(document.querySelectorAll('.track-card'));
    const currentIndex = allCards.indexOf(currentCard);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : allCards.length - 1;
    pauseAllPlayers();
    simulatePlayClick(allCards[prevIndex]);
}

function playNextTrack(currentCard) {
    const allCards = Array.from(document.querySelectorAll('.track-card'));
    const currentIndex = allCards.indexOf(currentCard);
    const nextIndex = currentIndex < allCards.length - 1 ? currentIndex + 1 : 0;
    pauseAllPlayers();
    simulatePlayClick(allCards[nextIndex]);
}

function simulatePlayClick(card) {
    const playBtn = card.querySelector('.play-btn');
    if (playBtn) {
        playBtn.click();
    }
}

function pauseAllPlayers() {
    document.querySelectorAll('.track-card').forEach(card => {
        const audio = card.querySelector('audio');
        const playBtn = card.querySelector('.play-btn');
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
}

async function updatePlayCount(trackId) {
    try {
        await eel.update_play_count(trackId)();
    } catch (error) {
        console.error('Error updating play count:', error);
    }
}

function handleCoverPreview(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            coverPreview.innerHTML = `<img src="${e.target.result}" alt="Обложка" style="max-width: 100%; height: auto;">`;
        }
        reader.readAsDataURL(file);
    } else {
        coverPreview.innerHTML = '';
    }
}

async function handleUpload(event) {
    event.preventDefault();
    const musicFile = document.getElementById('music-file').files[0];
    const coverFile = document.getElementById('cover-file').files[0];
    const musicName = document.getElementById('music-name').value;
    const musicType = document.getElementById('music-select').value;

    if (musicFile && coverFile && musicName && musicType) {
        try {
            const musicBase64 = await fileToBase64(musicFile);
            const coverBase64 = await fileToBase64(coverFile);
            const selectElement = document.getElementById('music-select');
            const selectedGenre = selectElement.options[selectElement.selectedIndex].text;

            eel.upload_files(
                {
                    name: musicFile.name,
                    type: musicFile.type,
                    data: musicBase64
                },
                {
                    name: coverFile.name,
                    type: coverFile.type,
                    data: coverBase64
                },
                musicName,
                selectedGenre
            )((response) => {
                if (response.success) {
                    modal.classList.remove('active');
                    alert(response.message);
                    document.getElementById('uploadForm').reset();
                    document.getElementById('cover-preview').innerHTML = '';
                    loadMusic(); 
                } else {
                    alert(`Ошибка: ${response.error}`);
                }
            });
        } catch (error) {
            alert('Ошибка при загрузке файлов: ' + error.message);
        }
    } else {
        alert('Пожалуйста, заполните все поля.');
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function initCharts() {
    try {
        const genresResponse = await eel.get_tracks_by_genre()();
        if (genresResponse.success) {
            const genres = Object.keys(genresResponse.genres);
            const genreCounts = Object.values(genresResponse.genres).map(tracks => tracks.length);
            
            const genresCtx = document.getElementById('genresChart').getContext('2d');
            new Chart(genresCtx, {
                type: 'bar',
                data: {
                    labels: genres,
                    datasets: [{
                        label: 'Количество треков',
                        data: genreCounts,
                        backgroundColor: 'rgba(234, 30, 99, 0.2)',
                        borderColor: 'rgba(234, 30, 99, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        const listensResponse = await eel.get_all_tracks()();
        if (listensResponse.success) {
            const tracks = listensResponse.tracks;
            const trackNames = tracks.map(track => track.name);
            const plays = tracks.map(track => track.plays); 

            const listensCtx = document.getElementById('listensChart').getContext('2d');
            new Chart(listensCtx, {
                type: 'line',
                data: {
                    labels: trackNames,
                    datasets: [{
                        label: 'Прослушивания (мин)',
                        data: plays,
                        backgroundColor: 'rgba(30, 144, 255, 0.2)',
                        borderColor: 'rgba(30, 144, 255, 1)',
                        borderWidth: 1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }

        const topTracksResponse = await eel.get_top_tracks(3)();
        if (topTracksResponse.success) {
            const topTracks = topTracksResponse.tracks;
            const topTrackNames = topTracks.map(track => track.name);
            const topPlays = topTracks.map(track => track.plays); // plays уже в минутах

            const tracksCtx = document.getElementById('tracksChart').getContext('2d');
            new Chart(tracksCtx, {
                type: 'pie',
                data: {
                    labels: topTrackNames,
                    datasets: [{
                        label: 'Топ Треки',
                        data: topPlays,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }
    } catch (error) {
        console.error('Ошибка инициализации графиков:', error);
    }
}