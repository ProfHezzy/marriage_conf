document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#registration-form');
    const submitButton = document.querySelector('#submit-button');

    function getCSRFToken() {
        const name = 'csrftoken=';
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name)) {
                return cookie.substring(name.length);
            }
        }
        return '';
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        submitButton.disabled = true;
        submitButton.innerHTML = 'Submitting... <i class="fa fa-spinner fa-spin"></i>';

        const formData = new FormData(form);
        const csrfToken = getCSRFToken();

        fetch(form.dataset.url, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                window.location.href = result.redirect_url;
            } else if (result.errors) {
                let errorMsg = '';
                for (let key in result.errors) {
                    errorMsg += `${key}: ${result.errors[key].join(', ')}\n`;
                }
                alert(errorMsg);
            } else {
                alert('Unexpected error occurred.');
            }
        })
        .catch(error => {
            console.error(error);
            alert('Network error.');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit Registration';
        });
    });
});


// Initialize lightbox for collage items
document.querySelectorAll('.collage-item').forEach(item => {
    item.addEventListener('click', function() {
        const imgSrc = this.querySelector('img').src;
        const caption = this.querySelector('.collage-caption').textContent;
        
        // This would be replaced with your lightbox implementation
        const lightbox = document.createElement('div');
        lightbox.style.position = 'fixed';
        lightbox.style.top = '0';
        lightbox.style.left = '0';
        lightbox.style.width = '100%';
        lightbox.style.height = '100%';
        lightbox.style.backgroundColor = 'rgba(0,0,0,0.9)';
        lightbox.style.zIndex = '1000';
        lightbox.style.display = 'flex';
        lightbox.style.flexDirection = 'column';
        lightbox.style.justifyContent = 'center';
        lightbox.style.alignItems = 'center';
        
        const lightboxImg = document.createElement('img');
        lightboxImg.src = imgSrc;
        lightboxImg.style.maxHeight = '80vh';
        lightboxImg.style.maxWidth = '90vw';
        lightboxImg.style.objectFit = 'contain';
        
        const lightboxCaption = document.createElement('div');
        lightboxCaption.textContent = caption;
        lightboxCaption.style.color = 'white';
        lightboxCaption.style.marginTop = '20px';
        lightboxCaption.style.fontSize = '1.2rem';
        
        lightbox.appendChild(lightboxImg);
        lightbox.appendChild(lightboxCaption);
        lightbox.addEventListener('click', () => lightbox.remove());
        
        document.body.appendChild(lightbox);
    });
});