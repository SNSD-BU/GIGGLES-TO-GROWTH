// DOM Elements
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a');
const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const healthInputForm = document.getElementById('health-input-form');
const metricTypeSelect = document.getElementById('metric-type');
const metricValueInput = document.getElementById('metric-value');
const metricDateInput = document.getElementById('metric-date');
const metricTimeInput = document.getElementById('metric-time');
const metricNotesInput = document.getElementById('metric-notes');
const unitDisplay = document.querySelector('.unit');
const navLinksContainer = document.querySelector('.nav-links');

// Health Data Management
let healthData = {
    Weight: [],
    Height: [],
    Temperature: []
};

// Chart instances
const charts = {
    Weight: null,
    Height: null,
    Temperature: null
};

// Forum Data Management
let forumData = {
    posts: [
        {
            id: 1,
            title: "First Time Mom Tips",
            content: "Hi everyone! I'm a first-time mom and would love to hear your tips for managing sleep schedules and feeding routines. What worked best for you?",
            author: "Sarah M.",
            timestamp: Date.now() - 3600000, // 1 hour ago
            likes: 15,
            comments: [
                {
                    id: 1,
                    author: "Emma R.",
                    content: "Welcome to motherhood! I found that establishing a consistent bedtime routine really helped. Bath, book, and bed at the same time every night.",
                    timestamp: Date.now() - 1800000, // 30 minutes ago
                    likes: 8
                }
            ]
        },
        {
            id: 2,
            title: "Fun Activities for 2-Year-Olds",
            content: "Looking for creative indoor activities to keep my energetic 2-year-old engaged. Any suggestions for educational and fun games?",
            author: "Lisa K.",
            timestamp: Date.now() - 7200000, // 2 hours ago
            likes: 12,
            comments: [
                {
                    id: 1,
                    author: "Maria T.",
                    content: "We love doing simple crafts with paper plates and washable markers. Also, building forts with blankets is always a hit!",
                    timestamp: Date.now() - 3600000, // 1 hour ago
                    likes: 5
                }
            ]
        }
    ]
};

// Settings Management
const appSettings = {
    darkMode: false,
    fontSize: 'medium',
    healthReminders: true,
    milestoneAlerts: true
};

// High Score System
let highScores = {
    counting: JSON.parse(localStorage.getItem('countingHighScores')) || [],
    color: JSON.parse(localStorage.getItem('colorHighScores')) || [],
    memory: JSON.parse(localStorage.getItem('memoryHighScores')) || [],
    shapes: JSON.parse(localStorage.getItem('shapesHighScores')) || []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing application...');
    
    // Set up navigation first
    setupNavigation();
    
    // Initialize all sections
    initializeHealth();
    initializeGrowth();
    initializeGames();
    initializeForum();
    initializeSettings();
    
    // Set default date and time
    setDefaultDateTime();
});

// Navigation setup
function setupNavigation() {
    console.log('Setting up navigation...');
    
    // Function to handle navigation
    function handleNavigation(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        console.log('Navigating to:', targetId);
        showSection(targetId);
    }
    
    // Add click listeners to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Toggling mobile menu');
            mobileMenuBtn.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
            if (navLinksContainer) navLinksContainer.classList.remove('active');
        }
    });
    
    // Show initial section based on hash or default to health
    const initialSection = window.location.hash.substring(1) || 'health';
    showSection(initialSection);
}

// Show selected section
function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Handle footer visibility
    const footer = document.querySelector('.main-footer');
    if (footer) {
        if (sectionId === 'settings') {
            footer.classList.remove('active');
        } else {
            footer.classList.add('active');
        }
    }
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    mobileNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Close mobile menu
    if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
    if (navLinksContainer) navLinksContainer.classList.remove('active');
    
    // Update URL hash
    window.location.hash = sectionId;
}

// Form event listeners setup
function setupFormListeners() {
    // Form submission
    healthInputForm.addEventListener('submit', handleHealthSubmit);
    
    // Metric type change
    metricTypeSelect.addEventListener('change', updateUnitDisplay);
    
    // Time filter changes
    document.querySelectorAll('.time-filter').forEach(filter => {
        filter.addEventListener('change', (e) => {
            const metric = e.target.closest('.metric-card').dataset.metric;
            updateRecords(metric);
        });
    });
    
    // Export buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const metric = e.target.closest('.metric-card').dataset.metric;
            exportMetricData(metric);
        });
    });
}

// Initialize health data from localStorage
function initializeHealth() {
    console.log('Initializing health section...');
    
    // Load health data from localStorage
    const savedData = JSON.parse(localStorage.getItem('healthData'));
    if (savedData) {
        healthData = savedData;
    }

    // Initialize charts
    initializeCharts();

    // Update all displays
    updateAllCharts();
    updateAllRecords();
    updateHealthSummary();
    Object.keys(healthData).forEach(metric => updateMetricValue(metric));

    // Add event listeners
    if (healthInputForm) {
        healthInputForm.addEventListener('submit', handleHealthSubmit);
        metricTypeSelect.addEventListener('change', updateUnitDisplay);
    }

    // Add event listeners for time filters
    document.querySelectorAll('.time-filter').forEach(filter => {
        filter.addEventListener('change', (e) => {
            const metric = e.target.closest('.metric-card').dataset.metric;
            updateRecords(metric);
        });
    });

    // Add event listeners for export buttons
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const metric = e.target.closest('.metric-card').dataset.metric;
            exportMetricData(metric);
        });
    });
}

function updateMetricDisplay(metric, records) {
    const card = document.querySelector(`.metric-card[data-metric="${metric}"]`);
    if (!card) return;

    const valueDisplay = card.querySelector('.metric-value');
    const recordsList = card.querySelector('.records-list');
    
    // Update current value display
    if (records.length > 0) {
        const latestRecord = records[records.length - 1];
        valueDisplay.textContent = `${latestRecord.value}${getUnit(metric)}`;
    } else {
        valueDisplay.textContent = `-- ${getUnit(metric)}`;
    }

    // Update records list
    recordsList.innerHTML = '';
    if (records.length === 0) {
        recordsList.innerHTML = '<div class="no-records">No records available</div>';
        return;
    }

    // ... rest of the records display code ...
}

function getUnit(metric) {
    switch (metric) {
        case 'Weight': return ' kg';
        case 'Height': return ' cm';
        case 'Temperature': return '°C';
        default: return '';
    }
}

