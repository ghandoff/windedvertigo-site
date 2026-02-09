// Application Data
const scenarioData = {
    scenarios: {
        plastic_packaging: {
            title: "Plastic Packaging U-Turn",
            brief: "You're working at a global food company under public pressure to reduce plastic packaging. A new compostable material exists, but it's 30% more expensive and untested at scale. You're the Sustainability Lead.",
            constraint: "Cost ceiling + public trust at risk",
            checkpoints: {
                1: {
                    title: "Government Regulation Surprise",
                    info: "A new regulation bans plastic bags within 6 months—sooner than expected.",
                    questions: [
                        "How might we build public trust while testing new solutions?",
                        "What's the quickest way to prototype a packaging solution?",
                        "Who do we need to bring in early to reduce resistance?"
                    ],
                    actions: [
                        "Run a fast public pilot of the compostable material in 3 regions",
                        "Delay the transition and lobby for a 12-month extension",
                        "Launch a co-design sprint with suppliers, retailers, and a youth climate group"
                    ]
                },
                2: {
                    title: "Backlash on Social Media",
                    info: "Your pilot was leaked. Influencers call it 'greenwashing.'",
                    questions: [
                        "What does this response reveal about deeper public concerns?",
                        "How can we shift the narrative through transparency?",
                        "What evidence do we need to build legitimacy now?"
                    ],
                    actions: [
                        "Publish internal testing results and next steps openly",
                        "Invite critics to a feedback session and redesign the rollout",
                        "Replace the pilot with a totally new circular packaging strategy"
                    ]
                }
            },
            outcomes: {
                environmental: "Compostable rollout reduces plastic use by 40%",
                public_perception: "Mixed trust—improved by transparency efforts",
                operational: "Medium risk: supply chain needs 2 months extra"
            },
            reflection_prompts: [
                "What was your most powerful question, and why?",
                "How did your perspective shift from Checkpoint 1 to 2?"
            ],
            scaffold: "Initially, I focused on ___. But as the situation evolved, I realized ___."
        },
        edtech_rollout: {
            title: "Equity in EdTech Rollout",
            brief: "You're rolling out a new EdTech product in a low-income school district. Early feedback shows it benefits high performers and widens gaps. You're the Innovation Officer.",
            constraint: "Limited training time + political pressure to scale fast",
            checkpoints: {
                1: {
                    title: "Board Pushes for Expansion",
                    info: "School board wants expansion to 30 more schools in 3 months—despite inconsistent usage data.",
                    questions: [
                        "Where are we overlooking student voices in this rollout?",
                        "What would equitable implementation look like?",
                        "What conditions must be in place before scaling?"
                    ],
                    actions: [
                        "Slow down and conduct rapid user research with diverse students",
                        "Scale now, but offer optional teacher micro-trainings",
                        "Pause rollout and redesign based on an equity audit"
                    ]
                },
                2: {
                    title: "Teachers Push Back",
                    info: "Teachers in 10 schools resist the tool and refuse to use it.",
                    questions: [
                        "How can we reframe the tool as supporting—not replacing—teachers?",
                        "What concerns are really behind this resistance?",
                        "How can we turn teachers into co-designers of the tool?"
                    ],
                    actions: [
                        "Host listening circles with teacher leaders",
                        "Reframe the tool publicly as teacher-centered",
                        "Offer mini-grants to teachers to build their own learning challenges using the tool"
                    ]
                }
            },
            outcomes: {
                learning_equity: "Mixed; improved where teachers had input",
                public_perception: "Trust up among educators, uncertain in media",
                operational: "Delays in expansion, but improved design model"
            },
            reflection_prompts: [
                "How did 'asking AI' help you adapt or respond to the situation?",
                "How did your perspective shift from Checkpoint 1 to 2?"
            ],
            scaffold: "I assumed ___. Now I see that asking ___ might have led to better outcomes."
        }
    },
    roles: ["CEO", "Innovation Officer", "Sustainability Lead"],
    badges: ["Curiosity Explorer", "Adaptability Ace", "Systems Thinker", "Inquiry Master"]
};

// Application State
let gameState = {
    selectedRole: null,
    selectedScenario: null,
    currentCheckpoint: 1,
    startTime: null,
    screenTimes: {},
    responses: {
        checkpoint1: {
            question: null,
            action: null,
            groupDiscussion: '',
            actionExplanation: '',
            aiAdvice: ''
        },
        checkpoint2: {
            question: null,
            action: null,
            groupDiscussion: '',
            actionExplanation: '',
            aiAdvice: ''
        },
        reflection: {
            answer1: '',
            answer2: ''
        }
    },
    earnedBadges: []
};

