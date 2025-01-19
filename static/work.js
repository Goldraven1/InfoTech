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

const uploadButton = document.getElementById('upload');

uploadButton.addEventListener('click', function(){
    const musicFile = document.getElementById('music-file').files[0];
    const coverFile = document.getElementById('cover-file').files[0];
    const musicName = document.getElementById('music-name').value;
    const musicType = document.getElementById('music-select').value;

    if(musicFile && coverFile && musicName && musicType){
        const formData = new FormData();
        formData.append('music', musicFile);
        formData.append('cover', coverFile);
        formData.append('name', musicName);
        formData.append('type', musicType);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if(data.success){
                modal.classList.remove('active');
                alert(data.message);
            } else {
                throw new Error(data.error);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert(`Ошибка при загрузке файлов: ${error.message}`);
        });
    } else {
        alert('Пожалуйста, заполните все поля.');
    }
});