/* ============================================================
   Li Auto Global Careers — interactions
   ============================================================ */

// ---- Sticky nav border on scroll ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

// ---- Mobile menu ----
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  })
);

// ---- Dropdown menu ----
const dropdownBtn = document.querySelector('.nav__dropdown-btn');
const dropdownMenu = document.querySelector('.nav__dropdown-menu');
if (dropdownBtn && dropdownMenu) {
  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownBtn.setAttribute('aria-expanded', dropdownBtn.getAttribute('aria-expanded') === 'false');
    dropdownMenu.classList.toggle('open');
  });
  document.addEventListener('click', () => {
    dropdownMenu.classList.remove('open');
    dropdownBtn.setAttribute('aria-expanded', 'false');
  });
  dropdownMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// ---- Referral dropdown toggle ----
const referralSelect = document.getElementById('referral');
const referralDetails = document.getElementById('referralDetails');
if (referralSelect && referralDetails) {
  referralSelect.addEventListener('change', () => {
    if (referralSelect.value === 'yes') {
      referralDetails.style.display = 'block';
    } else {
      referralDetails.style.display = 'none';
    }
  });
}

// ---- Job filters ----
const filters = document.getElementById('filters');
const jobList = document.getElementById('jobList');
filters.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  filters.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
  chip.classList.add('chip--active');
  const f = chip.dataset.filter;
  jobList.querySelectorAll('.job').forEach(job => {
    const show = f === 'all' || job.dataset.category === f;
    job.classList.toggle('hide', !show);
    if (show) {
      // restart entrance animation
      job.style.animation = 'none';
      void job.offsetWidth;
      job.style.animation = '';
    }
  });
});

// ---- Full job-description disclosures ----
document.querySelectorAll('.job__details').forEach(details => {
  const summary = details.querySelector('.job__details-summary');
  details.addEventListener('toggle', () => {
    summary.textContent = details.open ? 'Show less' : 'View full job description';
  });
});

// ---- "Apply for this role" → prefill role + scroll to form ----
document.querySelectorAll('.job__link').forEach(link => {
  link.addEventListener('click', () => {
    const role = link.dataset.role;
    const sel = document.getElementById('role');
    [...sel.options].forEach(o => { if (o.text.replace(/\s+/g, ' ') === role.replace(/\s+/g, ' ')) sel.value = o.value; });
    document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
  });
});

// ---- Resume upload: drag & drop + submission ----
const applyForm = document.getElementById('applyForm');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('resume');
const fileChip = document.getElementById('fileChip');
const fileName = document.getElementById('fileName');
const removeBtn = document.getElementById('removeFile');
const uploadError = document.getElementById('uploadError');
const submitButton = document.getElementById('submitApplication');
const formStatus = document.getElementById('formStatus');
const formSuccess = document.getElementById('formSuccess');
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

['dragover', 'dragenter'].forEach(eventName =>
  dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.add('drag');
  })
);
['dragleave', 'drop'].forEach(eventName =>
  dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.remove('drag');
  })
);
dropZone.addEventListener('drop', event => {
  const [file] = event.dataTransfer.files;
  if (file) setFile(file);
});
fileInput.addEventListener('change', () => {
  const [file] = fileInput.files;
  if (file) validateAndDisplayFile(file);
});
removeBtn.addEventListener('click', event => {
  event.preventDefault();
  event.stopPropagation();
  clearFile();
});

function getFileExtension(file) {
  return file.name.split('.').pop().toLowerCase();
}

function showUploadError(message) {
  uploadError.textContent = message;
  uploadError.hidden = false;
  dropZone.classList.add('has-error');
}

function clearUploadError() {
  uploadError.hidden = true;
  uploadError.textContent = '';
  dropZone.classList.remove('has-error');
}

function clearFile() {
  fileInput.value = '';
  fileChip.hidden = true;
  fileName.textContent = '';
  clearUploadError();
}

function validateAndDisplayFile(file) {
  const extension = getFileExtension(file);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    clearFile();
    showUploadError('Please upload a PDF, DOC, or DOCX resume.');
    return false;
  }
  if (file.size > MAX_SIZE) {
    clearFile();
    showUploadError('File is too large. Please upload a resume under 10 MB.');
    return false;
  }
  clearUploadError();
  fileName.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`;
  fileChip.hidden = false;
  return true;
}

function setFile(file) {
  if (!validateAndDisplayFile(file)) return;

  const transfer = new DataTransfer();
  transfer.items.add(file);
  fileInput.files = transfer.files;
}

applyForm.addEventListener('submit', async event => {
  event.preventDefault();
  clearUploadError();
  formStatus.hidden = true;
  formStatus.classList.remove('is-error');

  if (!applyForm.reportValidity()) return;
  const [resume] = fileInput.files;
  if (!resume || !validateAndDisplayFile(resume)) {
    if (!resume) showUploadError('Please attach your resume before submitting.');
    dropZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Sending application…';
  formStatus.textContent = 'Uploading your application and resume…';
  formStatus.hidden = false;

  try {
    const response = await fetch(applyForm.action, {
      method: 'POST',
      body: new FormData(applyForm),
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('FormSubmit did not accept the application.');

    formSubmitted = true;
    applyForm.reset();
    clearFile();
    formStatus.hidden = true;
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    formStatus.textContent = 'We could not send your application. Please check your connection and try again.';
    formStatus.classList.add('is-error');
    formStatus.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Application';
  }
});

// ---- Warn before leaving an unfinished application with a resume ----
var formSubmitted = false;
window.addEventListener('beforeunload', event => {
  if (!formSubmitted && fileInput.files.length) {
    event.preventDefault();
    event.returnValue = 'You have not completed your application. Are you sure you want to leave?';
  }
});
