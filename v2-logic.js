// V2 Logic for Founder Bottleneck Diagnostic

let currentSlide = 0;
const totalQuestions = 9; // Not counting Intro (0) or Email (10)
const answers = {};
let liveLeakage = 0;

// Update the progress bar
function updateProgress() {
  const pct = (currentSlide / 10) * 100;
  const bar = document.getElementById("progress");
  if (bar) bar.style.width = pct + "%";
}

// Log to the terminal console
function logAction(msg) {
  const consoleEl = document.getElementById("console-log");
  if (!consoleEl) return;
  const line = document.createElement("div");
  line.className = "log-line text-builder-muted";
  line.textContent = "> " + msg;
  consoleEl.prepend(line);
}

// Smooth slide transition
function nextSlide() {
  const current = document.getElementById("slide-" + currentSlide);
  if (current) {
    current.classList.remove("active");
    current.classList.add("done");
  }

  currentSlide++;
  const next = document.getElementById("slide-" + currentSlide);
  
  if (next) {
    next.classList.remove("done"); // in case moving backwards later
    next.classList.add("active");
    updateProgress();
    
    // Simulate ambient glow moving
    const glow = document.getElementById("glow");
    if(glow) glow.style.transform = `translate(-50%, calc(-50% + ${Math.random() * 40 - 20}px))`;
  }
}

// Handle answer selection
function selectAnswer(slideNum, key, value, event) {
  answers[key] = value;
  
  // Update visually on this slide
  const slide = document.getElementById("slide-" + slideNum);
  const btns = slide.querySelectorAll(".choice-btn");
  btns.forEach(b => b.classList.remove("selected", "!bg-accent", "!border-accent", "!text-white"));
  
  // Find which button triggered this (could be via click or keyboard)
  if(event && event.currentTarget) {
    event.currentTarget.classList.add("selected");
  } else {
     // fallback if keyboard called it directly, find by checking the hint text or similar (simplified for MVP)
     btns.forEach(b => {
         if (b.innerText.includes(value) || b.onclick.toString().includes(value)) b.classList.add("selected");
     });
  }

  // Calculate generic leakage jump just for theatrical effect based on slide (Fake math for tension building)
  liveLeakage += Math.floor(Math.random() * 15000) + 5000;
  
  // Log it
  const valString = (typeof value === "string") ? value : "Option selected";
  logAction(`Parameter [${key}] locked: ${valString}`);
  logAction(`Recalculating escrow deficit...`);
  
  animateValue("live-leak", parseInt(document.getElementById("live-leak").innerText.replace(/,/g, '')), liveLeakage, 600);

  // Auto-advance after 300ms so they see the click state
  setTimeout(() => {
    nextSlide();
  }, 300);
}

// Number spin animation for the live ticker
function animateValue(id, start, end, duration) {
  if (start === end) return;
  let obj = document.getElementById(id);
  if(!obj) return;
  
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const eased = easeOutQuart(progress);
    obj.innerHTML = Math.floor(eased * (end - start) + start).toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}
function easeOutQuart(x) { return 1 - Math.pow(1 - x, 4); }

