// ============================================================
// JOB ALERT SYSTEM — Google Apps Script (Batch Version)
// Monitors top US product company career pages for PM/BA and software engineering roles
// Sends email alerts when new jobs are found
// Fixes: Exceeded maximum execution time error
// Adapted for: US Job Market
// ============================================================

// ── CONFIGURATION — EDIT THIS SECTION ──────────────────────

const CONFIG = {
  alertEmail: "Enter-your-email-here",

  batchSize: 5,
  fetchTimeout: 10000,

  keywords: [
    // Product management and business analysis
    "product manager",
    "senior product manager",
    "associate product manager",
    "product owner",
    "business analyst",
    "product analyst",
    "program manager",
    "growth product manager",
    "technical product manager",
    "staff product manager",
    "principal product manager",

    // Software engineering
    "software engineer",
    "software developer",
    "software development engineer",
    "backend engineer",
    "back-end engineer",
    "frontend engineer",
    "front-end engineer",
    "full stack engineer",
    "full-stack engineer",
    "web engineer",
    "mobile engineer",
    "android engineer",
    "ios engineer",
    "platform engineer",
    "infrastructure engineer",
    "site reliability engineer",
    "devops engineer",
    "cloud engineer",
    "security engineer",
    "data engineer",
    "machine learning engineer",
    "qa engineer",
    "test automation engineer",
    "embedded software engineer",
    "firmware engineer",
    "engineering manager",
    "staff software engineer",
    "principal software engineer",
  ],

  companies: [
    // ── FINTECH ──
    { name: "Stripe",         url: "https://stripe.com/jobs/search" },
    { name: "Robinhood",      url: "https://careers.robinhood.com/openings" },
    { name: "Chime",          url: "https://careers.chime.com/jobs" },
    { name: "Brex",           url: "https://www.brex.com/careers" },
    { name: "Plaid",          url: "https://plaid.com/careers/openings/" },
    { name: "Affirm",         url: "https://www.affirm.com/careers" },
    { name: "Marqeta",        url: "https://www.marqeta.com/company/careers" },
    { name: "Carta",          url: "https://carta.com/careers/" },
    { name: "Rippling",       url: "https://www.rippling.com/careers" },
    { name: "Ramp",           url: "https://ramp.com/careers" },

    // ── B2B SAAS ──
    { name: "Notion",         url: "https://www.notion.com/careers" },
    { name: "Figma",          url: "https://www.figma.com/careers/" },
    { name: "Airtable",       url: "https://airtable.com/careers" },
    { name: "Asana",          url: "https://asana.com/jobs" },
    { name: "Calendly",       url: "https://careers.calendly.com/jobs" },
    { name: "Monday.com",     url: "https://monday.com/careers" },
    { name: "HubSpot",        url: "https://www.hubspot.com/careers/jobs" },
    { name: "Zendesk",        url: "https://jobs.zendesk.com/us/en" },
    { name: "Intercom",       url: "https://www.intercom.com/careers" },
    { name: "Loom",           url: "https://www.loom.com/careers" },
    { name: "Miro",           url: "https://miro.com/careers/" },
    { name: "Amplitude",      url: "https://amplitude.com/careers" },
    { name: "Mixpanel",       url: "https://mixpanel.com/careers/" },
    { name: "Segment",        url: "https://www.twilio.com/en-us/company/jobs" },

    // ── E-COMMERCE & MARKETPLACE ──
    { name: "DoorDash",       url: "https://careers.doordash.com/jobs" },
    { name: "Instacart",      url: "https://instacart.careers/jobs/" },
    { name: "Faire",          url: "https://www.faire.com/careers" },
    { name: "Poshmark",       url: "https://poshmark.com/careers" },
    { name: "StockX",         url: "https://stockx.com/careers" },
    { name: "Whatnot",        url: "https://www.whatnot.com/careers" },

    // ── MOBILITY & TRAVEL ──
    { name: "Lyft",           url: "https://www.lyft.com/careers" },
    { name: "Waymo",          url: "https://waymo.com/joinus/" },
    { name: "Bird",           url: "https://www.bird.co/careers/" },
    { name: "Hopper",         url: "https://careers.hopper.com/jobs" },
    { name: "Sonder",         url: "https://www.sonder.com/careers" },

    // ── HEALTHTECH ──
    { name: "Headspace",      url: "https://www.headspace.com/careers" },
    { name: "Hims & Hers",    url: "https://www.hims.com/careers" },
    { name: "Color Health",   url: "https://www.color.com/careers" },
    { name: "Devoted Health", url: "https://www.devoted.com/careers" },
    { name: "Ro",             url: "https://ro.co/careers/" },
    { name: "Transcarent",    url: "https://transcarent.com/careers" },

    // ── EDTECH ──
    { name: "Duolingo",       url: "https://careers.duolingo.com/jobs" },
    { name: "Coursera",       url: "https://careers.coursera.org/jobs" },
    { name: "Chegg",          url: "https://careers.chegg.com/jobs" },
    { name: "Newsela",        url: "https://newsela.com/about/careers/" },
    { name: "Kahoot",         url: "https://kahoot.com/careers/" },

    // ── CONSUMER & SOCIAL ──
    { name: "Reddit",         url: "https://www.redditinc.com/careers" },
    { name: "Discord",        url: "https://discord.com/careers" },
    { name: "Snap",           url: "https://careers.snap.com/jobs" },
    { name: "Pinterest",      url: "https://www.pinterestcareers.com/jobs/" },
    { name: "Bumble",         url: "https://team.bumble.com/open-roles" },
  ],
};

