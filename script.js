document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. DATA LAYER & ANALYTICS SETUP
    // ==========================================
    window.dataLayer = window.dataLayer || [];

    // Track Phone Clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            window.dataLayer.push({
                'event': 'phone_click',
                'phone_number': link.getAttribute('href')
            });
            console.log('GTM Analytics Fired: phone_click');
        });
    });

    // Scroll Depth Tracking
    let scrollDepthTracked = { 25: false, 50: false, 75: false, 90: false };
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

        [25, 50, 75, 90].forEach(threshold => {
            if (scrollPercent >= threshold && !scrollDepthTracked[threshold]) {
                scrollDepthTracked[threshold] = true;
                window.dataLayer.push({
                    'event': 'scroll_depth',
                    'depth_percent': threshold
                });
                console.log(`GTM Analytics Fired: scroll_depth_${threshold}%`);
            }
        });
    });

    // ==========================================
    // 2. SMOOTH SCROLLING
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ==========================================
    // 3. BEFORE/AFTER SLIDER INTERACTIVE CONTROL
    // ==========================================
    const sliderControl = document.querySelector('.slider-handle-control');
    const imageAfter = document.querySelector('.image-after');
    const dividerLine = document.querySelector('.slider-divider-line');

    if (sliderControl && imageAfter && dividerLine) {
        sliderControl.addEventListener('input', (e) => {
            const value = e.target.value;
            const sliderContainer = document.querySelector('.comparison-slider');
            if (sliderContainer) {
                sliderContainer.style.setProperty('--position', `${value}%`);
            }
        });
    }

    // Before/After Gallery Filters (Using Distinct Before/After Images)
    const galleryBtns = document.querySelectorAll('.gallery-nav-btn');
    const beforeImage = document.querySelector('.image-before');
    
    // Gallery Assets - Different images representing before and after states
    const galleryImagesBefore = {
        cosmetic: 'before.jpg', // Natural/Yellowish teeth
        implants: 'before-2.jpg', // Unaligned / gap teeth
        invisalign: 'before-3.jpg' // Braces / crooked smile
    };

    const galleryImagesAfter = {
        cosmetic: 'after.jpg', // Perfect veneers smile
        implants: 'after-2.jpg', // Fully complete restored smile
        invisalign: 'after-3.jpg' // Straight aligned smile
    };

    galleryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            galleryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const type = btn.getAttribute('data-type');
            if (galleryImagesBefore[type] && galleryImagesAfter[type]) {
                beforeImage.style.backgroundImage = `url('${galleryImagesBefore[type]}')`;
                imageAfter.style.backgroundImage = `url('${galleryImagesAfter[type]}')`;
                
                // Add simulated clinical variance
                if (type === 'cosmetic') {
                    beforeImage.style.filter = 'sepia(0.35) saturate(1.2) brightness(0.85)';
                    imageAfter.style.filter = 'brightness(1.15) contrast(1.05) saturate(0.95)';
                } else {
                    beforeImage.style.filter = 'none';
                    imageAfter.style.filter = 'none';
                }
            }
        });
    });

    // ==========================================
    // 4. ACCORDION (FAQ)
    // ==========================================
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close other items
            document.querySelectorAll('.faq-item').forEach(el => {
                el.classList.remove('active');
                el.querySelector('.faq-answer').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // ==========================================
    // 5. MULTI-STEP FORM WITH ROUTING & ABANDONMENT TRACKING
    // ==========================================
    const formSteps = document.querySelectorAll('.form-step');
    const nextBtns = document.querySelectorAll('.btn-next');
    const prevBtns = document.querySelectorAll('.btn-prev');
    const multiStepForm = document.getElementById('multiStepForm');
    const progressBar = document.getElementById('progressBar');
    const stepIndicator = document.getElementById('stepIndicator');
    const successBox = document.getElementById('successBox');
    
    let currentStep = 1;
    let formStarted = false;

    // Direct routing binding from core services
    document.querySelectorAll('.btn-service-book').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const service = btn.getAttribute('data-service');
            const radioOption = document.querySelector(`input[name="treatment"][value="${service}"]`);
            if (radioOption) {
                radioOption.checked = true;
            }
            // Transition immediately to step 2
            goToStep(2);
            document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Listen to form input focus/start event
    multiStepForm.addEventListener('focusin', () => {
        if (!formStarted) {
            formStarted = true;
            window.dataLayer.push({
                'event': 'form_start',
                'formName': 'BookingForm'
            });
            console.log('GTM Analytics Fired: form_start');
        }
    });

    // Step Transitions
    nextBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            goToStep(currentStep - 1);
        });
    });

    function validateStep(step) {
        let valid = true;
        if (step === 1) {
            const treatmentChecked = document.querySelector('input[name="treatment"]:checked');
            if (!treatmentChecked) {
                alert('Please select a treatment option to proceed.');
                valid = false;
            }
        } else if (step === 2) {
            const name = document.getElementById('fullName');
            const phone = document.getElementById('phone');
            const email = document.getElementById('email');

            // Reset errors
            document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('has-error'));

            if (!name.value.trim()) {
                name.parentElement.classList.add('has-error');
                valid = false;
            }
            if (!phone.value.trim() || !validatePhone(phone.value)) {
                phone.parentElement.classList.add('has-error');
                valid = false;
            }
            if (!email.value.trim() || !validateEmail(email.value)) {
                email.parentElement.classList.add('has-error');
                valid = false;
            }
        }
        return valid;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        // Basic match for digits, parentheses, dashes
        return phone.replace(/\D/g, '').length >= 7;
    }

    function goToStep(step) {
        formSteps.forEach(s => s.classList.remove('active'));
        const activeStep = document.querySelector(`.form-step[data-step="${step}"]`);
        if (activeStep) {
            activeStep.classList.add('active');
            currentStep = step;
            updateProgress();
        }
    }

    function updateProgress() {
        const percent = ((currentStep - 1) / (formSteps.length - 1)) * 100;
        progressBar.style.width = `${percent}%`;
        
        let stepText = '';
        if (currentStep === 1) stepText = 'Step 1 of 3: Treatment Selection';
        else if (currentStep === 2) stepText = 'Step 2 of 3: Contact Info';
        else if (currentStep === 3) stepText = 'Step 3 of 3: Appointment Preference';

        stepIndicator.textContent = stepText;

        // Analytics step progression tracking
        window.dataLayer.push({
            'event': 'form_step_change',
            'current_step': currentStep
        });
        console.log(`GTM Analytics Fired: form_step_${currentStep}`);
    }

    // Lead Abandonment Tracking - Capture details on blur
    const leadFields = ['fullName', 'phone', 'email'];
    leadFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('blur', () => {
                const val = input.value.trim();
                if (val) {
                    sessionStorage.setItem(`lead_${fieldId}`, val);
                    
                    // Trigger custom abandonment-prevention event if user has filled at least Name & Phone
                    const nameSaved = sessionStorage.getItem('lead_fullName');
                    const phoneSaved = sessionStorage.getItem('lead_phone');

                    if (nameSaved && phoneSaved) {
                        window.dataLayer.push({
                            'event': 'partial_lead_captured',
                            'lead_name': nameSaved,
                            'lead_phone': phoneSaved,
                            'lead_email': sessionStorage.getItem('lead_email') || ''
                        });
                        console.log('GTM Analytics Fired: partial_lead_captured (For front-desk abandonment recovery)');
                    }
                }
            });
        }
    });

    // Restore from sessionStorage on load
    leadFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            const savedVal = sessionStorage.getItem(`lead_${fieldId}`);
            if (savedVal) {
                input.value = savedVal;
            }
        }
    });

    // Clear error states immediately on input
    if (multiStepForm) {
        const inputs = multiStepForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.parentElement.classList.remove('has-error');
            });
        });
    }

    // Form Submit Routing Logic
    multiStepForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateStep(3)) return;

        const formData = new FormData(multiStepForm);
        const data = Object.fromEntries(formData.entries());

        // Specialist Chair Routing Logic
        let assignedSpecialist = '';
        let assignedChair = '';

        if (data.treatment === 'implants') {
            assignedSpecialist = 'Dr. Robert Harrison (Implant Surgeon)';
            assignedChair = 'Oral Surgery Chair #3';
        } else if (data.treatment === 'invisalign') {
            assignedSpecialist = 'Dr. Amanda Sterling (Orthodontist)';
            assignedChair = 'Orthodontic Chair #1';
        } else if (data.treatment === 'cosmetic') {
            assignedSpecialist = 'Dr. Amanda Sterling (Cosmetic Specialist)';
            assignedChair = 'Aesthetic Chair #2';
        } else {
            assignedSpecialist = 'General Duty Dentist';
            assignedChair = 'Hygiene Chair #4';
        }

        const submitBtn = document.getElementById('btnFormSubmit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Routing to Chair...';

        setTimeout(() => {
            // Track successful conversion in GTM
            window.dataLayer.push({
                'event': 'form_submission_success',
                'treatment_selected': data.treatment,
                'routed_specialist': assignedSpecialist,
                'assigned_chair': assignedChair
            });
            console.log('GTM Analytics Fired: form_submission_success', {
                treatment: data.treatment,
                specialist: assignedSpecialist,
                chair: assignedChair
            });

            // Clear backup
            leadFields.forEach(f => sessionStorage.removeItem(`lead_${f}`));

            // Transition to success screen
            multiStepForm.style.display = 'none';
            successBox.style.display = 'block';
            stepIndicator.style.display = 'none';
            progressBar.parentElement.style.display = 'none';
        }, 1500);
    });

    // Form Reset / Book Another
    const btnResetForm = document.getElementById('btnResetForm');
    if (btnResetForm) {
        btnResetForm.addEventListener('click', () => {
            multiStepForm.reset();
            currentStep = 1;
            formStarted = false;
            
            multiStepForm.style.display = 'block';
            successBox.style.display = 'none';
            stepIndicator.style.display = 'block';
            progressBar.parentElement.style.display = 'block';
            
            goToStep(1);
        });
    }
});