// Screen Management
const screens = {
    welcome: 0,
    roleSelection: 1,
    scenarioSelection: 2,
    missionBrief: 3,
    checkpoint1: 4,
    checkpoint2: 5,
    outcome: 6,
    reflection: 7,
    summary: 8
};

let currentScreen = 'welcome';
let currentScreenStartTime = Date.now();

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    gameState.startTime = Date.now();
    setupEventListeners();
    updateProgress();
    startTimeTracking();
});

function setupEventListeners() {
    // Role selection
    document.querySelectorAll('.role-card').forEach(card => {
        card.addEventListener('click', function() {
            selectRole(this.dataset.role);
        });
    });

    // Scenario selection
    document.querySelectorAll('.scenario-card').forEach(card => {
        card.addEventListener('click', function() {
            selectScenario(this.dataset.scenario);
        });
    });

    // Form validation
    document.addEventListener('input', validateCurrentScreen);
    document.addEventListener('change', validateCurrentScreen);
}

function selectRole(role) {
    gameState.selectedRole = role;
    
    // Update UI
    document.querySelectorAll('.role-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-role="${role}"]`).classList.add('selected');
    
    // Enable continue button
    document.getElementById('continueToScenario').disabled = false;
}

function selectScenario(scenario) {
    gameState.selectedScenario = scenario;
    
    // Update UI
    document.querySelectorAll('.scenario-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-scenario="${scenario}"]`).classList.add('selected');
    
    // Enable continue button
    document.getElementById('continueToMission').disabled = false;
}

function showScreen(screenId) {
    // Track time spent on current screen
    if (currentScreen) {
        const timeSpent = Date.now() - currentScreenStartTime;
        gameState.screenTimes[currentScreen] = timeSpent;
    }
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
    document.getElementById(screenId).classList.add('fade-in');
    
    currentScreen = screenId;
    currentScreenStartTime = Date.now();
    updateProgress();
    
    // Auto-scroll to top
    window.scrollTo(0, 0);
}

function showRoleSelection() {
    showScreen('roleSelection');
}

function showScenarioSelection() {
    showScreen('scenarioSelection');
}

function showMissionBrief() {
    // Populate mission brief
    document.getElementById('selectedRole').textContent = gameState.selectedRole;
    document.getElementById('selectedScenario').textContent = scenarioData.scenarios[gameState.selectedScenario].title;
    document.getElementById('scenarioBrief').textContent = scenarioData.scenarios[gameState.selectedScenario].brief;
    document.getElementById('scenarioConstraint').textContent = scenarioData.scenarios[gameState.selectedScenario].constraint;
    
    showScreen('missionBrief');
}

function showCheckpoint(checkpointNumber) {
    gameState.currentCheckpoint = checkpointNumber;
    const scenario = scenarioData.scenarios[gameState.selectedScenario];
    const checkpoint = scenario.checkpoints[checkpointNumber];
    
    // Update checkpoint content
    document.getElementById('checkpointTitle').textContent = `checkpoint ${checkpointNumber}`;
    document.getElementById('checkpointSituation').textContent = checkpoint.title;
    document.getElementById('checkpointDetails').textContent = checkpoint.info;
    
    // Populate questions
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    checkpoint.questions.forEach((question, index) => {
        const questionElement = createChoiceElement(question, 'question', index);
        questionsContainer.appendChild(questionElement);
    });
    
    // Populate actions
    const actionsContainer = document.getElementById('actionsContainer');
    actionsContainer.innerHTML = '';
    checkpoint.actions.forEach((action, index) => {
        const actionElement = createChoiceElement(action, 'action', index);
        actionsContainer.appendChild(actionElement);
    });
    
    // Clear form fields
    document.getElementById('groupDiscussion').value = '';
    document.getElementById('actionExplanation').value = '';
    document.getElementById('aiAdvice').value = '';
    
    // Disable continue button
    document.getElementById('continueCheckpoint').disabled = true;
    
    showScreen('checkpoint');
}

function createChoiceElement(text, type, index) {
    const element = document.createElement('div');
    element.className = 'choice-option';
    element.dataset.type = type;
    element.dataset.index = index;
    element.setAttribute('role', 'radio');
    element.setAttribute('tabindex', '0');
    element.setAttribute('aria-label', text);
    element.innerHTML = `<div class="choice-option-text">${text}</div>`;
    
    element.addEventListener('click', function() {
        // Remove selection from siblings
        this.parentNode.querySelectorAll('.choice-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Select this option
        this.classList.add('selected');
        
        // Store selection
        const checkpointKey = `checkpoint${gameState.currentCheckpoint}`;
        gameState.responses[checkpointKey][type] = index;
        
        validateCurrentScreen();
    });
    
    return element;
}

function continueFromCheckpoint() {
    // Save text responses
    const checkpointKey = `checkpoint${gameState.currentCheckpoint}`;
    gameState.responses[checkpointKey].groupDiscussion = document.getElementById('groupDiscussion').value;
    gameState.responses[checkpointKey].actionExplanation = document.getElementById('actionExplanation').value;
    gameState.responses[checkpointKey].aiAdvice = document.getElementById('aiAdvice').value;
    
    if (gameState.currentCheckpoint === 1) {
        showCheckpoint(2);
    } else {
        showOutcome();
    }
}

function showOutcome() {
    const scenario = scenarioData.scenarios[gameState.selectedScenario];
    const outcomes = scenario.outcomes;

    // Set outcome category based on scenario
    if (gameState.selectedScenario === 'plastic_packaging') {
        document.getElementById('outcomeCategory1').textContent = 'environmental';
        document.getElementById('outcomeResult1').textContent = outcomes.environmental;
    } else {
        document.getElementById('outcomeCategory1').textContent = 'learning equity';
        document.getElementById('outcomeResult1').textContent = outcomes.learning_equity;
    }

    document.getElementById('outcomeResult2').textContent = outcomes.public_perception;
    document.getElementById('outcomeResult3').textContent = outcomes.operational;

    showScreen('outcome');
}

function showReflection() {
    const scenario = scenarioData.scenarios[gameState.selectedScenario];
    
    // Set reflection prompts
    document.getElementById('reflectionPrompt1').textContent = scenario.reflection_prompts[0];
    document.getElementById('reflectionPrompt2').textContent = scenario.reflection_prompts[1];
    document.getElementById('scaffoldHelper').textContent = scenario.scaffold;
    
    // Clear fields
    document.getElementById('reflectionAnswer1').value = '';
    document.getElementById('reflectionAnswer2').value = '';
    
    showScreen('reflection');
}

function showSummary() {
    // Save reflection responses
    gameState.responses.reflection.answer1 = document.getElementById('reflectionAnswer1').value;
    gameState.responses.reflection.answer2 = document.getElementById('reflectionAnswer2').value;
    
    // Calculate badges
    calculateBadges();
    
    // Populate summary
    populateSummary();
    
    showScreen('summary');
}

function populateSummary() {
    const scenario = scenarioData.scenarios[gameState.selectedScenario];
    
    // Overview
    document.getElementById('summaryOverview').innerHTML = `
        <div class="summary-item">
            <div class="summary-label">role:</div>
            <div class="summary-value">${gameState.selectedRole}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">scenario:</div>
            <div class="summary-value">${scenario.title}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">total time:</div>
            <div class="summary-value">${formatTime(Date.now() - gameState.startTime)}</div>
        </div>
    `;
    
    // Checkpoint 1
    document.getElementById('summaryCheckpoint1').innerHTML = createCheckpointSummary(1);
    
    // Checkpoint 2
    document.getElementById('summaryCheckpoint2').innerHTML = createCheckpointSummary(2);
    
    // Reflections
    document.getElementById('summaryReflections').innerHTML = `
        <div class="summary-item">
            <div class="summary-label">${escapeHTML(scenario.reflection_prompts[0])}</div>
            <div class="summary-value">${escapeHTML(gameState.responses.reflection.answer1 || 'No response provided')}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">${escapeHTML(scenario.reflection_prompts[1])}</div>
            <div class="summary-value">${escapeHTML(gameState.responses.reflection.answer2 || 'No response provided')}</div>
        </div>
    `;
    
    // Badges
    const badgesContainer = document.getElementById('badgesContainer');
    badgesContainer.innerHTML = '';
    gameState.earnedBadges.forEach(badge => {
        const badgeElement = document.createElement('div');
        badgeElement.className = 'badge';
        badgeElement.innerHTML = `${badge}`;
        badgesContainer.appendChild(badgeElement);
    });
}

function createCheckpointSummary(checkpointNumber) {
    const scenario = scenarioData.scenarios[gameState.selectedScenario];
    const checkpoint = scenario.checkpoints[checkpointNumber];
    const responses = gameState.responses[`checkpoint${checkpointNumber}`];
    
    return `
        <div class="summary-item">
            <div class="summary-label">situation:</div>
            <div class="summary-value">${checkpoint.title}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">question selected:</div>
            <div class="summary-value">${checkpoint.questions[responses.question] || 'none selected'}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">action selected:</div>
            <div class="summary-value">${checkpoint.actions[responses.action] || 'none selected'}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">group discussion:</div>
            <div class="summary-value">${escapeHTML(responses.groupDiscussion || 'no response provided')}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">action explanation:</div>
            <div class="summary-value">${escapeHTML(responses.actionExplanation || 'no response provided')}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">ai advice:</div>
            <div class="summary-value">${escapeHTML(responses.aiAdvice || 'no response provided')}</div>
        </div>
    `;
}

function calculateBadges() {
    gameState.earnedBadges = [];
    
    // Curiosity Explorer - for engaging with AI advice
    if (gameState.responses.checkpoint1.aiAdvice.length > 50 || 
        gameState.responses.checkpoint2.aiAdvice.length > 50) {
        gameState.earnedBadges.push('Curiosity Explorer');
    }
    
    // Adaptability Ace - for providing thoughtful explanations
    if (gameState.responses.checkpoint1.actionExplanation.length > 50 && 
        gameState.responses.checkpoint2.actionExplanation.length > 50) {
        gameState.earnedBadges.push('Adaptability Ace');
    }
    
    // Systems Thinker - for thorough group discussions
    if (gameState.responses.checkpoint1.groupDiscussion.length > 50 && 
        gameState.responses.checkpoint2.groupDiscussion.length > 50) {
        gameState.earnedBadges.push('Systems Thinker');
    }
    
    // Inquiry Master - for completing both reflection prompts
    if (gameState.responses.reflection.answer1.length > 20 && 
        gameState.responses.reflection.answer2.length > 20) {
        gameState.earnedBadges.push('Inquiry Master');
    }
}

function validateCurrentScreen() {
    let isValid = false;
    
    switch (currentScreen) {
        case 'checkpoint':
            const checkpointKey = `checkpoint${gameState.currentCheckpoint}`;
            const responses = gameState.responses[checkpointKey];
            
            isValid = responses.question !== null && 
                     responses.action !== null &&
                     document.getElementById('groupDiscussion').value.trim().length > 0 &&
                     document.getElementById('actionExplanation').value.trim().length > 0 &&
                     document.getElementById('aiAdvice').value.trim().length > 0;
            
            document.getElementById('continueCheckpoint').disabled = !isValid;
            break;
    }
}

function updateProgress() {
    const progressSteps = {
        welcome: 0,
        roleSelection: 12.5,
        scenarioSelection: 25,
        missionBrief: 37.5,
        checkpoint: 50 + (gameState.currentCheckpoint - 1) * 12.5,
        outcome: 75,
        reflection: 87.5,
        summary: 100
    };
    
    const progressTexts = {
        welcome: 'welcome',
        roleSelection: 'role selection',
        scenarioSelection: 'scenario selection',
        missionBrief: 'mission brief',
        checkpoint: `checkpoint ${gameState.currentCheckpoint}`,
        outcome: 'outcome',
        reflection: 'reflection',
        summary: 'summary'
    };
    
    const progress = progressSteps[currentScreen] || 0;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = progressTexts[currentScreen] || 'loading...';
}

function exportJSON() {
    const exportData = {
        gameState,
        timestamp: new Date().toISOString(),
        totalTime: Date.now() - gameState.startTime,
        formattedTime: formatTime(Date.now() - gameState.startTime)
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindshift-mission-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

function exportCSV() {
    const scenario = scenarioData.scenarios[gameState.selectedScenario];
    const csvData = [
        ['Field', 'Value'],
        ['Role', gameState.selectedRole],
        ['Scenario', scenario.title],
        ['Total Time', formatTime(Date.now() - gameState.startTime)],
        ['Checkpoint 1 Question', scenario.checkpoints[1].questions[gameState.responses.checkpoint1.question] || ''],
        ['Checkpoint 1 Action', scenario.checkpoints[1].actions[gameState.responses.checkpoint1.action] || ''],
        ['Checkpoint 1 Group Discussion', gameState.responses.checkpoint1.groupDiscussion],
        ['Checkpoint 1 Action Explanation', gameState.responses.checkpoint1.actionExplanation],
        ['Checkpoint 1 AI Advice', gameState.responses.checkpoint1.aiAdvice],
        ['Checkpoint 2 Question', scenario.checkpoints[2].questions[gameState.responses.checkpoint2.question] || ''],
        ['Checkpoint 2 Action', scenario.checkpoints[2].actions[gameState.responses.checkpoint2.action] || ''],
        ['Checkpoint 2 Group Discussion', gameState.responses.checkpoint2.groupDiscussion],
        ['Checkpoint 2 Action Explanation', gameState.responses.checkpoint2.actionExplanation],
        ['Checkpoint 2 AI Advice', gameState.responses.checkpoint2.aiAdvice],
        ['Reflection 1', gameState.responses.reflection.answer1],
        ['Reflection 2', gameState.responses.reflection.answer2],
        ['Badges Earned', gameState.earnedBadges.join(', ')]
    ];
    
    const csvString = csvData.map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const dataBlob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindshift-mission-${Date.now()}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
}

function copyToClipboard() {
    const summary = generateTextSummary();
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summary).then(() => {
            showStatusMessage('summary copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(summary);
        });
    } else {
        fallbackCopyToClipboard(summary);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showStatusMessage('summary copied to clipboard!', 'success');
    } catch (err) {
        showStatusMessage('failed to copy to clipboard', 'error');
    }
    
    document.body.removeChild(textArea);
}

function generateTextSummary() {
    const scenario = scenarioData.scenarios[gameState.selectedScenario];

    return `
mindshift mission summary
========================
role: ${gameState.selectedRole}
scenario: ${scenario.title}
total time: ${formatTime(Date.now() - gameState.startTime)}

checkpoint 1: ${scenario.checkpoints[1].title}
- question: ${scenario.checkpoints[1].questions[gameState.responses.checkpoint1.question] || 'none selected'}
- action: ${scenario.checkpoints[1].actions[gameState.responses.checkpoint1.action] || 'none selected'}
- group discussion: ${gameState.responses.checkpoint1.groupDiscussion}
- action explanation: ${gameState.responses.checkpoint1.actionExplanation}
- ai advice: ${gameState.responses.checkpoint1.aiAdvice}

checkpoint 2: ${scenario.checkpoints[2].title}
- question: ${scenario.checkpoints[2].questions[gameState.responses.checkpoint2.question] || 'none selected'}
- action: ${scenario.checkpoints[2].actions[gameState.responses.checkpoint2.action] || 'none selected'}
- group discussion: ${gameState.responses.checkpoint2.groupDiscussion}
- action explanation: ${gameState.responses.checkpoint2.actionExplanation}
- ai advice: ${gameState.responses.checkpoint2.aiAdvice}

reflections:
1. ${scenario.reflection_prompts[0]}
   ${gameState.responses.reflection.answer1}

2. ${scenario.reflection_prompts[1]}
   ${gameState.responses.reflection.answer2}

badges earned: ${gameState.earnedBadges.join(', ')}
    `.trim();
}

function showStatusMessage(message, type) {
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message ${type}`;
    statusDiv.textContent = message;
    
    const activeCard = document.querySelector('.screen.active .card__body');
    if (!activeCard) return;
    activeCard.insertBefore(statusDiv, activeCard.firstChild);
    
    setTimeout(() => {
        statusDiv.remove();
    }, 3000);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

function startTimeTracking() {
    // Create time tracker element
    const timeTracker = document.createElement('div');
    timeTracker.className = 'time-tracker';
    timeTracker.id = 'timeTracker';
    document.body.appendChild(timeTracker);
    
    // Update time every second
    setInterval(() => {
        const elapsed = Date.now() - gameState.startTime;
        timeTracker.textContent = `⏱️ ${formatTime(elapsed)}`;
    }, 1000);
}

// Auto-save functionality
setInterval(() => {
    if (gameState.selectedRole && gameState.selectedScenario) {
        const saveData = {
            gameState,
            timestamp: Date.now()
        };
        // Note: localStorage is not available in the sandbox environment
        // This is here for reference if deployed elsewhere
        // localStorage.setItem('mindshift-autosave', JSON.stringify(saveData));
    }
}, 30000); // Save every 30 seconds

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.ctrlKey) {
        // Ctrl+Enter to continue (if button is enabled)
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return;
        const continueButton = activeScreen.querySelector('.btn--primary:not(:disabled)');
        if (continueButton) {
            continueButton.click();
        }
    }
});

// Keyboard navigation for dynamically created choice options
document.addEventListener('keydown', function(event) {
    if (event.target.classList.contains('choice-option')) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.target.click();
        }
    }
});