// Initialize charts
function initializeCharts() {
    Object.keys(healthData).forEach(metricType => {
        const canvas = document.querySelector(`.metric-card[data-metric="${metricType}"] canvas`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = healthData[metricType];
        
        const chartData = {
            labels: data.map(record => new Date(record.timestamp).toLocaleDateString()),
            datasets: [{
                label: metricType,
                data: data.map(record => record.value),
                borderColor: getMetricColor(metricType),
                tension: 0.4,
                fill: false
            }]
        };
        
        charts[metricType] = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    });
}

// Update all charts
function updateAllCharts() {
    Object.keys(healthData).forEach(metricType => {
        updateChart(metricType);
    });
}

// Update all records
function updateAllRecords() {
    Object.keys(healthData).forEach(metricType => {
        updateRecords(metricType);
    });
}

// Set default date and time
function setDefaultDateTime() {
    const now = new Date();
    metricDateInput.value = now.toISOString().split('T')[0];
    metricTimeInput.value = now.toTimeString().slice(0, 5);
}

// Handle health form submission
function handleHealthSubmit(e) {
    e.preventDefault();
    console.log('Handling health form submission...');
    
    const record = {
        type: metricTypeSelect.value,
        value: parseFloat(metricValueInput.value),
        date: metricDateInput.value,
        time: metricTimeInput.value,
        notes: metricNotesInput.value,
        timestamp: new Date(`${metricDateInput.value}T${metricTimeInput.value}`).getTime()
    };
    
    if (healthInputForm.dataset.editTimestamp) {
        // Update existing record
        const timestamp = parseInt(healthInputForm.dataset.editTimestamp);
        const recordIndex = healthData[record.type].findIndex(r => r.timestamp === timestamp);
        
        if (recordIndex !== -1) {
            healthData[record.type][recordIndex] = record;
            healthData[record.type].sort((a, b) => b.timestamp - a.timestamp);
            localStorage.setItem('healthData', JSON.stringify(healthData));
            
            updateChart(record.type);
            updateRecords(record.type);
            updateHealthSummary();
            updateMetricValue(record.type);
            
            showNotification('Record updated successfully!', 'success');
        }
        
        // Reset form state
        delete healthInputForm.dataset.editTimestamp;
        healthInputForm.querySelector('.submit-btn').textContent = 'Add Record';
    } else {
        // Add new record
        addHealthRecord(record);
        showNotification('Record added successfully!', 'success');
    }
    
    healthInputForm.reset();
    setDefaultDateTime();
}

// Add health record
function addHealthRecord(record) {
    console.log('Adding health record:', record);
    
    if (!healthData[record.type]) {
        healthData[record.type] = [];
    }
    
    healthData[record.type].push(record);
    healthData[record.type].sort((a, b) => b.timestamp - a.timestamp);
    
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    updateChart(record.type);
    updateRecords(record.type);
    updateHealthSummary();
    updateMetricValue(record.type);
}

// Update unit display
function updateUnitDisplay() {
    const type = metricTypeSelect.value;
    const units = {
        Weight: 'kg',
        Height: 'cm',
        Temperature: '°C'
    };
    unitDisplay.textContent = units[type];
}

// Update chart for a specific metric
function updateChart(metricType) {
    const canvas = document.querySelector(`.metric-card[data-metric="${metricType}"] canvas`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = healthData[metricType];
    
    if (charts[metricType]) {
        charts[metricType].destroy();
    }
    
    const chartData = {
        labels: data.map(record => new Date(record.timestamp).toLocaleDateString()),
        datasets: [{
            label: metricType,
            data: data.map(record => record.value),
            borderColor: getMetricColor(metricType),
            tension: 0.4,
            fill: false
        }]
    };
    
    charts[metricType] = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Update metric value display
function updateMetricValue(metricType) {
    const metricValue = document.querySelector(`.metric-card[data-metric="${metricType}"] .metric-value`);
    if (!metricValue) return;
    
    const records = healthData[metricType];
    if (records.length > 0) {
        const latestRecord = records[0];
        metricValue.textContent = `${latestRecord.value}${getMetricUnit(metricType)}`;
    } else {
        metricValue.textContent = `No data`;
    }
}

// Update records list for a specific metric
function updateRecords(metricType) {
    const recordsList = document.querySelector(`.records-list[data-metric="${metricType}"]`);
    if (!recordsList) return;
    
    const timeFilter = recordsList.closest('.metric-records').querySelector('.time-filter').value;
    const now = new Date();
    const filteredData = healthData[metricType].filter(record => {
        if (timeFilter === 'all') return true;
        const recordDate = new Date(record.timestamp);
        const daysDiff = (now - recordDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= parseInt(timeFilter);
    });
    
    recordsList.innerHTML = filteredData.map(record => `
        <div class="record-item">
            <div class="record-info">
                <span class="record-value">${record.value}${getMetricUnit(metricType)}</span>
                <span class="record-date">${new Date(record.timestamp).toLocaleString()}</span>
                ${record.notes ? `<span class="record-notes">${record.notes}</span>` : ''}
            </div>
            <div class="record-actions">
                <button class="edit-btn" data-timestamp="${record.timestamp}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-timestamp="${record.timestamp}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for edit and delete buttons
    recordsList.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editRecord(metricType, parseInt(btn.dataset.timestamp)));
    });
    
    recordsList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteRecord(metricType, parseInt(btn.dataset.timestamp)));
    });
}

// Update health summary
function updateHealthSummary() {
    Object.keys(healthData).forEach(metric => {
        const data = healthData[metric];
        if (data.length < 2) {
            // Reset indicators if not enough data
            const indicator = document.querySelector(`.trend-indicator[data-metric="${metric}"]`);
            if (indicator) {
                indicator.querySelector('.trend-value').textContent = '--';
                indicator.querySelector('.trend-icon').className = 'trend-icon';
                indicator.querySelector('.trend-icon').innerHTML = '';
            }
            return;
        }
        
        const latest = data[0];
        const previous = data[1];
        const trend = latest.value - previous.value;
        
        const indicator = document.querySelector(`.trend-indicator[data-metric="${metric}"]`);
        if (indicator) {
            const valueSpan = indicator.querySelector('.trend-value');
            const iconSpan = indicator.querySelector('.trend-icon');
            
            valueSpan.textContent = `${Math.abs(trend).toFixed(1)}${getMetricUnit(metric)}`;
            iconSpan.className = 'trend-icon ' + (trend > 0 ? 'up' : 'down');
            iconSpan.innerHTML = trend > 0 ? '↑' : '↓';
        }
        
        // Special handling for temperature
        if (metric === 'Temperature') {
            const statusIndicator = document.querySelector('.status-indicator[data-metric="Temperature"]');
            if (statusIndicator) {
                const valueSpan = statusIndicator.querySelector('.status-value');
                const iconSpan = statusIndicator.querySelector('.status-icon');
                
                valueSpan.textContent = `${latest.value}°C`;
                if (latest.value > 37.5) {
                    iconSpan.className = 'status-icon danger';
                    iconSpan.innerHTML = '⚠️';
                } else if (latest.value > 37) {
                    iconSpan.className = 'status-icon warning';
                    iconSpan.innerHTML = '⚠️';
                } else {
                    iconSpan.className = 'status-icon normal';
                    iconSpan.innerHTML = '✓';
                }
            }
        }
    });

    // Update BMI
    updateBMI();
}

function updateBMI() {
    const weightData = healthData.Weight;
    const heightData = healthData.Height;
    
    if (!weightData.length || !heightData.length) {
        document.querySelector('.bmi-value .value').textContent = '--';
        document.querySelector('.bmi-category').textContent = 'No data available';
        document.querySelectorAll('.scale-item').forEach(item => item.classList.remove('active'));
        return;
    }
    
    const latestWeight = weightData[0].value; // in kg
    const latestHeight = heightData[0].value / 100; // convert cm to m
    
    const bmi = latestWeight / (latestHeight * latestHeight);
    const bmiValue = document.querySelector('.bmi-value .value');
    const bmiCategory = document.querySelector('.bmi-category');
    
    bmiValue.textContent = bmi.toFixed(1);
    
    // Determine BMI category
    let category = '';
    let categoryClass = '';
    
    if (bmi < 18.5) {
        category = 'Underweight';
        categoryClass = 'underweight';
    } else if (bmi < 25) {
        category = 'Normal Weight';
        categoryClass = 'normal';
    } else if (bmi < 30) {
        category = 'Overweight';
        categoryClass = 'overweight';
    } else {
        category = 'Obese';
        categoryClass = 'obese';
    }
    
    bmiCategory.textContent = category;
    
    // Update active scale item
    document.querySelectorAll('.scale-item').forEach(item => {
        item.classList.remove('active');
        if (item.classList.contains(categoryClass)) {
            item.classList.add('active');
        }
    });
}

// Edit record
function editRecord(metricType, timestamp) {
    const record = healthData[metricType].find(r => r.timestamp === timestamp);
    if (!record) return;
    
    metricTypeSelect.value = metricType;
    metricValueInput.value = record.value;
    metricDateInput.value = record.date;
    metricTimeInput.value = record.time;
    metricNotesInput.value = record.notes || '';
    
    // Set form state for editing
    healthInputForm.dataset.editTimestamp = timestamp;
    healthInputForm.querySelector('.submit-btn').textContent = 'Update Record';
    
    updateUnitDisplay();
    healthInputForm.scrollIntoView({ behavior: 'smooth' });
}

// Delete record
function deleteRecord(metricType, timestamp) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    healthData[metricType] = healthData[metricType].filter(r => r.timestamp !== timestamp);
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    updateChart(metricType);
    updateRecords(metricType);
    updateHealthSummary();
    updateMetricValue(metricType);
}

// Export metric data
function exportMetricData(metricType) {
    const data = healthData[metricType];
    const csv = [
        ['Date', 'Time', 'Value', 'Notes'],
        ...data.map(record => [
            record.date,
            record.time,
            record.value,
            record.notes || ''
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metricType.toLowerCase()}_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Helper functions
function getMetricColor(metricType) {
    const colors = {
        Weight: '#4CAF50',
        Height: '#2196F3',
        Temperature: '#FFC107'
    };
    return colors[metricType] || '#666';
}

function getMetricUnit(metricType) {
    const units = {
        Weight: ' kg',
        Height: ' cm',
        Temperature: '°C'
    };
    return units[metricType] || '';
}

// Forum Post Creation
const newPostBtn = document.querySelector('.new-post-btn');
const forumPosts = document.querySelector('.forum-posts');

newPostBtn.addEventListener('click', () => {
    const postModal = document.createElement('div');
    postModal.className = 'modal';
    postModal.innerHTML = `
        <div class="modal-content">
            <h3>Create New Post</h3>
            <form id="new-post-form">
                <input type="text" placeholder="Title" required>
                <textarea placeholder="Write your post..." required></textarea>
                <div class="modal-buttons">
                    <button type="button" class="cancel-btn">Cancel</button>
                    <button type="submit" class="submit-btn">Post</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(postModal);
    
    // Handle form submission
    const form = postModal.querySelector('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = form.querySelector('input').value;
        const content = form.querySelector('textarea').value;
        
        // Create new post element
        const postElement = document.createElement('div');
        postElement.className = 'forum-post';
        postElement.dataset.postId = post.id;
        
        postElement.innerHTML = `
            <div class="post-header">
                <h3>${title}</h3>
                <div class="post-meta">
                    <span class="post-author">${post.author}</span>
                    <span class="post-date">${formatDate(post.timestamp)}</span>
                </div>
            </div>
            <p class="post-content">${content}</p>
            <div class="post-actions">
                <button class="like-btn" data-post-id="${post.id}">
                    <i class="fas fa-heart"></i> ${post.likes}
                </button>
            </div>
            <div class="comments-section">
                <h4>Comments (${post.comments.length})</h4>
                <div class="comments-list">
                    ${post.comments.map(comment => `
                        <div class="comment">
                            <div class="comment-header">
                                <span class="comment-author">${comment.author}</span>
                                <span class="comment-date">${formatDate(comment.timestamp)}</span>
                            </div>
                            <p class="comment-content">${comment.content}</p>
                            <div class="comment-actions">
                                <button class="like-btn" data-comment-id="${comment.id}">
                                    <i class="fas fa-heart"></i> ${comment.likes}
                                </button>
                                <button class="reply-btn" data-comment-id="${comment.id}">
                                    <i class="fas fa-reply"></i> Reply
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="comment-input-container">
                    <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                    <button class="submit-btn" data-post-id="${post.id}">Post</button>
                </div>
            </div>
        `;
        
        forumPosts.insertBefore(postElement, forumPosts.firstChild);
        postModal.remove();
    });
    
    // Handle cancel button
    const cancelBtn = postModal.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', () => {
        postModal.remove();
    });
});

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Games Section Functions
function initializeGames() {
    console.log('Initializing Games section...');
    
    // Add click listeners to all game buttons
    document.querySelectorAll('.game-card .play-btn').forEach(btn => {
        const gameCard = btn.closest('.game-card');
        const gameType = gameCard.dataset.game;
        console.log(`Setting up ${gameType} game button...`);
        
        btn.addEventListener('click', () => {
            switch(gameType) {
                case 'color':
                    startColorGame();
                    break;
                case 'memory':
                    startMemoryGame();
                    break;
                case 'counting':
                    startCountingGame();
                    break;
                case 'shapes':
                    startShapeGame();
                    break;
            }
        });
    });
}

function startColorGame() {
    const colors = [
        { name: 'Red', value: '#FF0000' },
        { name: 'Blue', value: '#0000FF' },
        { name: 'Green', value: '#00FF00' },
        { name: 'Yellow', value: '#FFFF00' },
        { name: 'Purple', value: '#800080' },
        { name: 'Orange', value: '#FFA500' },
        { name: 'Pink', value: '#FFC0CB' },
        { name: 'Brown', value: '#A52A2A' }
    ];

    let score = 0;
    let currentColor = null;
    let timeLeft = 60;
    let gameInterval = null;

    const gameModal = document.createElement('div');
    gameModal.className = 'game-modal';
    gameModal.innerHTML = `
        <div class="game-content">
            <h3>Color Recognition Game</h3>
            <div class="game-stats">
                <div>Score: <span id="color-score">0</span></div>
                <div>Time: <span id="color-time">60</span>s</div>
            </div>
            <div class="color-display" id="current-color"></div>
            <div class="color-options" id="color-options"></div>
            <button class="close-game">Close Game</button>
        </div>
    `;

    document.body.appendChild(gameModal);

    const updateScore = () => {
        document.getElementById('color-score').textContent = score;
    };

    const updateTime = () => {
        document.getElementById('color-time').textContent = timeLeft;
    };

    const showNewColor = () => {
        currentColor = colors[Math.floor(Math.random() * colors.length)];
        const colorDisplay = document.getElementById('current-color');
        colorDisplay.style.backgroundColor = currentColor.value;
        colorDisplay.style.width = '200px';
        colorDisplay.style.height = '200px';
        colorDisplay.style.margin = '2rem auto';
        colorDisplay.style.borderRadius = '15px';
        colorDisplay.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

        const optionsContainer = document.getElementById('color-options');
        optionsContainer.innerHTML = '';
        optionsContainer.style.display = 'grid';
        optionsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        optionsContainer.style.gap = '1rem';
        optionsContainer.style.width = '100%';
        optionsContainer.style.maxWidth = '400px';
        optionsContainer.style.margin = '2rem auto';

        // Generate 4 options including the correct one
        const options = [currentColor.name];
        while (options.length < 4) {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            if (!options.includes(randomColor.name)) {
                options.push(randomColor.name);
            }
        }

        // Shuffle options
        options.sort(() => Math.random() - 0.5);

        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'color-option';
            button.textContent = option;
            button.style.backgroundColor = 'var(--card-bg)';
            button.style.color = 'var(--text-color)';
            button.style.padding = '1rem';
            button.style.border = '2px solid var(--border-color)';
            button.style.borderRadius = '15px';
            button.style.fontSize = '1.2rem';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s ease';
            button.style.width = '100%';
            button.style.textAlign = 'center';
            button.style.fontWeight = '500';


            button.onclick = () => {
                if (option === currentColor.name) {
                    score += 10;
                    updateScore();
                    button.style.backgroundColor = 'var(--success-color)';
                    button.style.color = 'white';
                    setTimeout(() => {
                        button.style.backgroundColor = 'var(--card-bg)';
                        button.style.color = 'var(--text-color)';
                        showNewColor();
                    }, 500);
                } else {
                    button.style.backgroundColor = 'var(--danger-color)';
                    button.style.color = 'white';
                    setTimeout(() => {
                        button.style.backgroundColor = 'var(--card-bg)';
                        button.style.color = 'var(--text-color)';
                    }, 500);
                }
            };
            optionsContainer.appendChild(button);
        });
    };

    // Start the game
    showNewColor();
    updateScore();
    updateTime();

    gameInterval = setInterval(() => {
        timeLeft--;
        updateTime();
        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            gameModal.remove();
            showGameOverModal('color', score);
        }
    }, 1000);

    // Close game button
    gameModal.querySelector('.close-game').onclick = () => {
        clearInterval(gameInterval);
        gameModal.remove();
        showGameOverModal('color', score);
    };
}

function startMemoryGame() {
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const cards = [...emojis, ...emojis];
    let flippedCards = [];
    let matchedPairs = 0;
    let score = 0;
    let timeLeft = 60;
    let gameInterval = null;

    const gameModal = document.createElement('div');
    gameModal.className = 'game-modal';
    gameModal.innerHTML = `
        <div class="game-content">
            <h3>Memory Match Game</h3>
            <div class="game-stats">
                <div>Score: <span id="memory-score">0</span></div>
                <div>Time: <span id="memory-time">60</span>s</div>
            </div>
            <div class="memory-grid" id="memory-grid"></div>
            <button class="close-game">Close Game</button>
        </div>
    `;

    document.body.appendChild(gameModal);

    const updateScore = () => {
        document.getElementById('memory-score').textContent = score;
    };

    const updateTime = () => {
        document.getElementById('memory-time').textContent = timeLeft;
    };

    const memoryGrid = document.getElementById('memory-grid');
    memoryGrid.style.display = 'grid';
    memoryGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    memoryGrid.style.gap = '1rem';
    memoryGrid.style.width = '100%';
    memoryGrid.style.maxWidth = '600px';
    memoryGrid.style.margin = '2rem auto';

    // Shuffle cards
    cards.sort(() => Math.random() - 0.5);

    // Create cards
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.cardIndex = index;
        card.style.width = '100%';
        card.style.aspectRatio = '1';
        card.style.perspective = '1000px';
        card.style.cursor = 'pointer';

        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';
        cardInner.style.position = 'relative';
        cardInner.style.width = '100%';
        cardInner.style.height = '100%';
        cardInner.style.textAlign = 'center';
        cardInner.style.transition = 'transform 0.6s';
        cardInner.style.transformStyle = 'preserve-3d';
        cardInner.style.backgroundColor = 'var(--primary-color)';
        cardInner.style.borderRadius = '15px';
        cardInner.style.display = 'flex';
        cardInner.style.alignItems = 'center';
        cardInner.style.justifyContent = 'center';
        cardInner.style.fontSize = '3rem';
        cardInner.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.style.position = 'absolute';
        cardFront.style.width = '100%';
        cardFront.style.height = '100%';
        cardFront.style.backfaceVisibility = 'hidden';
        cardFront.style.backgroundColor = 'var(--primary-color)';
        cardFront.style.borderRadius = '15px';
        cardFront.style.display = 'flex';
        cardFront.style.alignItems = 'center';
        cardFront.style.justifyContent = 'center';
        cardFront.style.fontSize = '3rem';

        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.style.position = 'absolute';
        cardBack.style.width = '100%';
        cardBack.style.height = '100%';
        cardBack.style.backfaceVisibility = 'hidden';
        cardBack.style.backgroundColor = 'var(--card-bg)';
        cardBack.style.borderRadius = '15px';
        cardBack.style.display = 'flex';
        cardBack.style.alignItems = 'center';
        cardBack.style.justifyContent = 'center';
        cardBack.style.fontSize = '3rem';
        cardBack.style.transform = 'rotateY(180deg)';
        cardBack.textContent = emoji;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        memoryGrid.appendChild(card);

        card.addEventListener('click', () => {
            if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
                flipCard(card);
            }
        });
    });

    function flipCard(card) {
        card.classList.add('flipped');
        card.querySelector('.card-inner').style.transform = 'rotateY(180deg)';
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 1000);
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;
        const emoji1 = card1.querySelector('.card-back').textContent;
        const emoji2 = card2.querySelector('.card-back').textContent;

        if (emoji1 === emoji2) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            card1.querySelector('.card-inner').style.backgroundColor = 'var(--success-color)';
            card2.querySelector('.card-inner').style.backgroundColor = 'var(--success-color)';
            score += 10;
            updateScore();
            matchedPairs++;

            if (matchedPairs === emojis.length) {
                clearInterval(gameInterval);
                gameModal.remove();
                showGameOverModal('memory', score);
            }
        } else {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.querySelector('.card-inner').style.transform = 'rotateY(0deg)';
            card2.querySelector('.card-inner').style.transform = 'rotateY(0deg)';
        }

        flippedCards = [];
    }

    // Start timer
    updateScore();
    updateTime();

    gameInterval = setInterval(() => {
        timeLeft--;
        updateTime();
        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            gameModal.remove();
            showGameOverModal('memory', score);
        }
    }, 1000);

    // Close game button
    gameModal.querySelector('.close-game').onclick = () => {
        clearInterval(gameInterval);
        gameModal.remove();
        showGameOverModal('memory', score);
    };
}

function startCountingGame() {
    const numberWords = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
    let score = 0;
    let currentNumber = 0;
    let timeLeft = 60;
    let gameInterval = null;

    const gameModal = document.createElement('div');
    gameModal.className = 'game-modal';
    gameModal.innerHTML = `
        <div class="game-content">
            <h3>Counting Fun</h3>
            <div class="game-stats">
                <div>Score: <span id="counting-score">0</span></div>
                <div>Time: <span id="counting-time">60</span>s</div>
            </div>
            <div class="number-display" id="number-display"></div>
            <div class="counting-options" id="counting-options"></div>
            <button class="close-game">Close Game</button>
        </div>
    `;

    document.body.appendChild(gameModal);

    const updateScore = () => {
        document.getElementById('counting-score').textContent = score;
    };

    const updateTime = () => {
        document.getElementById('counting-time').textContent = timeLeft;
    };

    const showNewNumber = () => {
        currentNumber = Math.floor(Math.random() * 10) + 1;
        const numberDisplay = document.getElementById('number-display');
        numberDisplay.textContent = currentNumber;
        numberDisplay.style.fontSize = '6rem';
        numberDisplay.style.color = 'var(--primary-color)';
        numberDisplay.style.display = 'flex';
        numberDisplay.style.alignItems = 'center';
        numberDisplay.style.justifyContent = 'center';
        numberDisplay.style.padding = '2rem';
        numberDisplay.style.backgroundColor = 'var(--card-bg)';
        numberDisplay.style.borderRadius = '20px';
        numberDisplay.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
        numberDisplay.style.margin = '2rem auto';
        numberDisplay.style.minWidth = '200px';
        numberDisplay.style.border = '3px solid var(--primary-color)';

        const correctWord = numberWords[currentNumber - 1];
        const options = [correctWord];

        while (options.length < 4) {
            const rand = Math.floor(Math.random() * 10);
            const word = numberWords[rand];
            if (!options.includes(word)) {
                options.push(word);
            }
        }

        options.sort(() => Math.random() - 0.5);

        const optionsContainer = document.getElementById('counting-options');
        optionsContainer.innerHTML = '';
        optionsContainer.style.display = 'grid';
        optionsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        optionsContainer.style.gap = '1rem';
        optionsContainer.style.width = '100%';
        optionsContainer.style.maxWidth = '400px';
        optionsContainer.style.margin = '2rem auto';

        options.forEach(word => {
            const button = document.createElement('button');
            button.className = 'counting-option';
            button.textContent = word;
            button.style.backgroundColor = 'var(--card-bg)';
            button.style.color = 'var(--text-color)';
            button.style.padding = '1rem';
            button.style.border = '2px solid var(--border-color)';
            button.style.borderRadius = '15px';
            button.style.fontSize = '1.2rem';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s ease';
            button.style.width = '100%';
            button.style.textAlign = 'center';
            button.style.fontWeight = '500';

            button.onclick = () => {
                if (word === correctWord) {
                    score += 10;
                    updateScore();
                    button.style.backgroundColor = 'var(--success-color)';
                    button.style.color = 'white';
                    setTimeout(() => {
                        button.style.backgroundColor = 'var(--card-bg)';
                        button.style.color = 'var(--text-color)';
                        showNewNumber();
                    }, 500);
                } else {
                    button.style.backgroundColor = 'var(--danger-color)';
                    button.style.color = 'white';
                    setTimeout(() => {
                        button.style.backgroundColor = 'var(--card-bg)';
                        button.style.color = 'var(--text-color)';
                    }, 500);
                }
            };
            optionsContainer.appendChild(button);
        });
    };

    // Start the game
    showNewNumber();
    updateScore();
    updateTime();

    gameInterval = setInterval(() => {
        timeLeft--;
        updateTime();
        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            gameModal.remove();
            showGameOverModal('counting', score);
        }
    }, 1000);

    // Close game button
    gameModal.querySelector('.close-game').onclick = () => {
        clearInterval(gameInterval);
        gameModal.remove();
        showGameOverModal('counting', score);
    };
}

function startShapeGame() {
    const shapes = [
        { name: 'Circle', icon: 'fa-circle' },
        { name: 'Square', icon: 'fa-square' },
        { name: 'Triangle', icon: 'fa-triangle' },
        { name: 'Star', icon: 'fa-star' },
        { name: 'Heart', icon: 'fa-heart' },
        { name: 'Diamond', icon: 'fa-diamond' }
    ];

    let score = 0;
    let currentShape = null;
    let timeLeft = 60;
    let gameInterval = null;

    const gameModal = document.createElement('div');
    gameModal.className = 'game-modal';
    gameModal.innerHTML = `
        <div class="game-content">
            <h3>Shape Recognition Game</h3>
            <div class="game-stats">
                <div>Score: <span id="shape-score">0</span></div>
                <div>Time: <span id="shape-time">60</span>s</div>
            </div>
            <div class="shape-display" id="current-shape"></div>
            <div class="shape-options" id="shape-options"></div>
            <button class="close-game">Close Game</button>
        </div>
    `;

    document.body.appendChild(gameModal);

    const updateScore = () => {
        document.getElementById('shape-score').textContent = score;
    };

    const updateTime = () => {
        document.getElementById('shape-time').textContent = timeLeft;
    };

    const showNewShape = () => {
        currentShape = shapes[Math.floor(Math.random() * shapes.length)];
        const shapeDisplay = document.getElementById('current-shape');
        shapeDisplay.innerHTML = `<i class="fas ${currentShape.icon}"></i>`;
        shapeDisplay.style.fontSize = '6rem';
        shapeDisplay.style.color = 'var(--primary-color)';
        shapeDisplay.style.display = 'flex';
        shapeDisplay.style.alignItems = 'center';
        shapeDisplay.style.justifyContent = 'center';
        shapeDisplay.style.padding = '2rem';
        shapeDisplay.style.backgroundColor = 'var(--card-bg)';
        shapeDisplay.style.borderRadius = '20px';
        shapeDisplay.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
        shapeDisplay.style.margin = '2rem auto';
        shapeDisplay.style.minWidth = '200px';
        shapeDisplay.style.border = '3px solid var(--primary-color)';

        const optionsContainer = document.getElementById('shape-options');
        optionsContainer.innerHTML = '';
        optionsContainer.style.display = 'grid';
        optionsContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        optionsContainer.style.gap = '1rem';
        optionsContainer.style.width = '100%';
        optionsContainer.style.maxWidth = '400px';
        optionsContainer.style.margin = '2rem auto';

        // Generate 4 options including the correct one
        const options = [currentShape.name];
        while (options.length < 4) {
            const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
            if (!options.includes(randomShape.name)) {
                options.push(randomShape.name);
            }
        }

        // Shuffle options
        options.sort(() => Math.random() - 0.5);

        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'shape-option';
            button.textContent = option;
            button.style.backgroundColor = 'var(--card-bg)';
            button.style.color = 'var(--text-color)';
            button.style.padding = '1rem';
            button.style.border = '2px solid var(--border-color)';
            button.style.borderRadius = '15px';
            button.style.fontSize = '1.2rem';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s ease';
            button.style.width = '100%';
            button.style.textAlign = 'center';
            button.style.fontWeight = '500';

            button.onclick = () => {
                if (option === currentShape.name) {
                    score += 10;
                    updateScore();
                    button.style.backgroundColor = 'var(--success-color)';
                    button.style.color = 'white';
                    setTimeout(() => {
                        button.style.backgroundColor = 'var(--card-bg)';
                        button.style.color = 'var(--text-color)';
                        showNewShape();
                    }, 500);
                } else {
                    button.style.backgroundColor = 'var(--danger-color)';
                    button.style.color = 'white';
                    setTimeout(() => {
                        button.style.backgroundColor = 'var(--card-bg)';
                        button.style.color = 'var(--text-color)';
                    }, 500);
                }
            };
            optionsContainer.appendChild(button);
        });
    };

    // Start the game
    showNewShape();
    updateScore();
    updateTime();

    gameInterval = setInterval(() => {
        timeLeft--;
        updateTime();
        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            gameModal.remove();
            showGameOverModal('shapes', score);
        }
    }, 1000);

    // Close game button
    gameModal.querySelector('.close-game').onclick = () => {
        clearInterval(gameInterval);
        gameModal.remove();
        showGameOverModal('shapes', score);
    };
}

// Growth Section Functions
function initializeGrowth() {
    console.log('Initializing Growth section...');
    
    // Initialize form and event listeners
    const milestoneForm = document.getElementById('milestone-form');
    const timelineFilter = document.getElementById('timeline-filter');
    const timelineSort = document.getElementById('timeline-sort');
    
    if (milestoneForm) {
        console.log('Setting up milestone form...');
        milestoneForm.addEventListener('submit', handleMilestoneSubmit);
    }
    
    if (timelineFilter) {
        timelineFilter.addEventListener('change', () => {
            console.log('Timeline filter changed:', timelineFilter.value);
            updateTimeline();
        });
    }
    
    if (timelineSort) {
        timelineSort.addEventListener('change', () => {
            console.log('Timeline sort changed:', timelineSort.value);
            updateTimeline();
        });
    }
    
    // Load initial data
    loadMilestones();
}

function handleMilestoneSubmit(event) {
    event.preventDefault();
    console.log('Handling milestone submission...');
    
    // Get form values
    const type = document.getElementById('milestone-type').value;
    const title = document.getElementById('milestone-title').value;
    const date = document.getElementById('milestone-date').value;
    const description = document.getElementById('milestone-description').value;
    const photoInput = document.getElementById('milestone-photo');
    
    // Create milestone object
    const milestone = {
        id: Date.now(),
        type: type,
        title: title,
        date: date,
        description: description,
        photo: photoInput.files[0] ? URL.createObjectURL(photoInput.files[0]) : null,
        timestamp: new Date(date).getTime()
    };
    
    console.log('New milestone:', milestone);
    
    // Save to localStorage
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    milestones.push(milestone);
    milestones.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem('milestones', JSON.stringify(milestones));
    
    // Update UI
    updateTimeline();
    updateDevelopmentSummary();
    
    // Reset form
    event.target.reset();
    
    // Show success message
    showNotification('Milestone added successfully!', 'success');
}

function loadMilestones() {
    console.log('Loading milestones...');
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    updateTimeline(milestones);
    updateDevelopmentSummary();
}

function updateTimeline(milestones = null) {
    console.log('Updating timeline...');
    
    // Get milestones from localStorage if not provided
    if (!milestones) {
        milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    }
    
    // Get DOM elements
    const timelineFilter = document.getElementById('timeline-filter');
    const timelineSort = document.getElementById('timeline-sort');
    const timelineContent = document.querySelector('.timeline-content');
    
    if (!timelineContent) {
        console.error('Timeline content element not found!');
        return;
    }
    
    // Filter milestones
    if (timelineFilter && timelineFilter.value !== 'all') {
        milestones = milestones.filter(m => m.type === timelineFilter.value);
    }
    
    // Sort milestones
    if (timelineSort) {
        milestones.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return timelineSort.value === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }
    
    // Render timeline
    if (milestones.length === 0) {
        timelineContent.innerHTML = '<div class="no-milestones">No milestones found. Add your first milestone!</div>';
        return;
    }
    
    timelineContent.innerHTML = milestones.map(milestone => `
        <div class="timeline-item" data-id="${milestone.id}">
            <div class="timeline-item-header">
                <span class="timeline-item-type ${milestone.type}">${milestone.type}</span>
                <span class="timestone-item-date">${new Date(milestone.date).toLocaleDateString()}</span>
                <div class="timeline-item-actions">
                    <button class="edit-milestone-btn" title="Edit Milestone">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-milestone-btn" title="Delete Milestone">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <h3 class="timeline-item-title">${milestone.title}</h3>
            <p class="timestone-item-description">${milestone.description}</p>
            ${milestone.photo ? `<img src="${milestone.photo}" alt="${milestone.title}" class="timeline-item-photo">` : ''}
        </div>
    `).join('');

    // Add event listeners for edit and delete buttons
    timelineContent.querySelectorAll('.edit-milestone-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const timelineItem = e.target.closest('.timeline-item');
            const milestoneId = parseInt(timelineItem.dataset.id);
            editMilestone(milestoneId);
        });
    });

    timelineContent.querySelectorAll('.delete-milestone-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const timelineItem = e.target.closest('.timeline-item');
            const milestoneId = parseInt(timelineItem.dataset.id);
            deleteMilestone(milestoneId);
        });
    });
    
    console.log('Timeline updated with', milestones.length, 'milestones');
}

function editMilestone(milestoneId) {
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    const milestone = milestones.find(m => m.id === milestoneId);
    
    if (!milestone) return;
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Milestone</h3>
            <form id="edit-milestone-form">
                <div class="form-group">
                    <label for="edit-milestone-type">Type</label>
                    <select id="edit-milestone-type" required>
                        <option value="physical" ${milestone.type === 'physical' ? 'selected' : ''}>Physical Development</option>
                        <option value="cognitive" ${milestone.type === 'cognitive' ? 'selected' : ''}>Cognitive Development</option>
                        <option value="social" ${milestone.type === 'social' ? 'selected' : ''}>Social Development</option>
                        <option value="language" ${milestone.type === 'language' ? 'selected' : ''}>Language Development</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-milestone-title">Title</label>
                    <input type="text" id="edit-milestone-title" value="${milestone.title}" required>
                </div>
                <div class="form-group">
                    <label for="edit-milestone-date">Date</label>
                    <input type="date" id="edit-milestone-date" value="${milestone.date}" required>
                </div>
                <div class="form-group">
                    <label for="edit-milestone-description">Description</label>
                    <textarea id="edit-milestone-description" required>${milestone.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="edit-milestone-photo">Photo (Optional)</label>
                    <input type="file" id="edit-milestone-photo" accept="image/*">
                </div>
                <div class="modal-buttons">
                    <button type="button" class="cancel-btn">Cancel</button>
                    <button type="submit" class="submit-btn">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    const form = modal.querySelector('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedMilestone = {
            ...milestone,
            type: document.getElementById('edit-milestone-type').value,
            title: document.getElementById('edit-milestone-title').value,
            date: document.getElementById('edit-milestone-date').value,
            description: document.getElementById('edit-milestone-description').value,
            timestamp: new Date(document.getElementById('edit-milestone-date').value).getTime()
        };
        
        // Handle photo if changed
        const photoInput = document.getElementById('edit-milestone-photo');
        if (photoInput.files[0]) {
            updatedMilestone.photo = URL.createObjectURL(photoInput.files[0]);
        }
        
        // Update milestone in localStorage
        const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
        const index = milestones.findIndex(m => m.id === milestoneId);
        if (index !== -1) {
            milestones[index] = updatedMilestone;
            localStorage.setItem('milestones', JSON.stringify(milestones));
            
            // Update UI
            updateTimeline();
            updateDevelopmentSummary();
            showNotification('Milestone updated successfully!', 'success');
        }
        
        modal.remove();
    });
    
    // Handle cancel button
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
}

function deleteMilestone(milestoneId) {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    const updatedMilestones = milestones.filter(m => m.id !== milestoneId);
    localStorage.setItem('milestones', JSON.stringify(updatedMilestones));
    
    // Update UI
    updateTimeline();
    updateDevelopmentSummary();
    showNotification('Milestone deleted successfully!', 'success');
}

function updateDevelopmentSummary() {
    console.log('Updating development summary...');
    
    // Get milestones from localStorage
    const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
    
    // Get summary cards
    const summaryCards = document.querySelectorAll('.summary-card');
    
    if (!summaryCards.length) {
        console.error('Summary cards not found!');
        return;
    }
    
    // Count milestones by type
    const counts = {
        physical: milestones.filter(m => m.type === 'physical').length,
        cognitive: milestones.filter(m => m.type === 'cognitive').length,
        social: milestones.filter(m => m.type === 'social').length,
        language: milestones.filter(m => m.type === 'language').length
    };
    
    console.log('Milestone counts:', counts);
    
    // Update each summary card
    summaryCards.forEach(card => {
        // Get the type from the card's h4 text content
        const type = card.querySelector('h4').textContent.toLowerCase();
        const countElement = card.querySelector('.milestone-count');
        const progressElement = card.querySelector('.progress');
        
        console.log(`Updating card for type: ${type}`);
        
        if (countElement) {
            const count = counts[type] || 0;
            countElement.textContent = count;
            console.log(`Updated count for ${type}: ${count}`);
        }
        
        if (progressElement) {
            const percentage = Math.min(((counts[type] || 0) / 20) * 100, 100);
            progressElement.style.width = `${percentage}%`;
            console.log(`Updated progress for ${type}: ${percentage}%`);
        }
    });
    
    console.log('Development summary updated');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize Forum
function initializeForum() {
    console.log('Initializing Forum section...');
    
    const forumSection = document.getElementById('community');
    if (!forumSection) {
        console.error('Forum section not found!');
        return;
    }

    // Add event listeners for new post and search
    const newPostBtn = forumSection.querySelector('.new-post-btn');
    const searchInput = forumSection.querySelector('.search-input');

    if (newPostBtn) {
        console.log('Setting up new post button...');
        newPostBtn.addEventListener('click', showNewPostModal);
    }

    if (searchInput) {
        console.log('Setting up search input...');
        searchInput.addEventListener('input', (e) => filterPosts(e.target.value));
    }

    // Initial render of posts
    renderPosts();
}

function renderPosts() {
    console.log('Rendering forum posts...');
    
    const postsContainer = document.querySelector('.forum-posts');
    if (!postsContainer) {
        console.error('Posts container not found!');
        return;
    }

    // Clear existing content
    postsContainer.innerHTML = '';

    // Add each post
    forumData.posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'forum-post';
        postElement.dataset.postId = post.id;
        
        postElement.innerHTML = `
            <div class="post-header">
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span class="post-author">${post.author}</span>
                    <span class="post-date">${formatDate(post.timestamp)}</span>
                </div>
            </div>
            <p class="post-content">${post.content}</p>
            <div class="post-actions">
                <button class="like-btn" data-post-id="${post.id}">
                    <i class="fas fa-heart"></i> ${post.likes}
                </button>
            </div>
            <div class="comments-section">
                <h4>Comments (${post.comments.length})</h4>
                <div class="comments-list">
                    ${post.comments.map(comment => `
                        <div class="comment">
                            <div class="comment-header">
                                <span class="comment-author">${comment.author}</span>
                                <span class="comment-date">${formatDate(comment.timestamp)}</span>
                            </div>
                            <p class="comment-content">${comment.content}</p>
                            <div class="comment-actions">
                                <button class="like-btn" data-comment-id="${comment.id}">
                                    <i class="fas fa-heart"></i> ${comment.likes}
                                </button>
                                <button class="reply-btn" data-comment-id="${comment.id}">
                                    <i class="fas fa-reply"></i> Reply
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="comment-input-container" style="display: none;">
                    <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                    <button class="submit-btn" data-post-id="${post.id}" style="display: none;">Post</button>
                </div>
            </div>
        `;
        
        postsContainer.appendChild(postElement);
    });

    // Add event listeners for likes and comments
    addForumEventListeners();
}

function showNewPostModal() {
    console.log('Showing new post modal...');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Create New Post</h3>
            <form id="new-post-form">
                <input type="text" placeholder="Title" required>
                <textarea placeholder="Write your post..." required></textarea>
                <div class="modal-buttons">
                    <button type="button" class="cancel-btn">Cancel</button>
                    <button type="submit" class="submit-btn">Post</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = modal.querySelector('form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = form.querySelector('input').value;
        const content = form.querySelector('textarea').value;
        
        const newPost = {
            id: Date.now(),
            title,
            content,
            author: "You",
            timestamp: Date.now(),
            likes: 0,
            comments: []
        };
        
        forumData.posts.unshift(newPost);
        renderPosts();
        modal.remove();
        showNotification('Post created successfully!', 'success');
    });
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        modal.remove();
    });
}

function addForumEventListeners() {
    console.log('Adding forum event listeners...');
    
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', handleLike);
    });
    
    // Comment submission
    document.querySelectorAll('.comment-input').forEach(input => {
        input.addEventListener('input', handleCommentInput);
    });
    
    // Reply buttons
    document.querySelectorAll('.reply-btn').forEach(btn => {
        btn.addEventListener('click', handleReply);
    });
}

function handleCommentInput(e) {
    const input = e.target;
    const submitBtn = input.closest('.comment-input-container').querySelector('.submit-btn');
    submitBtn.style.display = input.value.trim() ? 'block' : 'none';
}

function handleReply(e) {
    const btn = e.target.closest('.reply-btn');
    const commentId = parseInt(btn.dataset.commentId);
    const post = forumData.posts.find(p => p.comments.some(c => c.id === commentId));
    
    if (post) {
        const inputContainer = btn.closest('.comments-section').querySelector('.comment-input-container');
        const input = inputContainer.querySelector('.comment-input');
        const submitBtn = inputContainer.querySelector('.submit-btn');
        
        // Show input container
        inputContainer.style.display = 'flex';
        
        // Focus input and set placeholder
        input.focus();
        input.placeholder = `Replying to ${post.comments.find(c => c.id === commentId).author}...`;
        input.dataset.replyTo = commentId;
        
        // Hide submit button initially
        submitBtn.style.display = 'none';

        // Add click outside listener
        const handleClickOutside = (event) => {
            if (!inputContainer.contains(event.target) && event.target !== btn) {
                inputContainer.style.display = 'none';
                input.value = '';
                document.removeEventListener('click', handleClickOutside);
            }
        };

        // Add a small delay to prevent immediate trigger
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);
    }
}