// Final Submission
function submitAnalysis() {
  const emailInput = document.getElementById("user-email").value;
  const errText = document.getElementById("email-err");
  
  if(!emailInput || !emailInput.includes("@")) {
    errText.classList.remove("hidden");
    return;
  }
  errText.classList.add("hidden");
  
  logAction(`Identity verified: ${emailInput}`);
  logAction(`Finalizing baseline constraint...`);
  answers['email'] = emailInput;

  // Real Math calculation for the actual result
  const primary = calculateConstraint();
  const leakResult = calculateFinalLeakage(primary.key, primary.conf);
  answers['leakageEstimated'] = leakResult;
  answers['primaryConstraintTitle'] = primary.title;
  
  // Generate the highly customized Email HTML report with specific recommendations per question
  answers['htmlReport'] = generateHtmlReport(answers, primary, leakResult);
  
  // Theatrical Delay
  const slide10 = document.getElementById("slide-10");
  slide10.innerHTML = `
    <div class="flex flex-col items-center justify-center h-full space-y-4">
        <div class="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p class="text-accent tracking-widest uppercase font-bold text-sm">Running Final Calculation...</p>
    </div>
  `;

  // POST data to Google Sheets via the Apps Script Web App
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxek9qBKGVcq1NCvY10GAbkTZZo9TXwCTdfv_flWcN9-t8IAxV5OgvTzWhBO1CWqZIe/exec";
  
  // Use mode: 'no-cors' to avoid browser preflight blockages with Google Apps Script
  fetch(WEB_APP_URL, { 
    method: 'POST', 
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(answers) 
  }).then(response => {
    logAction("Telemetry synced perfectly with tracking satellite.");
  }).catch(error => {
    logAction("Telemetry sync failed, proceeding locally.");
  });

  setTimeout(() => {
    showResult(leakResult, primary);
  }, 2500);
}

function calculateFinalLeakage(primaryStr, confStr) {
   const base = REV_MIDPOINT[answers.rev] || 167000;
   const mult = LEAK_MULT[primaryStr] || 0.10;
   let mod = 0.5;
   if(confStr === "High") mod = 1.0;
   if(confStr === "Medium") mod = 0.75;
   return Math.round(base * mult * mod);
}

const REV_MIDPOINT = { low: 75000, mid: 167000, high: 542000, scale: 1000000 };
const LEAK_MULT = { VOL: 0.18, CON: 0.12, DEL: 0.15, STR: 0.10 };
const TIE_PRIORITY = ["DEL", "CON", "VOL", "STR"];

const ECONOMIC_DATA = {
  VOL: {
    title: "Qualified Demand Constraint",
    desc: "You are generating leads, but too few qualified conversations are forming. Demand exists, but fit, intent, speed, or follow-up is reducing effective volume."
  },
  CON: {
    title: "Conversion Constraint",
    desc: "You have demand signals, but conversion is weak. The offer, positioning, or sales path is adding friction."
  },
  DEL: {
    title: "Delivery Constraint",
    desc: "Capacity is the bottleneck. Delivery is overloaded, custom, or inconsistent."
  },
  STR: {
    title: "Founder Dependency",
    desc: "Growth is still too dependent on founder involvement. Decisions, escalations, or conversion still route through you, which slows throughput and makes scale fragile."
  }
};

const FIX_DATA = {
  VOL: {
    fix: (ctx) => {
      const reps = ({ low: 25, mid: 35, high: 50, scale: 60 })[ctx.rev] || 35;
      const calls = ({ low: 6, mid: 10, high: 14, scale: 18 })[ctx.rev] || 10;
      const lines = [];
      lines.push("Days 1-7: tighten qualification, response speed, and follow-up discipline to stop leaking demand you already created.");
      lines.push("Days 8-14: pressure-test CAC, close rate, pricing, and LTV to see whether the economics support scaling demand cleanly.");
      lines.push("Daily reps: " + reps + " targeted touches to ICP-matched prospects.");
      lines.push("Win by Day 14: " + calls + " qualified booked calls.");
      return lines.join("<br><br>");
    },
  },
  CON: {
    fix: (ctx) => {
      const variants = ({ low: 2, mid: 3, high: 4, scale: 5 })[ctx.rev] || 3;
      return [
        "Days 1-7: identify the biggest conversion friction in your offer, proof, positioning, or next-step process.",
        "Days 8-14: pressure-test the economics behind conversion, including pricing strength, CAC efficiency, close rate, and payback speed.",
        "Build " + variants + " offer variants (headline + promise + guarantee)."
      ].join("<br><br>");
    },
  },
  DEL: {
    fix: () => [
      "Days 1-7: stabilize delivery by reducing custom work, tightening scope, and standardizing the main fulfillment path.",
      "Days 8-14: review the economics underneath delivery stress, especially margins, fulfillment cost consistency, pricing, and churn pressure.",
      "Productize the #1 service clients buy."
    ].join("<br><br>"),
  },
  STR: {
    fix: (ctx) => {
      const looms = ({ low: 6, mid: 10, high: 14, scale: 18 })[ctx.rev] || 10;
      return [
        "Days 1-7: map where the founder is still acting as closer, decision desk, or escalation layer.",
        "Days 8-14: review whether pricing, margins, role design, and management structure are strong enough to replace founder involvement profitably.",
        "Record " + looms + " Looms replacing repeat explanations."
      ].join("<br><br>");
    },
  },
};

