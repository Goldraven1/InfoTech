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
                            // Очищаем форму после успешной загрузки
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
});

// Функция для преобразования файла в base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}