function handleCommentSubmit(e) {
    const btn = e.target;
    const postId = parseInt(btn.dataset.postId);
    const post = forumData.posts.find(p => p.id === postId);
    const input = btn.previousElementSibling;
    const content = input.value.trim();
    
    if (content && post) {
        const newComment = {
            id: Date.now(),
            author: "You",
            content,
            timestamp: Date.now(),
            likes: 0
        };
        
        post.comments.push(newComment);
        renderPosts();
        
        // Hide input container after successful comment
        const inputContainer = input.closest('.comment-input-container');
        inputContainer.style.display = 'none';
        
        showNotification('Comment added successfully!', 'success');
    }
}

function handleLike(e) {
    const btn = e.target.closest('.like-btn');
    const postId = btn.dataset.postId;
    const commentId = btn.dataset.commentId;
    
    if (postId) {
        const post = forumData.posts.find(p => p.id === parseInt(postId));
        if (post) {
            post.likes++;
            btn.innerHTML = `<i class="fas fa-heart"></i> ${post.likes}`;
            showNotification('Post liked!', 'success');
        }
    } else if (commentId) {
        const post = forumData.posts.find(p => p.comments.some(c => c.id === parseInt(commentId)));
        if (post) {
            const comment = post.comments.find(c => c.id === parseInt(commentId));
            if (comment) {
                comment.likes++;
                btn.innerHTML = `<i class="fas fa-heart"></i> ${comment.likes}`;
                showNotification('Comment liked!', 'success');
            }
        }
    }
}

