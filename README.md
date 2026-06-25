# Job Alert Script — US PM/BA Job Tracker

A Google Apps Script that monitors 50 top US product company career pages and emails you instantly when a new Product Manager, Business Analyst, or related role is posted.

## What it does

- Visits each company's career page every hour automatically
- Scans for keywords like "product manager", "business analyst", "program manager", "product analyst", and more
- Logs matches to a Google Sheet to avoid duplicate alerts
- Emails you instantly when something new is found
- Processes companies in small batches to avoid timeout errors
- All timestamps in US Eastern Time (ET)

## Companies tracked (50 total)

### Fintech
Stripe, Robinhood, Chime, Brex, Plaid, Affirm, Marqeta, Carta, Rippling, Ramp

### B2B SaaS
Notion, Figma, Airtable, Asana, Calendly, Monday.com, HubSpot, Zendesk, Intercom, Loom, Miro, Amplitude, Mixpanel, Segment (Twilio)

### E-Commerce & Marketplace
DoorDash, Instacart, Faire, Poshmark, StockX, Whatnot

### Mobility & Travel
Lyft, Waymo, Bird, Hopper, Sonder

### Healthtech
Headspace, Hims & Hers, Color Health, Devoted Health, Ro, Transcarent

### Edtech
Duolingo, Coursera, Chegg, Newsela, Kahoot

### Consumer & Social
Reddit, Discord, Snap, Pinterest, Bumble

## Keywords tracked

- product manager
- senior product manager
- associate product manager
- product owner
- business analyst
- product analyst
- program manager
- growth product manager
- technical product manager
- staff product manager
- principal product manager

## Setup (10 minutes)

1. Go to sheets.google.com and create a new blank Google Sheet
2. Click Extensions → Apps Script
3. Delete the default code and paste the contents of JobAlertScript_US.js
4. Update `alertEmail` in CONFIG at the top with your email address
5. Run `setupTrigger()` once — Google will ask for permissions, click Allow
6. Run `testAlert()` to confirm you receive a test email
7. Done — runs automatically every hour from here

## Customisation

To add more companies, add a new line inside the `companies` array in CONFIG:
```
{ name: "CompanyName", url: "https://company.com/careers" }
```

To add more keywords, add them to the `keywords` array in CONFIG.

To change the number of companies checked per hour, update `batchSize` in CONFIG. Default is 5.

## How it handles the 6-minute timeout limit

Google Apps Script times out after 6 minutes. This script processes companies in small batches per run and uses PropertiesService to remember where it left off — so all 50 companies are checked across multiple runs without hitting the limit.

With batch sizes of 5 and 50 companies, all companies are covered every 10 hours. For more frequent full coverage, increase batchSize to 10 (still well within the timeout limit for most pages).

## Notes on US career pages

Some US companies (especially larger ones) load job listings via JavaScript after the page loads. If a company consistently shows 0 matches despite having open roles, their listings may be loaded dynamically and won't be visible to a basic URL fetch. In that case, check if the company has a public jobs API or an Ashby/Greenhouse/Lever-hosted listing page, and use that URL instead.

Example alternatives:
- Greenhouse-hosted: `https://boards.greenhouse.io/companyname`
- Lever-hosted: `https://jobs.lever.co/companyname`
- Ashby-hosted: `https://jobs.ashbyhq.com/companyname`
