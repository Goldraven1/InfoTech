const coverFileInput = document.getElementById('cover-file');
const coverPreview = document.getElementById('cover-preview');

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

const openModal = document.getElementById('uploadButton');
const closeModal = document.getElementById('cancel'); // Изменено с 'closeButton' на 'cancel'
const modal = document.getElementById('modal');

openModal.addEventListener('click', function(e){
    e.preventDefault();
    modal.classList.add('active');
});

closeModal.addEventListener('click', function(){
    modal.classList.remove('active');
});

window.onclick = function(e) {
    if(e.target == modal) {
        modal.classList.remove('active');
    }
}

const uploadBtn = document.getElementById('upload');
uploadBtn.addEventListener('click', () => {
    const fileMusic = document.getElementById('music-file').files[0];
    const fileCover = document.getElementById('cover-file').files[0];
    if (fileMusic && fileCover) {
        console.log(`Музыка/Видео: ${fileMusic.name}, Обложка: ${fileCover.name}`);
        // Здесь реализуйте загрузку на сервер
        const formData = new FormData();
        formData.append('music', fileMusic);
        formData.append('cover', fileCover);
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Успех:', data);
            modal.classList.remove('active');
        })
        .catch((error) => {
            console.error('Ошибка:', error);
        });

        if (coverPreview.innerHTML === '') {
            alert('Пожалуйста, загрузите обложку.');
        }
    }
});

const saveBtn = document.getElementById('cancel');
saveBtn.addEventListener('click', () => {
    const musicName = document.getElementById('music-name').value;
    const musicType = document.getElementById('music-select').value;
    if (musicName && musicType) {
        // Здесь реализуйте сохранение данных на сервер
        fetch('/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: musicName, type: musicType })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Сохранено:', data);
            modal.classList.remove('active');
        })
        .catch((error) => {
            console.error('Ошибка:', error);
        });
    } else {
        alert('Пожалуйста, заполните все поля.');
    }
});