function filterPosts(searchTerm) {
    console.log('Filtering posts with term:', searchTerm);
    
    const postsContainer = document.querySelector('.forum-posts');
    if (!postsContainer) {
        console.error('Posts container not found!');
        return;
    }

    // If search term is empty, show all posts
    if (!searchTerm.trim()) {
        renderPosts();
        return;
    }

    // Convert search term to lowercase for case-insensitive search
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Filter posts based on search term
    const filteredPosts = forumData.posts.filter(post => {
        const titleMatch = post.title.toLowerCase().includes(searchLower);
        const contentMatch = post.content.toLowerCase().includes(searchLower);
        const commentMatch = post.comments.some(comment => 
            comment.content.toLowerCase().includes(searchLower)
        );
        
        return titleMatch || contentMatch || commentMatch;
    });
    
    // Clear existing content
    postsContainer.innerHTML = '';
    
    if (filteredPosts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-search"></i>
                <p>No posts found matching "${searchTerm}"</p>
            </div>
        `;
        return;
    }
    
    // Render filtered posts
    filteredPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'forum-post';
        postElement.dataset.postId = post.id;
        
        postElement.innerHTML = `
            <div class="post-header">
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span class="post-author">${post.author}</span>
                    <span class="post-date">${formatDate(post.timestamp)}</span>
                </div>
            </div>
            <p class="post-content">${post.content}</p>
            <div class="post-actions">
                <button class="like-btn" data-post-id="${post.id}">
                    <i class="fas fa-heart"></i> ${post.likes}
                </button>
            </div>
            <div class="comments-section">
                <h4>Comments (${post.comments.length})</h4>
                <div class="comments-list">
                    ${post.comments.map(comment => `
                        <div class="comment">
                            <div class="comment-header">
                                <span class="comment-author">${comment.author}</span>
                                <span class="comment-date">${formatDate(comment.timestamp)}</span>
                            </div>
                            <p class="comment-content">${comment.content}</p>
                            <div class="comment-actions">
                                <button class="like-btn" data-comment-id="${comment.id}">
                                    <i class="fas fa-heart"></i> ${comment.likes}
                                </button>
                                <button class="reply-btn" data-comment-id="${comment.id}">
                                    <i class="fas fa-reply"></i> Reply
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="comment-input-container" style="display: none;">
                    <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                    <button class="submit-btn" data-post-id="${post.id}" style="display: none;">Post</button>
                </div>
            </div>
        `;
        
        postsContainer.appendChild(postElement);
    });

    // Add event listeners for the filtered posts
    addForumEventListeners();
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return date.toLocaleDateString();
}

// Settings Management
function initializeSettings() {
    console.log('Initializing settings...');
    
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        Object.assign(appSettings, JSON.parse(savedSettings));
    }

    // Apply saved settings
    applySettings();
    setupSettingsListeners();
}

