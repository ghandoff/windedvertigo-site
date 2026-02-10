/* ============================================================================
   Mindshift Missions – PDF Export
   Generates a print-friendly A4 summary with header, footer, and
   two-column card layout where tile heights adapt to content.

   Depends on: jsPDF (loaded via CDN), scenarioData, gameState,
               PRME_LOGO_B64, WV_LOGO_B64, formatTime, showStatusMessage
   ============================================================================ */

(function () {
'use strict';

// ── Layout ──
const A4_W = 210, A4_H = 297;
const STRIPE_W = 4;
const ML = STRIPE_W + 6;           // margin-left
const MR = 6;                       // margin-right
const MT = 14;                      // margin-top
const MB = 16;                      // margin-bottom
const CW = A4_W - ML - MR;         // content width
const GAP = 4;
const COL = (CW - GAP) / 2;        // column width
const PAD = 3;                      // card inner padding
const TW = COL - PAD * 2;          // text width per column
const FW = CW - PAD * 2;           // full-width text width
const FOOTER_H = 14;               // reserved for footer

// ── Colors ──
const STRIPE = ['#E2580E','#ED9120','#FFCF00','#486C37','#7A9EB8','#405DAB','#1E3250'];
const C = {
    title:   [177, 80, 67],
    label:   [110, 118, 130],
    text:    [30, 35, 48],
    card:    [245, 246, 248],
    border:  [215, 220, 228],
    divider: [200, 205, 215],
    chip:    { bg:[230,232,236], ln:[200,205,215], tx:[50,55,70] },
    badge:   { bg:[248,235,232], ln:[200,140,130], tx:[150,60,50] },
    muted:   [160, 160, 160],
    navy:    [30, 50, 80],
};

function hex(h) { return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]; }

// ════════════════════════════════════════════════════
//  Public export function (attached to window)
// ════════════════════════════════════════════════════
window.exportPDF = function exportPDF() {
    var scenario = scenarioData.scenarios[gameState.selectedScenario];
    if (!scenario) { showStatusMessage('could not load scenario data','error'); return; }
    showStatusMessage('generating pdf…','info');

    var jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!jsPDF) { showStatusMessage('jspdf library not loaded','error'); return; }

    var pdf = new jsPDF({ unit:'mm', format:'a4' });
    var y = MT;

    // ── Page chrome helpers ──────────────────────────
    function background() {
        pdf.setFillColor(255,255,255); pdf.rect(0,0,A4_W,A4_H,'F');
        var h = A4_H / 7;
        STRIPE.forEach(function(c,i){ pdf.setFillColor(...hex(c)); pdf.rect(0,i*h,STRIPE_W,h,'F'); });
    }

    function header() {
        // Title row
        pdf.setFontSize(16); pdf.setFont('Helvetica','bold'); pdf.setTextColor(...C.text);
        pdf.text('mindshift missions', ML, MT);
        pdf.setFontSize(8); pdf.setFont('Helvetica','normal'); pdf.setTextColor(...C.muted);
        pdf.text('mission summary', A4_W - MR - pdf.getTextWidth('mission summary'), MT + 1.5);
        // Sub-brand row
        var sy = MT + 6;
        pdf.setFontSize(10); pdf.setFont('Helvetica','bold'); pdf.setTextColor(...C.navy);
        pdf.text('prme', ML, sy);
        var x = ML + pdf.getTextWidth('prme') + 2;
        pdf.setFont('Helvetica','normal'); pdf.setTextColor(...C.muted);
        pdf.text('\u00d7', x, sy); x += pdf.getTextWidth('\u00d7 ');
        pdf.setFont('Helvetica','bold'); pdf.setTextColor(...C.title);
        pdf.text('winded.vertigo', x, sy);
        // Divider
        var dy = sy + 4;
        pdf.setLineWidth(0.2); pdf.setDrawColor(...C.divider);
        pdf.line(ML, dy, A4_W - MR, dy);
        return dy + 3;
    }

    function footer() {
        var fy = A4_H - MB;
        var sx = A4_W - 54, pw = 20, ph = 10.5;
        try { pdf.addImage(PRME_LOGO_B64, 'PNG', sx, fy-ph, pw, ph); } catch(e){}
        pdf.setFontSize(9); pdf.setTextColor(...C.muted);
        pdf.text('\u00d7', sx+pw+2, fy-ph/2+1.5);
        try { pdf.addImage(WV_LOGO_B64, 'PNG', sx+pw+6, fy-ph-1, 24, 12.6); } catch(e){}
    }

    function newPage() { pdf.addPage(); background(); y = header(); footer(); }
    function room() { return A4_H - MB - FOOTER_H - y; }

    // ── Text primitives ─────────────────────────────
    function lines(text, w, fs) {
        pdf.setFontSize(fs);
        return pdf.splitTextToSize((text||'').toLowerCase(), w);
    }

    function measureLV(w, label, value, fs, max) {
        fs = fs||7; max = max||20;
        var lh = fs/1.8;
        var n = lines(value||'no response', w, fs).slice(0,max).length;
        return (lh + 0.8) + n*lh + 2;
    }

    function drawLV(x, cy, w, label, value, fs, max) {
        fs = fs||7; max = max||20;
        var lh = fs/1.8;
        pdf.setFontSize(fs); pdf.setFont('Helvetica','bold'); pdf.setTextColor(...C.label);
        pdf.text((label||'').toLowerCase()+':', x, cy);
        cy += lh + 0.8;
        pdf.setFont('Helvetica','normal'); pdf.setTextColor(...C.text);
        var ls = lines(value||'no response', w, fs).slice(0,max);
        pdf.text(ls, x, cy, {maxWidth:w});
        return cy + ls.length*lh + 2;
    }

    // ── Card primitives ─────────────────────────────
    function card(x, cy, w, h) {
        pdf.setFillColor(...C.card); pdf.setLineWidth(0.3); pdf.setDrawColor(...C.border);
        pdf.roundedRect(x, cy, w, h, 1.5, 1.5, 'FD');
    }

    function sectionTitle(text, x, cy) {
        pdf.setFontSize(9); pdf.setFont('Helvetica','bold'); pdf.setTextColor(...C.title);
        pdf.text(text, x, cy);
        return cy + 3;
    }

    function measureFields(fields, w, fs, max) {
        var h = PAD;
        fields.forEach(function(f){ h += measureLV(w, f[0], f[1], fs, max); });
        return h + PAD;
    }

    function drawFields(x, cy, w, fields, fs, max) {
        var tw = w - PAD*2;
        cy += PAD;
        fields.forEach(function(f){ cy = drawLV(x+PAD, cy, tw, f[0], f[1], fs, max); });
    }

    function chip(x, cy, text, maxX, style) {
        pdf.setFontSize(7);
        var tw = pdf.getTextWidth(text.toLowerCase()), cw = tw+6, ch = 4;
        if (x+cw > maxX) return null;
        pdf.setFillColor(...style.bg); pdf.setLineWidth(0.2); pdf.setDrawColor(...style.ln);
        pdf.roundedRect(x, cy, cw, ch, 1, 1, 'FD');
        pdf.setTextColor(...style.tx); pdf.text(text.toLowerCase(), x+3, cy+ch-1);
        return x + cw + 2;
    }

    // ════════════════════════════════════════════════
    //  Extract data
    // ════════════════════════════════════════════════
    var team = gameState.teamMembers.split('\n').map(function(n){return n.trim();}).filter(function(n){return n.length>0;});
    var oKey = gameState.selectedScenario === 'plastic_packaging' ? 'environmental' : 'learning equity';
    var oVal = gameState.selectedScenario === 'plastic_packaging' ? scenario.outcomes.environmental : scenario.outcomes.learning_equity;
    var cp1 = scenario.checkpoints[1], r1 = gameState.responses.checkpoint1;
    var cp2 = scenario.checkpoints[2], r2 = gameState.responses.checkpoint2;

    // ── Card field arrays ──
    var overview = [
        ['role', gameState.selectedRole || 'not selected'],
        ['scenario', scenario.title],
        ['total time', formatTime(Date.now() - gameState.startTime)]
    ];
    var outcomes = [
        [oKey, oVal],
        ['public perception', scenario.outcomes.public_perception],
        ['operational', scenario.outcomes.operational]
    ];
    var c1 = [
        ['situation', cp1.title], ['question', cp1.questions[r1.question]||'none'],
        ['action', cp1.actions[r1.action]||'none'], ['discussion', r1.groupDiscussion||'no response'],
        ['explanation', r1.actionExplanation||'no response'], ['ai advice', r1.aiAdvice||'no response']
    ];
    var c2 = [
        ['situation', cp2.title], ['question', cp2.questions[r2.question]||'none'],
        ['action', cp2.actions[r2.action]||'none'], ['discussion', r2.groupDiscussion||'no response'],
        ['explanation', r2.actionExplanation||'no response'], ['ai advice', r2.aiAdvice||'no response']
    ];
    var refl = [
        [scenario.reflection_prompts[0], gameState.responses.reflection.answer1||'no response'],
        [scenario.reflection_prompts[1], gameState.responses.reflection.answer2||'no response']
    ];

    // ════════════════════════════════════════════════
    //  Draw page 1
    // ════════════════════════════════════════════════
    background();
    y = header();
    footer();

    // ── Row 1: Overview + Outcomes ──
    y = sectionTitle('mission overview', ML, y);
    pdf.text('outcome snapshot', ML + COL + GAP, y - 3);

    // Measure chip rows for team
    var chipRows = 1, cx = 0;
    pdf.setFontSize(7);
    team.forEach(function(n){ var w=pdf.getTextWidth(n.toLowerCase())+8; if(cx+w>TW){chipRows++;cx=0;} cx+=w; });
    var teamH = 4 + chipRows*5 + 2;
    var ovH = teamH + measureFields(overview, TW, 7, 2);
    var ocH = measureFields(outcomes, TW, 7, 3);
    var r1H = Math.max(ovH, ocH);

    card(ML, y, COL, r1H);
    card(ML+COL+GAP, y, COL, r1H);

    // Fill overview
    var oy = y + PAD;
    pdf.setFontSize(7); pdf.setFont('Helvetica','bold'); pdf.setTextColor(...C.label);
    pdf.text('team members:', ML+PAD, oy); oy += 3;
    cx = ML+PAD;
    var mx = ML+COL-PAD;
    team.forEach(function(n){
        var nx = chip(cx, oy, n, mx, C.chip);
        if(!nx){ oy+=5; cx=ML+PAD; nx=chip(cx,oy,n,mx,C.chip); }
        cx = nx || cx;
    });
    oy += 8;
    overview.forEach(function(f){ oy = drawLV(ML+PAD, oy, TW, f[0], f[1], 7, 2); });

    // Fill outcomes
    var ocy = y + PAD;
    outcomes.forEach(function(f){ ocy = drawLV(ML+COL+GAP+PAD, ocy, TW, f[0], f[1], 7, 3); });

    y += r1H + 4;

    // ── Row 2: Checkpoint 1 + Checkpoint 2 ──
    var h1 = measureFields(c1, TW, 7, 3);
    var h2 = measureFields(c2, TW, 7, 3);
    var r2H = Math.max(h1, h2);
    if (r2H + 7 > room()) newPage();

    y = sectionTitle('checkpoint 1', ML, y);
    pdf.text('checkpoint 2', ML+COL+GAP, y-3);

    card(ML, y, COL, r2H); drawFields(ML, y, COL, c1, 7, 3);
    card(ML+COL+GAP, y, COL, r2H); drawFields(ML+COL+GAP, y, COL, c2, 7, 3);
    y += r2H + 4;

    // ── Row 3: Reflections (full width) ──
    var rH = measureFields(refl, FW, 7, 5);
    if (rH + 7 > room()) newPage();

    y = sectionTitle('reflections', ML, y);
    card(ML, y, CW, rH); drawFields(ML, y, CW, refl, 7, 5);
    y += rH + 4;

    // ── Badges ──
    if (gameState.earnedBadges && gameState.earnedBadges.length > 0) {
        if (12 > room()) newPage();
        y = sectionTitle('badges earned', ML, y);
        var bx = ML+1, bmx = A4_W-MR-2;
        gameState.earnedBadges.forEach(function(b){
            var nx = chip(bx, y, '* '+b, bmx, C.badge);
            if(!nx){ y+=5; bx=ML+1; nx=chip(bx,y,'* '+b,bmx,C.badge); }
            bx = nx||bx;
        });
    }

    // ── Save ──
    try {
        pdf.save('mindshift-mission-' + Date.now() + '.pdf');
        showStatusMessage('pdf exported!','success');
    } catch(err) {
        showStatusMessage('pdf export failed','error');
        console.error('PDF export error:', err);
    }
};

})();
