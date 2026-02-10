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
    teamMembers: '',
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
    // Team members validation on welcome screen
    const teamInput = document.getElementById('teamMembers');
    if (teamInput) {
        teamInput.addEventListener('input', function() {
            const hasContent = this.value.trim().length > 0;
            document.getElementById('startMission').disabled = !hasContent;
        });
    }

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
    // Save team members from welcome screen
    const teamInput = document.getElementById('teamMembers');
    if (teamInput) {
        gameState.teamMembers = teamInput.value.trim();
    }
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
    const teamNames = gameState.teamMembers
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);

    const teamChipsHTML = teamNames.length > 0
        ? `<div class="team-chips">${teamNames.map(n => `<span class="team-chip">${escapeHTML(n)}</span>`).join('')}</div>`
        : '<div class="summary-value">none listed</div>';

    document.getElementById('summaryOverview').innerHTML = `
        <div class="summary-item">
            <div class="summary-label">team members:</div>
            ${teamChipsHTML}
        </div>
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
    
    // Outcome snapshot
    const outcomes = scenario.outcomes;
    let outcomeHTML = '';
    if (gameState.selectedScenario === 'plastic_packaging') {
        outcomeHTML += `
            <div class="summary-item">
                <div class="summary-label">environmental:</div>
                <div class="summary-value">${escapeHTML(outcomes.environmental)}</div>
            </div>`;
    } else {
        outcomeHTML += `
            <div class="summary-item">
                <div class="summary-label">learning equity:</div>
                <div class="summary-value">${escapeHTML(outcomes.learning_equity)}</div>
            </div>`;
    }
    outcomeHTML += `
        <div class="summary-item">
            <div class="summary-label">public perception:</div>
            <div class="summary-value">${escapeHTML(outcomes.public_perception)}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">operational:</div>
            <div class="summary-value">${escapeHTML(outcomes.operational)}</div>
        </div>`;
    document.getElementById('summaryOutcome').innerHTML = outcomeHTML;

    // Reflections
    document.getElementById('summaryReflections').innerHTML = `
        <div class="summary-item">
            <div class="summary-label">${escapeHTML(scenario.reflection_prompts[0])}</div>
            <div class="summary-value">${escapeHTML(gameState.responses.reflection.answer1 || 'no response provided')}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">${escapeHTML(scenario.reflection_prompts[1])}</div>
            <div class="summary-value">${escapeHTML(gameState.responses.reflection.answer2 || 'no response provided')}</div>
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

// Logo assets for PDF export (base64 PNG, white on transparent)
const PRME_LOGO_B64 = 'data:image/png;base64,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';
const WV_LOGO_B64 = 'data:image/png;base64,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';