// Apply settings to the app
function applySettings() {
    // Apply dark mode
    if (appSettings.darkMode) {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // Apply font size
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    document.body.classList.add(`font-size-${appSettings.fontSize}`);

    // Update UI elements to reflect current settings
    const darkModeToggle = document.querySelector('#darkModeToggle');
    const fontSizeSelect = document.querySelector('#font-size-select');
    const healthRemindersToggle = document.querySelector('#healthRemindersToggle');
    const milestoneAlertsToggle = document.querySelector('#milestoneAlertsToggle');

    if (darkModeToggle) darkModeToggle.checked = appSettings.darkMode;
    if (fontSizeSelect) fontSizeSelect.value = appSettings.fontSize;
    if (healthRemindersToggle) healthRemindersToggle.checked = appSettings.healthReminders;
    if (milestoneAlertsToggle) milestoneAlertsToggle.checked = appSettings.milestoneAlerts;
}

// Setup settings event listeners
function setupSettingsListeners() {
    // Dark mode toggle
    const darkModeToggle = document.querySelector('#darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            appSettings.darkMode = e.target.checked;
            saveSettings();
            applySettings();
            showNotification('Dark mode ' + (appSettings.darkMode ? 'enabled' : 'disabled'));
        });
    }

    // Font size select
    const fontSizeSelect = document.querySelector('#font-size-select');
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            appSettings.fontSize = e.target.value;
            saveSettings();
            applySettings();
            showNotification('Font size updated');
        });
    }

    // Health reminders toggle
    const healthRemindersToggle = document.querySelector('#healthRemindersToggle');
    if (healthRemindersToggle) {
        healthRemindersToggle.addEventListener('change', (e) => {
            appSettings.healthReminders = e.target.checked;
            saveSettings();
            showNotification('Health reminders ' + (appSettings.healthReminders ? 'enabled' : 'disabled'));
        });
    }

    // Milestone alerts toggle
    const milestoneAlertsToggle = document.querySelector('#milestoneAlertsToggle');
    if (milestoneAlertsToggle) {
        milestoneAlertsToggle.addEventListener('change', (e) => {
            appSettings.milestoneAlerts = e.target.checked;
            saveSettings();
            showNotification('Milestone alerts ' + (appSettings.milestoneAlerts ? 'enabled' : 'disabled'));
        });
    }

    // Export data button
    const exportDataBtn = document.querySelector('.export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportAllData);
    }

    // Import data button
    const importDataBtn = document.querySelector('.import-data-btn');
    const importDataInput = document.querySelector('#import-data-input');
    
    if (importDataBtn && importDataInput) {
        importDataBtn.addEventListener('click', () => {
            importDataInput.click();
        });
        
        importDataInput.addEventListener('change', handleDataImport);
    }

    // Clear data button
    const clearDataBtn = document.querySelector('.clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
    }

    // Privacy policy button
    const privacyPolicyBtn = document.querySelector('.privacy-policy-btn');
    if (privacyPolicyBtn) {
        privacyPolicyBtn.addEventListener('click', showPrivacyPolicy);
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
}

