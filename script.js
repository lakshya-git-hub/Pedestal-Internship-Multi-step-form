document.addEventListener('DOMContentLoaded', function() {
  // Form elements
  const form = document.getElementById('multiStepForm');
  const steps = document.querySelectorAll('.form-step');
  const stepDots = document.querySelectorAll('.step');
  const progressFill = document.getElementById('progressFill');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const successMessage = document.getElementById('successMessage');
  const startOverBtn = document.getElementById('startOverBtn');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const modeText = document.getElementById('modeText');

  // Form data storage
  let formData = {
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    profilePicture: null,
    profilePicturePreview: '',
    bio: '',
    skills: []
  };

  // Available skills
  const availableSkills = [
    'JavaScript', 'React', 'Angular', 'Vue', 'HTML', 'CSS', 'Node.js', 
    'Python', 'Java', 'C#', 'PHP', 'Ruby', 'UI/UX Design', 'Graphic Design', 
    'Project Management', 'Agile', 'DevOps', 'Cloud Computing', 'Blockchain'
  ];

  // Current step
  let currentStep = 1;

  // Initialize form
  init();

  // Initialize form
  function init() {
    // Load data from localStorage
    loadFormData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize skills dropdown
    initializeSkillsDropdown();
    
    // Set up dark mode from saved preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
      darkModeToggle.checked = true;
      modeText.textContent = 'Light Mode';
    }
    
    // Update form UI based on current step
    updateFormUI();

    // Initialize animation effects
    initAnimationEffects();
  }

  // Initialize animation effects
  function initAnimationEffects() {
    // Animate form entry
    document.querySelector('.form-container').style.opacity = '0';
    setTimeout(() => {
      document.querySelector('.form-container').style.opacity = '1';
      document.querySelector('.form-container').style.transition = 'opacity 0.8s ease-in-out';
    }, 100);
    
    // Add subtle movement to background shapes on mouse move
    document.addEventListener('mousemove', (e) => {
      const shapes = document.querySelectorAll('.animation-shape');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      shapes.forEach((shape, index) => {
        const factor = (index + 1) * 5;
        shape.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    });
  }

  // Setup event listeners
  function setupEventListeners() {
    // Navigation buttons
    prevBtn.addEventListener('click', previousStep);
    nextBtn.addEventListener('click', nextStep);
    submitBtn.addEventListener('click', submitForm);
    startOverBtn.addEventListener('click', resetForm);
    
    // Form input event listeners
    document.getElementById('fullName').addEventListener('input', handleInput);
    document.getElementById('email').addEventListener('input', handleInput);
    document.getElementById('phone').addEventListener('input', handleInput);
    document.getElementById('username').addEventListener('input', handleInput);
    document.getElementById('password').addEventListener('input', handleInput);
    document.getElementById('confirmPassword').addEventListener('input', handleInput);
    document.getElementById('bio').addEventListener('input', handleBioInput);
    document.getElementById('profilePicture').addEventListener('change', handleProfilePicture);
    
    // Password toggle buttons
    document.getElementById('togglePassword').addEventListener('click', () => togglePasswordVisibility('password'));
    document.getElementById('toggleConfirmPassword').addEventListener('click', () => togglePasswordVisibility('confirmPassword'));
    
    // Dark mode toggle
    darkModeToggle.addEventListener('change', toggleDarkMode);
    
    // Keyboard navigation
    form.addEventListener('keydown', handleKeyDown);
  }

  // Toggle password visibility
  function togglePasswordVisibility(fieldId) {
    const passwordField = document.getElementById(fieldId);
    const fieldType = passwordField.getAttribute('type');
    
    passwordField.setAttribute(
      'type',
      fieldType === 'password' ? 'text' : 'password'
    );
  }

  // Handle input changes
  function handleInput(e) {
    const { name, value } = e.target;
    formData[name] = value;
    
    // Clear error for this field
    const errorElement = document.getElementById(`${name}Error`);
    if (errorElement) {
      errorElement.textContent = '';
    }
    
    // Handle password strength meter
    if (name === 'password') {
      updatePasswordStrength(value);
    }
    
    // Save to localStorage
    saveFormData();
  }

  // Handle bio input with character count
  function handleBioInput(e) {
    const value = e.target.value;
    formData.bio = value;
    
    // Update character count
    const charCount = document.getElementById('bioCharCount');
    charCount.textContent = value.length;
    
    // Add warning class if approaching limit
    if (value.length > 230) {
      charCount.style.color = 'var(--warning-color)';
    } else {
      charCount.style.color = 'var(--text-light)';
    }
    
    // Save to localStorage
    saveFormData();
  }

  // Handle profile picture upload
  function handleProfilePicture(e) {
    const file = e.target.files[0];
    
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        document.getElementById('profilePictureError').textContent = 'File size must be less than 5MB';
        return;
      }
      
      // Preview image
      const reader = new FileReader();
      reader.onload = function(e) {
        formData.profilePicturePreview = e.target.result;
        
        // Show preview
        const preview = document.getElementById('imagePreview');
        preview.src = e.target.result;
        preview.style.display = 'block';
        document.getElementById('noImageText').style.display = 'none';
        
        // Save to localStorage
        saveFormData();
      };
      reader.readAsDataURL(file);
    }
  }

  // Update password strength meter
  function updatePasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!password) {
      strengthFill.style.width = '0';
      strengthFill.className = 'strength-fill';
      strengthText.textContent = 'Password strength';
      return;
    }
    
    // Calculate password strength
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Update UI based on strength
    strengthFill.className = 'strength-fill';
    
    if (strength <= 2) {
      strengthFill.classList.add('weak');
      strengthText.textContent = 'Weak';
    } else if (strength === 3) {
      strengthFill.classList.add('fair');
      strengthText.textContent = 'Fair';
    } else if (strength === 4) {
      strengthFill.classList.add('good');
      strengthText.textContent = 'Good';
    } else {
      strengthFill.classList.add('strong');
      strengthText.textContent = 'Strong';
    }
  }

  // Initialize skills dropdown
  function initializeSkillsDropdown() {
    const skillInput = document.getElementById('skillInput');
    const skillsDropdown = document.getElementById('skillsDropdown');
    
    // Populate dropdown with available skills
    availableSkills.forEach(skill => {
      const option = document.createElement('div');
      option.className = 'skill-option';
      option.textContent = skill;
      option.addEventListener('click', () => {
        addSkill(skill);
        skillInput.value = '';
        skillsDropdown.classList.add('hidden');
      });
      skillsDropdown.appendChild(option);
    });
    
    // Setup skill input events
    skillInput.addEventListener('focus', () => {
      filterSkills('');
      skillsDropdown.classList.remove('hidden');
    });
    
    skillInput.addEventListener('input', () => {
      filterSkills(skillInput.value);
    });
    
    skillInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && skillInput.value.trim()) {
        e.preventDefault();
        const filteredSkills = availableSkills.filter(skill => 
          skill.toLowerCase().includes(skillInput.value.toLowerCase())
        );
        if (filteredSkills.length > 0) {
          addSkill(filteredSkills[0]);
          skillInput.value = '';
          skillsDropdown.classList.add('hidden');
        }
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!skillInput.contains(e.target) && !skillsDropdown.contains(e.target)) {
        skillsDropdown.classList.add('hidden');
      }
    });
    
    // Render existing skills
    renderSelectedSkills();
  }

  // Filter skills in dropdown
  function filterSkills(query) {
    const skillsDropdown = document.getElementById('skillsDropdown');
    const options = skillsDropdown.querySelectorAll('.skill-option');
    
    options.forEach(option => {
      const skill = option.textContent;
      if (skill.toLowerCase().includes(query.toLowerCase()) && !formData.skills.includes(skill)) {
        option.style.display = 'block';
      } else {
        option.style.display = 'none';
      }
    });
    
    // Show/hide dropdown based on available options
    let hasVisibleOptions = false;
    options.forEach(option => {
      if (option.style.display !== 'none') {
        hasVisibleOptions = true;
      }
    });
    
    if (hasVisibleOptions) {
      skillsDropdown.classList.remove('hidden');
    } else {
      skillsDropdown.classList.add('hidden');
    }
  }

  // Add a skill
  function addSkill(skill) {
    if (!formData.skills.includes(skill)) {
      formData.skills.push(skill);
      renderSelectedSkills();
      saveFormData();
    }
  }

  // Remove a skill
  function removeSkill(skill) {
    formData.skills = formData.skills.filter(s => s !== skill);
    renderSelectedSkills();
    saveFormData();
  }

  // Render selected skills
  function renderSelectedSkills() {
    const selectedSkillsContainer = document.getElementById('selectedSkills');
    selectedSkillsContainer.innerHTML = '';
    
    formData.skills.forEach(skill => {
      const skillTag = document.createElement('div');
      skillTag.className = 'skill-tag';
      skillTag.innerHTML = `${skill} <span class="remove-skill">&times;</span>`;
      
      skillTag.querySelector('.remove-skill').addEventListener('click', () => {
        removeSkill(skill);
      });
      
      selectedSkillsContainer.appendChild(skillTag);
    });
  }

  // Handle keyboard navigation
  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      // Enhance keyboard accessibility
      const focusableElements = form.querySelectorAll('input, textarea, button, select, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  // Toggle dark mode
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    modeText.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
  }

  // Previous step handler
  function previousStep() {
    if (currentStep > 1) {
      currentStep--;
      updateFormUI();
    }
  }

  // Next step handler
  function nextStep() {
    if (validateStep()) {
      if (currentStep < 4) {
        currentStep++;
        updateFormUI();
      }
    }
  }

  // Validate current step
  function validateStep() {
    const errors = {};
    
    switch (currentStep) {
      case 1:
        // Validate personal information
        if (!formData.fullName.trim()) {
          errors.fullName = 'Full name is required';
        }
        
        if (!formData.email.trim()) {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = 'Please enter a valid email address';
        }
        
        if (!formData.phone.trim()) {
          errors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
          errors.phone = 'Please enter a valid 10-digit phone number';
        }
        break;
        
      case 2:
        // Validate account setup
        if (!formData.username.trim()) {
          errors.username = 'Username is required';
        } else if (formData.username.length < 4) {
          errors.username = 'Username must be at least 4 characters';
        }
        
        if (!formData.password) {
          errors.password = 'Password is required';
        } else {
          // Calculate password strength
          let strength = 0;
          if (formData.password.length >= 8) strength += 1;
          if (/[A-Z]/.test(formData.password)) strength += 1;
          if (/[a-z]/.test(formData.password)) strength += 1;
          if (/[0-9]/.test(formData.password)) strength += 1;
          if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
          
          if (strength < 3) {
            errors.password = 'Password is too weak, make it stronger';
          }
        }
        
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
        
      case 3:
        // Validate profile details
        if (formData.bio.length > 250) {
          errors.bio = 'Bio must be 250 characters or less';
        }
        break;
    }
    
    // Display errors if any
    Object.keys(errors).forEach(field => {
      const errorElement = document.getElementById(`${field}Error`);
      if (errorElement) {
        errorElement.textContent = errors[field];
      }
    });
    
    return Object.keys(errors).length === 0;
  }

  // Update form UI based on current step
  function updateFormUI() {
    // Hide all steps
    steps.forEach(step => {
      step.classList.add('hidden');
    });
    
    // Show current step
    document.getElementById(`step${currentStep}`).classList.remove('hidden');
    
    // Update progress bar
    progressFill.style.width = `${(currentStep / 4) * 100}%`;
    
    // Update step dots
    stepDots.forEach((dot, index) => {
      const step = index + 1;
      
      dot.classList.remove('active', 'completed');
      
      if (step === currentStep) {
        dot.classList.add('active');
      } else if (step < currentStep) {
        dot.classList.add('completed');
      }
    });
    
    // Show/hide navigation buttons
    if (currentStep === 1) {
      prevBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
    }
    
    if (currentStep === 4) {
      nextBtn.classList.add('hidden');
      submitBtn.classList.remove('hidden');
      
      // Update review content
      updateReviewContent();
    } else {
      nextBtn.classList.remove('hidden');
      submitBtn.classList.add('hidden');
    }
    
    // Save current step to localStorage
    localStorage.setItem('currentStep', currentStep);
  }

  // Update review content
  function updateReviewContent() {
    // Personal information
    document.getElementById('reviewFullName').textContent = formData.fullName;
    document.getElementById('reviewEmail').textContent = formData.email;
    document.getElementById('reviewPhone').textContent = formData.phone;
    
    // Account information
    document.getElementById('reviewUsername').textContent = formData.username;
    
    // Profile details
    if (formData.profilePicturePreview) {
      const reviewProfilePicture = document.getElementById('reviewProfilePicture');
      reviewProfilePicture.src = formData.profilePicturePreview;
      reviewProfilePicture.style.display = 'block';
      document.getElementById('reviewNoImage').style.display = 'none';
    } else {
      document.getElementById('reviewProfilePicture').style.display = 'none';
      document.getElementById('reviewNoImage').style.display = 'inline';
    }
    
    document.getElementById('reviewBio').textContent = formData.bio || 'No bio provided';
    
    // Skills
    const reviewSkills = document.getElementById('reviewSkills');
    reviewSkills.innerHTML = '';
    
    if (formData.skills.length === 0) {
      reviewSkills.textContent = 'No skills selected';
    } else {
      formData.skills.forEach(skill => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.textContent = skill;
        reviewSkills.appendChild(skillTag);
      });
    }
  }

  // Submit form
  function submitForm() {
    // In a real application, you would send the data to a server here
    console.log('Form submitted:', formData);
    
    // Show success message
    form.style.display = 'none';
    successMessage.classList.remove('hidden');
    
    // Clear localStorage
    localStorage.removeItem('formData');
    localStorage.removeItem('currentStep');
  }

  // Reset form
  function resetForm() {
    // Clear form data
    formData = {
      fullName: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      confirmPassword: '',
      profilePicture: null,
      profilePicturePreview: '',
      bio: '',
      skills: []
    };
    
    // Reset UI
    currentStep = 1;
    form.reset();
    
    // Clear localStorage
    localStorage.removeItem('formData');
    localStorage.removeItem('currentStep');
    
    // Reset profile picture preview
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('noImageText').style.display = 'inline';
    
    // Reset bio char count
    document.getElementById('bioCharCount').textContent = '0';
    
    // Hide success message
    form.style.display = 'block';
    successMessage.classList.add('hidden');
    
    // Update UI
    updateFormUI();
  }

  // Save form data to localStorage
  function saveFormData() {
    localStorage.setItem('formData', JSON.stringify(formData));
  }

  // Load form data from localStorage
  function loadFormData() {
    const savedFormData = localStorage.getItem('formData');
    const savedStep = localStorage.getItem('currentStep');
    
    if (savedFormData) {
      formData = JSON.parse(savedFormData);
      
      // Populate form fields with saved data
      document.getElementById('fullName').value = formData.fullName || '';
      document.getElementById('email').value = formData.email || '';
      document.getElementById('phone').value = formData.phone || '';
      document.getElementById('username').value = formData.username || '';
      document.getElementById('password').value = formData.password || '';
      document.getElementById('confirmPassword').value = formData.confirmPassword || '';
      document.getElementById('bio').value = formData.bio || '';
      
      // Update character count for bio
      document.getElementById('bioCharCount').textContent = formData.bio ? formData.bio.length : '0';
      
      // Update password strength
      if (formData.password) {
        updatePasswordStrength(formData.password);
      }
      
      // Update profile picture preview
      if (formData.profilePicturePreview) {
        const preview = document.getElementById('imagePreview');
        preview.src = formData.profilePicturePreview;
        preview.style.display = 'block';
        document.getElementById('noImageText').style.display = 'none';
      }
    }
    
    if (savedStep) {
      currentStep = parseInt(savedStep);
    }
  }
});