function calculateConstraint() {
    // Ported V1 Mathematics
    const scores = { VOL: 0, CON: 0, DEL: 0, STR: 0 };
    
    // DEL constraints
    if (answers.capacity === "high") scores.DEL += 8;
    if (answers.capacity === "mid") scores.DEL += 3;
    if (answers.stall === "delivery") scores.DEL += 4;
    if (answers.capacity === "low") scores.DEL -= 6;

    // CON constraints
    if (answers.closeRate === "low" && answers.calls7 !== "0-2") scores.CON += 6;
    if (answers.speed === "broken") scores.CON += 6;
    if (answers.speed === "leak") scores.CON += 4;
    if (answers.followup === "low") scores.CON += 5;
    if (answers.followup === "mid") scores.CON += 2;

    // VOL constraints
    if (answers.leads7 === "0-5") scores.VOL += 6;
    if (answers.fitPct === "low") scores.VOL += 7;
    if (answers.fitPct === "mid") scores.VOL += 3;
    if (answers.leadQuality === "low") scores.VOL += 4;

    // STR constraints
    if (answers.stall === "nothing") scores.STR -= 8;
    if (answers.stall === "decisions") scores.STR += 6;
    if (answers.stall === "sales") scores.STR += 3;

    // Symptoms
    if (answers.sym === 'leads') scores.VOL += 1;
    if (answers.sym === 'flat') { scores.VOL += 1; scores.CON += 1; }
    if (answers.sym === 'everything') scores.CON += 1;
    if (answers.sym === 'overwhelmed') scores.DEL += 1;
    if (answers.sym === 'harder') scores.STR += 1;

    // Extreme penalties
    if (answers.leads7 === "0-5") {
      scores.VOL += 8;
      scores.CON = Math.min(scores.CON, 2);
    }

    // Sorting algorithm with tie breaks
    const sorted = Object.entries(scores).sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return TIE_PRIORITY.indexOf(a[0]) - TIE_PRIORITY.indexOf(b[0]);
    });

    const primaryKey = sorted[0][0];
    const topScore = sorted[0][1];
    const runnerScore = sorted[1][1];
    const gap = topScore - runnerScore;
    
    let conf = gap >= 4 ? "High" : (gap >= 2 ? "Medium" : "Low");
    if (answers.calls7 === "0-2") conf = "Low";
    
    return { 
        key: primaryKey, 
        title: ECONOMIC_DATA[primaryKey].title, 
        desc: ECONOMIC_DATA[primaryKey].desc,
        conf: conf,
        fixPlanHtml: FIX_DATA[primaryKey].fix(answers)
    };
}