// Export all data
function exportAllData() {
    const data = {
        healthData: healthData,
        milestones: JSON.parse(localStorage.getItem('milestones') || '[]'),
        settings: appSettings,
        highScores: highScores
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'giggles-to-growth-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully', 'success');
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        // Clear health data
        healthData = {
            Weight: [],
            Height: [],
            Temperature: []
        };
        localStorage.removeItem('healthData');
        
        // Clear milestones
        localStorage.removeItem('milestones');
        
        // Clear high scores
        highScores = {
            counting: [],
            color: [],
            memory: [],
            shapes: []
        };
        Object.keys(highScores).forEach(game => {
            localStorage.removeItem(`${game}HighScores`);
        });
        
        // Reset settings to default
        appSettings = {
            darkMode: false,
            fontSize: 'medium',
            healthReminders: true,
            milestoneAlerts: true
        };
        localStorage.removeItem('appSettings');
        
        // Apply default settings
        applySettings();
        
        // Update UI
        updateAllCharts();
        updateAllRecords();
        updateHealthSummary();
        updateTimeline();
        updateDevelopmentSummary();
        
        showNotification('All data cleared successfully', 'success');
    }
}

// Show privacy policy
function showPrivacyPolicy() {
    const modal = document.createElement('div');
    modal.className = 'modal privacy-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Privacy Policy</h3>
            <div class="privacy-content">
                <p>Your privacy is important to us. This app stores all data locally on your device. We do not collect or share any personal information.</p>
                <h4>Data Storage</h4>
                <p>All data is stored in your browser's local storage and is not transmitted to any servers. This means your information stays on your device and is not accessible to anyone else.</p>
                <h4>Data Usage</h4>
                <p>The data you enter is used solely for the purpose of tracking your child's development and providing you with insights. We do not use this data for any other purposes.</p>
                <h4>Data Export</h4>
                <p>You can export all your data at any time using the export feature in settings. This allows you to keep a backup of your information or transfer it to another device.</p>
                <h4>Data Security</h4>
                <p>Since all data is stored locally on your device, it is protected by your device's security measures. We recommend keeping your device secure and regularly backing up your data.</p>
            </div>
            <button class="close-modal">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
}

