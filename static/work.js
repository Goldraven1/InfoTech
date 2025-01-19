document.addEventListener('DOMContentLoaded', function() {
    const coverFileInput = document.getElementById('cover-file');
    const coverPreview = document.getElementById('cover-preview');
    const openModal = document.getElementById('uploadButton');
    const closeModal = document.getElementById('cancel');
    const modal = document.getElementById('modal');
    const uploadButton = document.getElementById('upload');

    if(coverFileInput) {
        coverFileInput.addEventListener('change', function(){
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e){
                    coverPreview.innerHTML = `<img src="${e.target.result}" alt="Обложка" style="max-width: 100%; height: auto;">`;
                }
                reader.readAsDataURL(file);
            } else {
                coverPreview.innerHTML = '';
            }
        });
    }

    if(openModal) {
        openModal.addEventListener('click', function(e){
            e.preventDefault();
            modal.classList.add('active');
        });
    }

    if(closeModal) {
        closeModal.addEventListener('click', function(){
            modal.classList.remove('active');
        });
    }

    if(uploadButton) {
        uploadButton.addEventListener('click', async function(e){
            e.preventDefault();
            const musicFile = document.getElementById('music-file').files[0];
            const coverFile = document.getElementById('cover-file').files[0];
            const musicName = document.getElementById('music-name').value;
            const musicType = document.getElementById('music-select').value;

            if(musicFile && coverFile && musicName && musicType){
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
                        if(response.success){
                            modal.classList.remove('active');
                            alert(response.message);
                            document.getElementById('uploadForm').reset();
                            document.getElementById('cover-preview').innerHTML = '';
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
        });
    }

    window.onclick = function(e) {
        if(e.target == modal) {
            modal.classList.remove('active');
        }
    }

    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const homeButton = document.getElementById('homeButton');
    const chartsButton = document.getElementById('chartsButton');
    const playlistButton = document.getElementById('playlistButton');
    const profileButton = document.getElementById('profileButton');

    // Очистка поиска
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
    });

    // Поиск при вводе
    searchInput.addEventListener('input', (e) => {
        const searchQuery = e.target.value;
        // Здесь добавить логику поиска
        console.log('Поиск:', searchQuery);
    });

    // Обработчики навигации
    homeButton.addEventListener('click', () => {
        document.querySelector('.analytics-container').style.display = 'grid';
        initCharts(); // Обновляем графики
    });

    chartsButton.addEventListener('click', () => {
        // Показать раздел чартов
        document.querySelector('.analytics-container').style.display = 'grid';
    });

    playlistButton.addEventListener('click', () => {
        // Показать раздел плейлистов
        document.querySelector('.analytics-container').style.display = 'none';
        // Здесь добавить отображение плейлистов
    });

    profileButton.addEventListener('click', () => {
        // Показать профиль пользователя
        document.querySelector('.analytics-container').style.display = 'none';
        // Здесь добавить отображение профиля
    });

    // Инициализация графиков
    initCharts();
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function initCharts() {
    // График жанров
    const genresCtx = document.getElementById('genresChart').getContext('2d');
    new Chart(genresCtx, {
        type: 'doughnut',
        data: {
            labels: ['Джаз', 'Блюз', 'Рок', 'Поп', 'Классика'],
            datasets: [{
                data: [30, 20, 25, 15, 10],
                backgroundColor: [
                    'rgba(234,30,99, 0.8)',
                    'rgba(234,30,99, 0.6)',
                    'rgba(234,30,99, 0.4)',
                    'rgba(234,30,99, 0.3)',
                    'rgba(234,30,99, 0.2)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgb(234,30,99)'
                    }
                }
            }
        }
    });

    // График прослушиваний
    const listensCtx = document.getElementById('listensChart').getContext('2d');
    new Chart(listensCtx, {
        type: 'line',
        data: {
            labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            datasets: [{
                label: 'Прослушивания',
                data: [65, 59, 80, 81, 56, 55, 40],
                borderColor: 'rgb(234,30,99)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    ticks: { color: 'rgb(234,30,99)' }
                },
                x: {
                    ticks: { color: 'rgb(234,30,99)' }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgb(234,30,99)'
                    }
                }
            }
        }
    });

    // График топ треков
    const tracksCtx = document.getElementById('tracksChart').getContext('2d');
    new Chart(tracksCtx, {
        type: 'bar',
        data: {
            labels: ['Трек 1', 'Трек 2', 'Трек 3', 'Трек 4', 'Трек 5'],
            datasets: [{
                label: 'Рейтинг',
                data: [12, 19, 3, 5, 2],
                backgroundColor: 'rgba(234,30,99, 0.5)',
                borderColor: 'rgb(234,30,99)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'rgb(234,30,99)' }
                },
                x: {
                    ticks: { color: 'rgb(234,30,99)' }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgb(234,30,99)'
                    }
                }
            }
        }
    });
}