function showResult(leakResult, primary) {
    document.getElementById("slide-10").classList.remove("active");
    document.getElementById("slide-10").classList.add("done");
    
    document.getElementById("slide-result").classList.add("active");
    
    document.getElementById("res-title").innerText = primary.title;
    document.getElementById("res-desc").innerText = primary.desc;
    document.getElementById("live-leak").innerText = leakResult.toLocaleString();
    
    // Set 14-day fake plan based on actual logic
    document.getElementById("res-plan").innerHTML = "<li class='text-sm'>" + primary.fixPlanHtml.replace(/<br><br>/g, "</li><li class='text-sm'>") + "</li>";

    // Build the Detailed Breakdown for the UI
    const qDetails = buildQuestionDetails(answers);
    const breakdownContainer = document.getElementById("res-breakdown");
    if(breakdownContainer) {
        breakdownContainer.innerHTML = "";
        qDetails.forEach(q => {
            const readableAnsw = q.textMap ? (q.textMap[q.val] || q.val) : q.val;
            let block = "<div class='p-4 border border-white/10 bg-white/5 rounded-lg'>";
            block += "<p class='text-[10px] uppercase tracking-widest text-builder-muted mb-1'>" + q.label + "</p>";
            block += "<p class='text-base font-bold text-white mb-2'>" + readableAnsw + "</p>";
            if(q.comment) block += "<p class='text-sm text-slate-300 mb-1'><strong class='text-builder-muted'>Analysis:</strong> " + q.comment + "</p>";
            if(q.action) block += "<p class='text-sm text-accent font-medium'>▶ <strong class='text-accent uppercase tracking-wider text-xs'>Action:</strong> " + q.action + "</p>";
            block += "</div>";
            breakdownContainer.innerHTML += block;
        });
    }

    logAction(`Diagnostics complete. Bottleneck identified.`);
    
    // Draw Radar Chart
    drawRadar(primary.key);
}