function exportPDF() {
    const scenario = scenarioData.scenarios[gameState.selectedScenario];
    if (!scenario) {
        showStatusMessage('could not load scenario data', 'error');
        return;
    }

    showStatusMessage('generating pdf...', 'info');

    // Access jsPDF from CDN bundle (html2pdf.js v0.10.1 includes it)
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showStatusMessage('jsPDF library not loaded', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;

    // ======== DIMENSIONS & COLORS ========
    const A4_W = 210, A4_H = 297;  // mm
    const STRIPE_W = 4;             // mm
    const MARGIN_LEFT = STRIPE_W + 6;
    const MARGIN_RIGHT = 6;
    const MARGIN_TOP = 12;
    const MARGIN_BOTTOM = 12;
    const CONTENT_W = A4_W - MARGIN_LEFT - MARGIN_RIGHT;

    const BG_DARK = '#273248';
    const STRIPE_COLORS = ['#E2580E', '#ED9120', '#FFCF00', '#486C37', '#7A9EB8', '#405DAB', '#1E3250'];
    const SECTION_BG = [43, 54, 76];      // rgba(255,255,255,0.06) on #273248
    const SECTION_BORDER = [58, 68, 89];  // rgba(255,255,255,0.1)
    const TITLE_COLOR = [177, 80, 67];    // #b15043
    const LABEL_COLOR = [166, 172, 182];  // rgba(255,255,255,0.6)
    const TEXT_WHITE = [255, 255, 255];

    // ======== HELPERS ========
    const hexToRGB = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    };

    const drawPageBackground = (pdf) => {
        // Dark background
        pdf.setFillColor(...hexToRGB(BG_DARK));
        pdf.rect(0, 0, A4_W, A4_H, 'F');

        // Left stripe with 7 equal-height color blocks
        const stripeH = A4_H / 7;
        STRIPE_COLORS.forEach((color, i) => {
            pdf.setFillColor(...hexToRGB(color));
            pdf.rect(0, i * stripeH, STRIPE_W, stripeH, 'F');
        });
    };

    const drawCardBackground = (pdf, x, y, w, h) => {
        pdf.setFillColor(...SECTION_BG);
        pdf.setLineWidth(0.3);
        pdf.setDrawColor(...SECTION_BORDER);
        pdf.roundedRect(x, y, w, h, 1.5, 1.5, 'FD');
    };

    const drawTeamChip = (pdf, text, x, y, maxWidth) => {
        const chipH = 4, chipPadding = 2, fontSize = 7;
        pdf.setFontSize(fontSize);

        const textWidth = pdf.getTextWidth(text);
        const chipW = textWidth + chipPadding * 2;

        if (x + chipW > maxWidth) return null; // chip doesn't fit

        // Chip background
        pdf.setFillColor(60, 54, 73);
        pdf.setLineWidth(0.2);
        pdf.setDrawColor(87, 60, 62);
        pdf.roundedRect(x, y, chipW, chipH, 1, 1, 'FD');

        // Text
        pdf.setTextColor(255, 235, 210);
        pdf.text(text.toLowerCase(), x + chipPadding, y + chipH - 1.2, { maxWidth: chipW - chipPadding });

        return x + chipW + 2; // next x position
    };

    const drawBadgePill = (pdf, text, x, y, maxWidth) => {
        const chipH = 4, chipPadding = 2, fontSize = 7;
        pdf.setFontSize(fontSize);

        const badge = '★ ' + text;
        const textWidth = pdf.getTextWidth(badge);
        const chipW = textWidth + chipPadding * 2;

        if (x + chipW > maxWidth) return null; // badge doesn't fit

        // Badge background
        pdf.setFillColor(60, 54, 73);
        pdf.setLineWidth(0.2);
        pdf.setDrawColor(87, 60, 62);
        pdf.roundedRect(x, y, chipW, chipH, 1, 1, 'FD');

        // Text
        pdf.setTextColor(255, 235, 210);
        pdf.text(badge.toLowerCase(), x + chipPadding, y + chipH - 1.2, { maxWidth: chipW - chipPadding });

        return x + chipW + 2;
    };

    const drawLabelValue = (pdf, label, value, x, y, w, fontSize = 8, maxLines = 20) => {
        let currentY = y;
        const lineHeight = fontSize / 1.8;

        // Label
        pdf.setFontSize(fontSize);
        pdf.setFont('Helvetica', 'bold');
        pdf.setTextColor(...LABEL_COLOR);
        pdf.text(label.toLowerCase() + ':', x, currentY);
        currentY += lineHeight + 1;

        // Value (wrapped)
        pdf.setFont('Helvetica', 'normal');
        pdf.setTextColor(...TEXT_WHITE);
        const wrappedText = pdf.splitTextToSize(value.toLowerCase(), w);
        const lines = wrappedText.slice(0, maxLines);
        pdf.text(lines, x, currentY, { maxWidth: w });

        return currentY + lines.length * lineHeight + 3;
    };

    // ======== DATA EXTRACTION ========
    const teamNames = gameState.teamMembers
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);

    const outcomes = scenario.outcomes;
    const outcomeKey1 = gameState.selectedScenario === 'plastic_packaging' ? 'environmental' : 'learning equity';
    const outcomeVal1 = gameState.selectedScenario === 'plastic_packaging'
        ? outcomes.environmental
        : outcomes.learning_equity;

    const pdfFilename = `mindshift-mission-${Date.now()}.pdf`;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    let pageNum = 1;
    let currentY = MARGIN_TOP;

    // ======== DRAW PAGE ========
    const newPage = () => {
        if (pageNum > 1) {
            pdf.addPage();
        }
        drawPageBackground(pdf);
        pageNum++;
        currentY = MARGIN_TOP;
    };

    const canFitOnPage = (requiredHeight) => {
        return currentY + requiredHeight < A4_H - MARGIN_BOTTOM;
    };

    newPage();

    // ======== HEADER ========
    pdf.setFontSize(16);
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(...TEXT_WHITE);
    pdf.text('mindshift missions', MARGIN_LEFT, currentY);

    // "mission summary" on same line (right-aligned)
    pdf.setFontSize(8);
    pdf.setFont('Helvetica', 'normal');
    pdf.setTextColor(166, 172, 182);
    const summaryX = A4_W - MARGIN_RIGHT - pdf.getTextWidth('mission summary');
    pdf.text('mission summary', summaryX, currentY + 1.5);
    currentY += 6;

    // PRME × winded.vertigo
    pdf.setFontSize(10);
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(92, 146, 229);
    pdf.text('prme', MARGIN_LEFT, currentY);

    let xPos = MARGIN_LEFT + pdf.getTextWidth('prme') + 2;
    pdf.setFont('Helvetica', 'normal');
    pdf.setTextColor(140, 140, 140);
    pdf.text('×', xPos, currentY);

    xPos += pdf.getTextWidth('× ');
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(...TITLE_COLOR);
    pdf.text('winded.vertigo', xPos, currentY);
    currentY += 5;

    // Divider
    pdf.setLineWidth(0.2);
    pdf.setDrawColor(58, 68, 89);
    pdf.line(MARGIN_LEFT, currentY, A4_W - MARGIN_RIGHT, currentY);
    currentY += 3;

    // ======== MISSION OVERVIEW ========
    if (!canFitOnPage(25)) newPage();

    pdf.setFontSize(11);
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(...TITLE_COLOR);
    pdf.text('mission overview', MARGIN_LEFT, currentY);
    currentY += 4;

    drawCardBackground(pdf, MARGIN_LEFT, currentY - 3.5, CONTENT_W, 28);

    let cardY = currentY;
    pdf.setFontSize(8);

    // Team members as chips
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(...LABEL_COLOR);
    pdf.text('team members:', MARGIN_LEFT + 2, cardY);
    cardY += 3;

    let chipX = MARGIN_LEFT + 2;
    const maxChipX = A4_W - MARGIN_RIGHT - 2;
    for (const name of teamNames) {
        const nextChipX = drawTeamChip(pdf, name, chipX, cardY, maxChipX);
        if (!nextChipX) {
            cardY += 5;
            chipX = MARGIN_LEFT + 2;
            drawTeamChip(pdf, name, chipX, cardY, maxChipX);
            chipX = MARGIN_LEFT + 2 + 20;
        } else {
            chipX = nextChipX;
        }
    }
    cardY += 6;

    // Role
    cardY = drawLabelValue(pdf, 'role', gameState.selectedRole || 'not selected', MARGIN_LEFT + 2, cardY, CONTENT_W - 4, 8, 2);

    // Scenario
    cardY = drawLabelValue(pdf, 'scenario', scenario.title, MARGIN_LEFT + 2, cardY, CONTENT_W - 4, 8, 2);

    // Total time
    cardY = drawLabelValue(pdf, 'total time', formatTime(Date.now() - gameState.startTime), MARGIN_LEFT + 2, cardY, CONTENT_W - 4, 8, 1);

    currentY = cardY + 3;

    // ======== OUTCOME SNAPSHOT ========
    if (!canFitOnPage(28)) newPage();

    pdf.setFontSize(11);
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(...TITLE_COLOR);
    pdf.text('outcome snapshot', MARGIN_LEFT, currentY);
    currentY += 4;

    drawCardBackground(pdf, MARGIN_LEFT, currentY - 3.5, CONTENT_W, 28);

    cardY = currentY;
    pdf.setFontSize(8);

    cardY = drawLabelValue(pdf, outcomeKey1, outcomeVal1, MARGIN_LEFT + 2, cardY, CONTENT_W - 4, 8, 3);
    cardY = drawLabelValue(pdf, 'public perception', outcomes.public_perception, MARGIN_LEFT + 2, cardY, CONTENT_W - 4, 8, 3);
    cardY = drawLabelValue(pdf, 'operational', outcomes.operational, MARGIN_LEFT + 2, cardY, CONTENT_W - 4, 8, 3);

    currentY = cardY + 3;

    // ======== CHECKPOINT 1 ========
    if (!canFitOnPage(50)) newPage();

    pdf.setFontSize(11);
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(...TITLE_COLOR);
    pdf.text('checkpoint 1 decisions', MARGIN_LEFT, currentY);
    currentY += 4;

    const cp1 = scenario.checkpoints[1];
    const r1 = gameState.responses.checkpoint1;

    let cp1Height = 4;
    const cp1Fields = [
        ['situation', cp1.title],
        ['question selected', cp1.questions[r1.question] || 'none'],
        ['action selected', cp1.actions[r1.action] || 'none'],
        ['group discussion', r1.groupDiscussion || 'no response'],
        ['action explanation', r1.actionExplanation || 'no response'],
        ['ai advice', r1.aiAdvice || 'no response']
    ];
    for (const [, val] of cp1Fields) {
        const wrapped = pdf.splitTextToSize(val.toLowerCase(), CONTENT_W - 6);
        cp1Height += wrapped.length * 2.8 + 2;
    }
    cp1Height += 3;

    if (!canFitOnPage(cp1Height + 4)) newPage();

    drawCardBackground(pdf, MARGIN_LEFT, currentY - 3.5, CONTENT_W, cp1Height);

    cardY = currentY;
    pdf.setFontSize(8);
    for (const [label, val] of cp1Fields) {
        cardY = drawLabelValue(pdf, label, val, MARGIN_LEFT + 2, cardY, CONTENT_W - 4, 8, 5);
    }

    currentY = cardY + 3;

    // ======== CHECKPOINT 2 ========
    if (!canFitOnPage(50)) newPage();

    pdf.setFontSize(11);
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(...TITLE_COLOR);
    pdf.text('checkpoint 2 decisions', MARGIN_LEFT, currentY);
    currentY += 4;

    const cp2 = scenario.checkpoints[2];
    const r2 = gameState.responses.checkpoint2;

    let cp2Height = 4;
    const cp2Fields = [
        ['situation', cp2.title],
        ['question selected', cp2.questions[r2.question] || 'none'],
        ['action selected', cp2.actions[r2.action] || 'none'],
        ['group discussion', r2.groupDiscussion || 'no response'],
        ['action explanation', r2.actionExplanation || 'no response'],
        ['ai advice', r2.aiAdvice || 'no response']
    ];
    for (const [, val] of cp2Fields) {
        const wrapped = pdf.splitTextToSize(val.toLowerCase(), CONTENT_W - 6);
        cp2Height += wrapped.length * 2.8 + 2;
    }
    cp2Height += 3;

    if (!canFitOnPage(cp2Height + 4)) newPage();

    drawCardBackground(pdf, MARGIN_LEFT, currentY - 3.5, CONTENT_W, cp2Height);

    cardY = currentY;
    pdf.setFontSize(8);
    for (const [label, val] of cp2Fields) {
        cardY = drawLabelValue(pdf, label, val, MARGIN_LEFT + 2, cardY, CONTENT_W - 4, 8, 5);
    }

    currentY = cardY + 3;

    // ======== REFLECTIONS ========
    if (!canFitOnPage(30)) newPage();

    pdf.setFontSize(11);
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(...TITLE_COLOR);
    pdf.text('reflections', MARGIN_LEFT, currentY);
    currentY += 4;

    let reflHeight = 4;
    const refl1 = gameState.responses.reflection.answer1 || 'no response';
    const refl2 = gameState.responses.reflection.answer2 || 'no response';
    const wrapped1 = pdf.splitTextToSize(refl1.toLowerCase(), CONTENT_W - 6);
    const wrapped2 = pdf.splitTextToSize(refl2.toLowerCase(), CONTENT_W - 6);
    reflHeight += wrapped1.length * 2.8 + 3 + wrapped2.length * 2.8 + 3;

    if (!canFitOnPage(reflHeight + 4)) newPage();

    drawCardBackground(pdf, MARGIN_LEFT, currentY - 3.5, CONTENT_W, reflHeight);

    cardY = currentY;
    pdf.setFontSize(8);
    cardY = drawLabelValue(pdf, scenario.reflection_prompts[0], refl1, MARGIN_LEFT + 2, cardY, CONTENT_W - 4, 8, 5);
    cardY = drawLabelValue(pdf, scenario.reflection_prompts[1], refl2, MARGIN_LEFT + 2, cardY, CONTENT_W - 4, 8, 5);

    currentY = cardY + 3;

    // ======== BADGES ========
    if (gameState.earnedBadges && gameState.earnedBadges.length > 0) {
        if (!canFitOnPage(8)) newPage();

        pdf.setFontSize(11);
        pdf.setFont('Helvetica', 'bold');
        pdf.setTextColor(...TITLE_COLOR);
        pdf.text('badges earned', MARGIN_LEFT, currentY);
        currentY += 4;

        let badgeX = MARGIN_LEFT + 1;
        const maxBadgeX = A4_W - MARGIN_RIGHT - 2;
        for (const badge of gameState.earnedBadges) {
            const nextBadgeX = drawBadgePill(pdf, badge, badgeX, currentY, maxBadgeX);
            if (!nextBadgeX) {
                currentY += 5;
                badgeX = MARGIN_LEFT + 1;
                drawBadgePill(pdf, badge, badgeX, currentY, maxBadgeX);
                badgeX = MARGIN_LEFT + 1 + 20;
            } else {
                badgeX = nextBadgeX;
            }
        }
        currentY += 6;
    }

    // ======== ADD LOGOS TO LAST PAGE ========
    const totalPages = pdf.internal.getNumberOfPages();
    pdf.setPage(totalPages);

    // PRME logo (130×68 orig) → 20×10.5mm
    const prmeW = 20, prmeH = 10.5;
    const prmeX = A4_W - 54, prmeY = A4_H - 18;
    pdf.addImage(PRME_LOGO_B64, 'PNG', prmeX, prmeY, prmeW, prmeH);

    // × separator
    pdf.setFontSize(9);
    pdf.setTextColor(180, 180, 180);
    pdf.text('×', prmeX + prmeW + 2, prmeY + prmeH / 2 + 1.5);

    // WV logo (160×84 orig) → 24×12.6mm
    const wvW = 24, wvH = 12.6;
    pdf.addImage(WV_LOGO_B64, 'PNG', prmeX + prmeW + 6, prmeY - 1, wvW, wvH);

    // Save
    try {
        pdf.save(pdfFilename);
        showStatusMessage('pdf exported!', 'success');
    } catch (err) {
        showStatusMessage('pdf export failed — try copy to clipboard instead', 'error');
        console.error('PDF export error:', err);
    }
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
    const outcomes = scenario.outcomes;
    const outcomeKey1 = gameState.selectedScenario === 'plastic_packaging' ? 'environmental' : 'learning equity';
    const outcomeVal1 = gameState.selectedScenario === 'plastic_packaging' ? outcomes.environmental : outcomes.learning_equity;
    const teamNames = gameState.teamMembers
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);
    const teamBlock = teamNames.length > 0
        ? teamNames.map(n => `  · ${n}`).join('\n')
        : '  none listed';

    return `
mindshift mission summary
PRME × winded.vertigo
========================
team:
${teamBlock}
role: ${gameState.selectedRole}
scenario: ${scenario.title}
total time: ${formatTime(Date.now() - gameState.startTime)}

outcome snapshot:
- ${outcomeKey1}: ${outcomeVal1}
- public perception: ${outcomes.public_perception}
- operational: ${outcomes.operational}

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

function startOver() {
    // Reset game state but keep team members
    const savedTeam = gameState.teamMembers;
    gameState = {
        teamMembers: savedTeam,
        selectedRole: null,
        selectedScenario: null,
        currentCheckpoint: 1,
        startTime: Date.now(),
        screenTimes: {},
        responses: {
            checkpoint1: { question: null, action: null, groupDiscussion: '', actionExplanation: '', aiAdvice: '' },
            checkpoint2: { question: null, action: null, groupDiscussion: '', actionExplanation: '', aiAdvice: '' },
            reflection: { answer1: '', answer2: '' }
        },
        earnedBadges: []
    };

    // Reset UI selections
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('selected'));

    // Disable continue buttons
    const contScenario = document.getElementById('continueToScenario');
    if (contScenario) contScenario.disabled = true;
    const contMission = document.getElementById('continueToMission');
    if (contMission) contMission.disabled = true;

    // Restore team members in the welcome input
    const teamInput = document.getElementById('teamMembers');
    if (teamInput) {
        teamInput.value = savedTeam;
    }

    // Enable start button since team members are still filled in
    const startBtn = document.getElementById('startMission');
    if (startBtn) startBtn.disabled = !savedTeam;

    showScreen('welcome');
}

function showStatusMessage(message, type) {
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message ${type}`;
    statusDiv.textContent = message;

    // Insert right above the export buttons so user sees it
    const exportBtns = document.querySelector('.export-buttons');
    if (exportBtns) {
        exportBtns.parentNode.insertBefore(statusDiv, exportBtns);
    } else {
        const activeCard = document.querySelector('.screen.active .card__body');
        if (!activeCard) return;
        activeCard.appendChild(statusDiv);
    }

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