function checkJobAlerts() {
  const sheet = getOrCreateSheet();
  const seenJobs = getSeenJobs(sheet);
  const newJobs = [];

  const total = CONFIG.companies.length;
  const batchIndex = getCurrentBatchIndex();
  const start = (batchIndex * CONFIG.batchSize) % total;
  const end = Math.min(start + CONFIG.batchSize, total);
  const batch = CONFIG.companies.slice(start, end);

  Logger.log(`Processing batch ${batchIndex + 1}: companies ${start + 1}–${end} of ${total}`);

  batch.forEach((company) => {
    try {
      const response = UrlFetchApp.fetch(company.url, {
        muteHttpExceptions: true,
        followRedirects: true,
        timeoutSeconds: CONFIG.fetchTimeout / 1000,
      });

      if (response.getResponseCode() !== 200) {
        Logger.log(`${company.name}: HTTP ${response.getResponseCode()}, skipping`);
        return;
      }

      const html = response.getContentText().toLowerCase();
      const matches = findKeywordMatches(html, company.name, company.url);

      matches.forEach((job) => {
        const jobKey = `${company.name}|${job.keyword}`;
        if (!seenJobs.has(jobKey)) {
          newJobs.push(job);
          markJobSeen(sheet, jobKey);
          seenJobs.add(jobKey);
        }
      });

      Logger.log(`${company.name}: OK (${matches.length} matches)`);
    } catch (e) {
      Logger.log(`${company.name}: Error — ${e.message}`);
    }
  });

  saveBatchIndex(batchIndex + 1);

  if (newJobs.length > 0) {
    sendAlertEmail(newJobs);
    Logger.log(`Alert sent for ${newJobs.length} new job(s).`);
  } else {
    Logger.log("No new jobs found this batch.");
  }
}

function getCurrentBatchIndex() {
  const props = PropertiesService.getScriptProperties();
  const idx = parseInt(props.getProperty("batchIndex") || "0", 10);
  const total = CONFIG.companies.length;
  const maxBatches = Math.ceil(total / CONFIG.batchSize);
  return idx % maxBatches;
}

function saveBatchIndex(idx) {
  PropertiesService.getScriptProperties().setProperty("batchIndex", String(idx));
}

function findKeywordMatches(html, companyName, url) {
  const found = [];
  CONFIG.keywords.forEach((keyword) => {
    if (html.includes(keyword.toLowerCase())) {
      found.push({
        company: companyName,
        keyword: keyword,
        url: url,
        foundAt: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
      });
    }
  });
  return found;
}

function sendAlertEmail(jobs) {
  const subject = `🚀 Job Alert: ${jobs.length} new PM/BA or software engineering opening(s) found!`;

  let body = `Hi there,\n\nNew product, business analysis, or software engineering roles were detected on the following career pages:\n\n`;

  jobs.forEach((job) => {
    body += `──────────────────────\n`;
    body += `🏢 Company:  ${job.company}\n`;
    body += `🔍 Matched:  "${job.keyword}"\n`;
    body += `🔗 Link:     ${job.url}\n`;
    body += `🕐 Found at: ${job.foundAt} ET\n\n`;
  });

  body += `──────────────────────\n`;
  body += `Visit each link above to view the full job listing.\n\n`;
  body += `Good luck!\n— Your Job Alert System`;

  GmailApp.sendEmail(CONFIG.alertEmail, subject, body);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("SeenJobs");
  if (!sheet) {
    sheet = ss.insertSheet("SeenJobs");
    sheet.appendRow(["Job Key", "Date Seen"]);
  }
  return sheet;
}

function getSeenJobs(sheet) {
  const data = sheet.getDataRange().getValues();
  const seen = new Set();
  data.slice(1).forEach((row) => seen.add(row[0]));
  return seen;
}

function markJobSeen(sheet, jobKey) {
  sheet.appendRow([
    jobKey,
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
  ]);
}

function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("checkJobAlerts")
    .timeBased()
    .everyHours(1)
    .create();
  PropertiesService.getScriptProperties().setProperty("batchIndex", "0");
  Logger.log("Trigger set. Will process " + CONFIG.batchSize + " companies per hour.");
}

function testAlert() {
  sendAlertEmail([
    {
      company: "Stripe",
      keyword: "software engineer",
      url: "https://stripe.com/jobs/search",
      foundAt: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
    },
  ]);
  Logger.log("Test email sent to " + CONFIG.alertEmail);
}

function resetSeenJobs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("SeenJobs");
  if (sheet) {
    sheet.clearContents();
    sheet.appendRow(["Job Key", "Date Seen"]);
    Logger.log("SeenJobs sheet cleared.");
  }
  PropertiesService.getScriptProperties().setProperty("batchIndex", "0");
  Logger.log("Batch index reset to 0.");
}