function updateHighScores(gameType, score) {
    highScores[gameType].push({
        score: score,
        date: new Date().toLocaleDateString()
    });
    highScores[gameType].sort((a, b) => b.score - a.score);
    highScores[gameType] = highScores[gameType].slice(0, 3);
    localStorage.setItem(`${gameType}HighScores`, JSON.stringify(highScores[gameType]));
    return highScores[gameType];
}

function showGameOverModal(gameType, score) {
    const scores = updateHighScores(gameType, score);
    const gameOverModal = document.createElement('div');
    gameOverModal.className = 'game-modal';
    gameOverModal.innerHTML = `
        <div class="game-content">
            <h3>Game Over!</h3>
            <div class="final-score">
                <h4>Your Score: ${score}</h4>
            </div>
            <div class="high-scores">
                <h4>High Scores</h4>
                <div class="scores-list">
                    ${scores.map((score, index) => `
                        <div class="score-item ${score.score === score ? 'current-score' : ''}">
                            <span class="rank">#${index + 1}</span>
                            <span class="score">${score.score}</span>
                            <span class="date">${score.date}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <button class="close-game">Close</button>
        </div>
    `;
    document.body.appendChild(gameOverModal);
    
    const style = document.createElement('style');
    style.textContent = `
        .final-score {
            font-size: 2rem;
            color: var(--primary-color);
            margin: 1rem 0;
            text-align: center;
        }
        .high-scores {
            margin: 2rem 0;
            text-align: center;
        }
        .scores-list {
            margin-top: 1rem;
        }
        .score-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 1rem;
            margin: 0.5rem 0;
            background: var(--card-bg);
            border-radius: 10px;
            border: 1px solid var(--border-color);
        }
        .score-item.current-score {
            background: var(--primary-color);
            color: white;
        }
        .rank {
            font-weight: bold;
            width: 40px;
        }
        .score {
            font-size: 1.2rem;
            font-weight: bold;
        }
        .date {
            color: var(--text-muted);
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
    
    gameOverModal.querySelector('.close-game').onclick = () => {
        gameOverModal.remove();
        style.remove();
    };
}