function drawRadar(primaryKey) {
    const ctx = document.getElementById("radarChart");
    if(!ctx) return;
    
    const dataMap = {
        'VOL': [30, 80, 70, 60],
        'CON': [80, 20, 80, 70],
        'DEL': [70, 70, 20, 60],
        'STR': [90, 80, 80, 30]
    };
    const shape = dataMap[primaryKey] || [50,50,50,50];

    new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Demand', 'Conversion', 'Delivery', 'Founder'],
          datasets: [{
            label: 'System Strength',
            data: shape,
            backgroundColor: 'rgba(255, 92, 0, 0.2)',
            borderColor: '#ff5c00',
            pointBackgroundColor: '#fff',
            pointBorderColor: '#ff5c00',
          }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: '#888', font: { family: 'Outfit', size: 12 } },
                    ticks: { display: false, min: 0, max: 100 }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function buildQuestionDetails(ans) {
    return [
      { label: "Symptom", val: ans.sym, textMap: { "leads": "Need more qualified leads", "everything": "Tried multiple fixes and growth is still stuck", "overwhelmed": "The team is overloaded", "harder": "Growth still depends too much on me", "flat": "Revenue has stalled entirely" }, comment: "Symptoms show where the problem hurts, but not where it starts.", action: "Stop treating the symptom. We need to fix the structural math causing it." },
      { label: "Revenue Tier", val: ans.rev, textMap: { "low": "Under $1M", "mid": "$1M - $3M", "high": "$3M - $10M", "scale": "$10M+" }, comment: ans.rev === 'low' ? "At this stage, you need brute-force validation and cash flow." : (ans.rev === 'mid' ? "You've proven the model. Now the inefficiencies are starting to compound and drain margin." : "At this scale, minor inefficiencies in the math compound into massive monthly leakage."), action: "Ensure pricing and unit economics scale profitably before adding raw volume." },
      { label: "Inbound Leads (7d)", val: ans.leads7, comment: ans.leads7 === '0-5' ? "Volume is critically low to support meaningful statistical analysis." : "You have enough flow to isolate where the funnel is breaking.", action: ans.leads7 === '0-5' ? "Focus 80% of your effort on outbound or paid acquisition immediately to build a baseline." : "Shift focus entirely to lead quality and conversion mechanics rather than raw volume." },
      { label: "Qualified Fit Rate", val: ans.fitPct, textMap: { "low": "Very few (<20%)", "mid": "Some (20-40%)", "high": "Many (40-70%)", "elite": "Most (70%+)" }, comment: (ans.fitPct === 'low' || ans.fitPct === 'mid') ? "Low fit rate means your marketing dollars are subsidizing unqualified noise." : "Strong fit rate indicates targeting is dialed in.", action: (ans.fitPct === 'low' || ans.fitPct === 'mid') ? "Tighten your messaging, raise prices, or add up-front disqualification criteria to protect your sales team's time." : "Maintain this floor and look deeper into the funnel for friction." },
      { label: "Speed to Lead", val: ans.speed, textMap: { "elite": "Under 1 minute", "fast": "1-5 minutes", "leak": "5-15 minutes", "broken": "15+ minutes / same day" }, comment: (ans.speed === 'broken' || ans.speed === 'leak') ? "Conversion rates drop by over 80% after 5 minutes." : "World-class response time maximizes intent.", action: (ans.speed === 'broken' || ans.speed === 'leak') ? "Implement an auto-dialer or automated SMS immediately to engage while intent is highest." : "Sustain this speed. It is a massive competitive advantage." },
      { label: "Follow-up Attempts", val: ans.followup, textMap: { "low": "1-2 attempts", "mid": "3-5 attempts", "high": "6-9 attempts", "elite": "10+ attempts" }, comment: (ans.followup === 'low' || ans.followup === 'mid') ? "Most deals close between touch 5 and 12. You are abandoning leads too early." : "High persistence directly correlates to lower CAC.", action: (ans.followup === 'low' || ans.followup === 'mid') ? "Deploy an automated nurture sequence (SMS + Email) to systematically follow up without taxing your reps." : "Keep this discipline automated so reps aren't relying purely on memory." },
      { label: "Close Rate", val: ans.closeRate, textMap: { "low": "<15%", "mid": "15% - 30%", "high": "30% - 60%", "elite": "60%+" }, comment: ans.closeRate === 'low' ? "A low close rate with qualified leads indicates a pricing, proof, or offer problem." : "Strong close rate means the offer resonates with the market.", action: ans.closeRate === 'low' ? "Review the last 5 lost deals. De-risk the offer by restructuring the guarantee or payment terms." : "With a strong close rate, the bottleneck is almost certainly demand volume or delivery capacity." },
      { label: "Delivery Capacity", val: ans.capacity, textMap: { "low": "<50% (Room to scale)", "mid": "50-80% (Healthy load)", "high": "80%+ (Straining or breaking)" }, comment: ans.capacity === 'high' ? "Delivery is a ceiling. Adding more sales now will just break fulfillment and spike churn." : "You have the operational bandwidth to absorb new growth.", action: ans.capacity === 'high' ? "Productize the service, reduce custom scope, and standardize delivery before turning the sales dial up." : "Accelerate front-end acquisition to fill the remaining capacity pipeline." },
      { label: "Founder Dependency", val: ans.stall, textMap: { "sales": "Sales pipeline stalls", "delivery": "Delivery errors spike", "decisions": "Decisions queue up on my desk", "nothing": "Nothing (Team operates without me)" }, comment: ans.stall !== 'nothing' ? "Founder dependency limits throughput to the hours you work." : "Excellent system delegation means the business can scale independently.", action: ans.stall !== 'nothing' ? "Document the exact mechanics of this decision point and draft an SOP to delegate it within 14 days." : "Focus entirely on optimizing the unit economics of the machine." }
    ];
}

function generateHtmlReport(ans, primary, leakResult) {
  const qDetails = buildQuestionDetails(ans);

  let html = "<div style='font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;'>";
  html += "<h2 style='text-align: center; color: #111; font-size: 28px;'>Diagnostic Complete</h2>";
  html += "<div style='background-color: #f9f9f9; padding: 25px; border-radius: 8px; border-left: 4px solid #ff5c00; margin-bottom: 30px;'>";
  html += "<p style='margin: 0 0 10px 0; font-size: 16px;'><strong>Estimated Escrow Leakage:</strong> <span style='font-size: 28px; color: #ff5c00; display: block;'>$" + leakResult.toLocaleString() + " / mo</span></p>";
  html += "<p style='margin: 0; font-size: 16px;'><strong>Primary Bottleneck:</strong> " + primary.title + "</p>";
  html += "</div>";
  html += "<p style='font-size: 16px; line-height: 1.6;'>" + primary.desc + "</p><hr style='border: 0; border-top: 1px solid #eee; margin: 30px 0;'>";

  html += "<h3 style='color: #111; margin-bottom: 20px;'>Detailed Input Analysis</h3>";
  
  qDetails.forEach(q => {
      const readableAnsw = q.textMap ? (q.textMap[q.val] || q.val) : q.val;
      html += "<div style='margin-bottom: 20px; padding: 15px; border: 1px solid #eaeaea; border-radius: 6px; background-color: #fafafa;'>";
      html += "<p style='margin: 0 0 5px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888;'>" + q.label + "</p>";
      html += "<p style='margin: 0 0 10px 0; font-weight: bold; font-size: 16px;'>" + readableAnsw + "</p>";
      if(q.comment) html += "<p style='margin: 0 0 8px 0; font-size: 14px; color: #444; line-height: 1.4;'><strong>Analysis: </strong>" + q.comment + "</p>";
      if(q.action) html += "<p style='margin: 0; font-size: 14px; color: #ff5c00; font-weight: 500; line-height: 1.4;'>▶ <strong>Action: </strong>" + q.action + "</p>";
      html += "</div>";
  });
  
  html += "<div style='margin-bottom: 20px; padding: 25px; border: 1px solid #ff5c00; border-radius: 6px; background-color: #fffaf7;'>";
  html += "<h3 style='margin-top: 0; color: #ff5c00; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;'>Your 14-Day Fix Plan</h3>";
  html += "<p style='font-size: 15px; color: #333; line-height: 1.7; font-weight: 500;'>" + primary.fixPlanHtml + "</p>";
  html += "</div>";
  
  // The Final Math CTA Block
  html += "<div style='text-align: center; margin-top: 40px; padding: 30px; background-color: #111; border-radius: 8px; border: 1px solid #333;'>";
  html += "<h3 style='margin-top: 0; color: #fff; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;'>The Next Step: Fix The Math</h3>";
  html += "<p style='margin-bottom: 15px; color: #ccc; line-height: 1.6; font-size: 15px;'>This diagnostic is directional. It shows you <em>where</em> the pain is coming from, but it cannot tell you <em>why</em> the economics are broken.</p>";
  html += "<p style='margin-bottom: 25px; color: #ccc; line-height: 1.6; font-size: 15px;'>The only way to plug a <strong>$" + leakResult.toLocaleString() + "/mo</strong> escrow leak is to run a rigorous Math & Margin Audit. If we don't fix the underlying math—pricing, margins, CAC efficiency, and LTV—scaling will only speed up the bleed.</p>";
  html += "<a href='https://tidycal.com/jerryjobrien/30-minute-meeting' style='display:inline-block; padding: 16px 32px; background-color: #ff5c00; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;'>Reserve Your Math & Margin Audit</a>";
  html += "</div>";
  
  html += "</div>";

  return html;
}

// Global Keyboard Nav Listener
window.addEventListener("keydown", (e) => {
    const validKeys = ["1","2","3","4","5"];
    if(validKeys.includes(e.key)) {
        // Find visible slide
        const current = document.getElementById("slide-" + currentSlide);
        if(!current) return;
        
        // Find the nth button
        const btns = Array.from(current.querySelectorAll(".choice-btn"));
        const index = parseInt(e.key) - 1;
        if(index < btns.length) {
            btns[index].click(); // Trigger the click directly
        }
    } else if (e.key === "Enter") {
        if(currentSlide === 0) nextSlide();
        if(currentSlide === 10) submitAnalysis();
    }
});
