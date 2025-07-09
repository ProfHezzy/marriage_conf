document.addEventListener('DOMContentLoaded', function () {
    /************************************
     * Global Utility Functions
     ************************************/

    // Function to get CSRF token from cookies
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

    // Function to display a temporary alert message (e.g., for success/error)
    function displayAlert(message, type = 'success', duration = 5000) {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type} alert-dismissible fade show fixed-top mt-3 mx-auto shadow-lg`;
        alertContainer.setAttribute('role', 'alert');
        alertContainer.style.maxWidth = '600px';
        alertContainer.style.zIndex = '1050'; // Above navbar

        alertContainer.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.prepend(alertContainer);

        setTimeout(() => {
            alertContainer.classList.remove('show');
            alertContainer.classList.add('fade');
            alertContainer.addEventListener('transitionend', () => alertContainer.remove());
        }, duration);
    }

    /************************************
     * Navbar Scroll Effect
     ************************************/
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    /************************************
     * Smooth Scrolling for Navigation
     ************************************/
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight - 20; // Add extra offset

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close navbar on mobile after clicking link
                const navbarToggler = document.querySelector('.navbar-toggler');
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarToggler && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
                    bsCollapse.hide();
                }
            }
        });
    });

    /************************************
     * Form Submission (AJAX & Validation)
     ************************************/
    const form = document.querySelector('#registration-form');
    const submitButton = document.querySelector('#submit-button');
    const formErrorsDiv = document.querySelector('#formErrors'); // Div to display non-field errors

    // Function to clear all previous validation feedback
    function clearValidationErrors() {
        document.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        document.querySelectorAll('.invalid-feedback').forEach(el => {
            el.textContent = '';
        });
        if (formErrorsDiv) {
            formErrorsDiv.innerHTML = '';
            formErrorsDiv.style.display = 'none';
        }
    }

    // Function to apply validation feedback
    function applyValidationErrors(errors) {
        clearValidationErrors(); // Clear previous errors first

        if (formErrorsDiv) {
            let globalErrorsHtml = '';
            // Handle non-field errors if they exist (e.g., '__all__')
            if (errors.__all__) {
                globalErrorsHtml += `<p class="mb-0">${errors.__all__.join(', ')}</p>`;
                delete errors.__all__; // Remove from specific field processing
            }
            if (globalErrorsHtml) {
                formErrorsDiv.innerHTML = globalErrorsHtml;
                formErrorsDiv.style.display = 'block';
            }
        }


        for (let fieldName in errors) {
            const inputField = form.querySelector(`[name="${fieldName}"]`);
            if (inputField) {
                inputField.classList.add('is-invalid');
                let feedbackElement = inputField.nextElementSibling;
                // Create invalid-feedback div if it doesn't exist
                if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
                    feedbackElement = document.createElement('div');
                    feedbackElement.classList.add('invalid-feedback');
                    inputField.parentNode.insertBefore(feedbackElement, inputField.nextSibling);
                }
                feedbackElement.textContent = errors[fieldName].join(' '); // Join multiple errors with space
            }
        }
    }

    if (form && submitButton) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Clear previous errors before new submission
            clearValidationErrors();

            submitButton.disabled = true;
            submitButton.innerHTML = 'Submitting... <i class="fas fa-spinner fa-spin"></i>'; // Font Awesome 6

            const formData = new FormData(form);
            const csrfToken = getCSRFToken();

            try {
                const response = await fetch(form.dataset.url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest' // Important for Django's is_ajax()
                    },
                    credentials: 'same-origin'
                });

                const result = await response.json();

                if (response.ok) { // Check for 2xx status code
                    if (result.success) {
                        displayAlert(result.message || 'Registration successful!', 'success'); // Show friendly success message
                        form.reset(); // Clear form fields
                        // Optional: Redirect after a delay or update UI
                        if (result.redirect_url) {
                            setTimeout(() => {
                                window.location.href = result.redirect_url;
                            }, 2000); // Redirect after 2 seconds
                        }
                    } else {
                        // This case should ideally not be hit if backend sends 4xx for errors
                        displayAlert(result.message || 'An unexpected error occurred.', 'danger');
                        if (result.errors) {
                             applyValidationErrors(result.errors);
                        }
                    }
                } else { // Handle 4xx or 5xx errors
                    if (result.errors) {
                        applyValidationErrors(result.errors);
                        displayAlert(result.message || 'Please correct the errors below.', 'danger');
                    } else {
                        displayAlert(result.message || `Server error: ${response.status} ${response.statusText}`, 'danger');
                        console.error('Server error details:', result);
                    }
                }
            } catch (error) {
                console.error('Network or fetch error:', error);
                displayAlert('A network error occurred. Please try again.', 'danger');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Submit Registration';
            }
        });
    }

    /************************************
     * Dynamic Lightbox for Collage/Gallery
     ************************************/
    const lightboxModal = document.createElement('div');
    lightboxModal.className = 'modal fade'; // Bootstrap modal classes
    lightboxModal.id = 'galleryLightbox';
    lightboxModal.setAttribute('tabindex', '-1');
    lightboxModal.setAttribute('aria-hidden', 'true');
    lightboxModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-xl">
            <div class="modal-content bg-transparent border-0">
                <div class="modal-body p-0">
                    <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3 z-index-1" data-bs-dismiss="modal" aria-label="Close"></button>
                    <img src="" class="img-fluid w-100 rounded-3 shadow-lg" alt="Gallery Image">
                    <p class="text-white text-center mt-3 mb-0 fs-5"></p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(lightboxModal);

    const bsLightboxModal = new bootstrap.Modal(lightboxModal); // Initialize Bootstrap Modal

    document.querySelectorAll('.collage-item').forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').src;
            const caption = this.querySelector('.collage-caption').textContent;

            lightboxModal.querySelector('img').src = imgSrc;
            lightboxModal.querySelector('p').textContent = caption;

            bsLightboxModal.show(); // Show the Bootstrap modal
        });
    });

    /************************************
     * Scroll Animations (Intersection Observer)
     ************************************/
    const animateOnScrollElements = document.querySelectorAll(
        '.section-title, .lead, .about-image, .about-content .col-md-6 > div, .speaker-card, .schedule .card, .testimonial-card, .collage-item, #register .card, .stats-section .col-md-3'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp'); // Add Animate.css classes
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.2, // Trigger when 20% of the element is visible
        rootMargin: '0px 0px -50px 0px' // Adjust for smoother reveal
    });

    animateOnScrollElements.forEach(el => {
        // Remove existing animation classes if any, to prevent re-triggering issues
        el.classList.remove('animate__animated', 'animate__fadeInUp');
        observer.observe(el);
    });

    /************************************
     * Initialize Testimonial Carousel
     ************************************/
    const testimonialCarousel = document.getElementById('testimonialCarousel');
    if (testimonialCarousel) {
        new bootstrap.Carousel(testimonialCarousel, {
            interval: 5000, // Slide every 5 seconds
            pause: 'hover' // Pause on mouse hover
        });
    }
});