// Handle data import
function handleDataImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate the imported data structure
            if (!validateImportedData(data)) {
                showNotification('Invalid data format', 'error');
                return;
            }

            // Import health data
            if (data.healthData) {
                healthData = data.healthData;
                localStorage.setItem('healthData', JSON.stringify(healthData));
            }

            // Import milestones
            if (data.milestones) {
                localStorage.setItem('milestones', JSON.stringify(data.milestones));
            }

            // Import settings
            if (data.settings) {
                Object.assign(appSettings, data.settings);
                localStorage.setItem('appSettings', JSON.stringify(appSettings));
            }

            // Import high scores
            if (data.highScores) {
                Object.keys(data.highScores).forEach(game => {
                    highScores[game] = data.highScores[game];
                    localStorage.setItem(`${game}HighScores`, JSON.stringify(data.highScores[game]));
                });
            }

            // Apply settings and update UI
            applySettings();
            updateAllCharts();
            updateAllRecords();
            updateHealthSummary();
            updateTimeline();
            updateDevelopmentSummary();

            showNotification('Data imported successfully', 'success');
        } catch (error) {
            console.error('Error importing data:', error);
            showNotification('Error importing data. Please check the file format.', 'error');
        }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// Validate imported data structure
function validateImportedData(data) {
    // Check if data is an object
    if (typeof data !== 'object' || data === null) return false;

    // Check if required properties exist and have correct types
    if (data.healthData && typeof data.healthData !== 'object') return false;
    if (data.milestones && !Array.isArray(data.milestones)) return false;
    if (data.settings && typeof data.settings !== 'object') return false;
    if (data.highScores && typeof data.highScores !== 'object') return false;

    return true;
}

// Video Carousel
const videos = document.querySelectorAll('.carousel-video');
const dots = document.querySelectorAll('.video-dot');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentVideoIndex = 0;

function playNextVideo() {
    videos[currentVideoIndex].classList.remove('active');
    dots[currentVideoIndex].classList.remove('active');
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
    videos[currentVideoIndex].classList.add('active');
    dots[currentVideoIndex].classList.add('active');
    videos[currentVideoIndex].play();
}

function playPrevVideo() {
    videos[currentVideoIndex].classList.remove('active');
    dots[currentVideoIndex].classList.remove('active');
    currentVideoIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
    videos[currentVideoIndex].classList.add('active');
    dots[currentVideoIndex].classList.add('active');
    videos[currentVideoIndex].play();
}

function goToVideo(index) {
    videos[currentVideoIndex].classList.remove('active');
    dots[currentVideoIndex].classList.remove('active');
    currentVideoIndex = index;
    videos[currentVideoIndex].classList.add('active');
    dots[currentVideoIndex].classList.add('active');
    videos[currentVideoIndex].play();
}

// Add event listeners
videos.forEach(video => {
    video.addEventListener('ended', playNextVideo);
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToVideo(index));
});

prevBtn.addEventListener('click', playPrevVideo);
nextBtn.addEventListener('click', playNextVideo);

// Scroll to Top Button
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Settings Button
const settingsLink = document.querySelector('.settings-link');
settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('settings');
});

// Settings Navigation
const backBtn = document.querySelector('.back-btn');
const settingsSection = document.querySelector('.settings-section');

function showSettings() {
    document.body.classList.add('settings-active');
    settingsSection.classList.add('active');
    backBtn.style.display = 'flex';
    showSection('settings');
}

function hideSettings() {
    document.body.classList.remove('settings-active');
    settingsSection.classList.remove('active');
    backBtn.style.display = 'none';
    showSection('health'); // Return to health section by default
}

settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSettings();
});

backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    hideSettings();
});
