// server.js

// ===================================================================================
//  A. SETUP AND CONFIGURATION
// ===================================================================================

// Import necessary packages.
// 'dotenv' loads environment variables from a .env file into process.env
// 'express' is for creating the web server.
// '@notionhq/client' is the official Notion SDK.
// 'cors' is to allow our HTML form (on a different "origin") to talk to our server.
require('dotenv').config();
const express = require('express');
const { Client } = require('@notionhq/client');
const cors = require('cors');

// Initialize the express app.
const app = express();
//const PORT = 3000; // The port our server will run on.
const port = process.env.PORT || 8080;   // 6aug2025 changed

// --- IMPORTANT: CONFIGURE YOUR .env FILE ---
// Create a file named ".env" in the same directory as this server.js file.
// Add the following two lines to your .env file, replacing the placeholders:
//
// NOTION_API_KEY="YOUR_SECRET_NOTION_API_KEY"
// NOTION_DATABASE_ID="YOUR_NOTION_DATABASE_ID"
//
// This is a more secure way to handle your secret keys.
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Initialize the Notion client with your API key.
const notion = new Client({ auth: NOTION_API_KEY });

// ===================================================================================
//  B. MIDDLEWARE
// ===================================================================================

// Use the CORS middleware to allow cross-origin requests.
app.use(cors());

// Use express.json() middleware to parse incoming JSON payloads from the form.
app.use(express.json());


// ===================================================================================
//  C. THE API ROUTE
// ===================================================================================

// Define a POST route at '/api/submit-to-notion'.
app.post('/api/submit-to-notion', async (req, res) => {
    // Get the registration data from the request body.
    const data = req.body;

    // --- CRITICAL: NOTION DATABASE MAPPING ---
    // The keys in this 'properties' object (e.g., 'Full Name') MUST EXACTLY MATCH
    // the column names in your Notion database. This is case-sensitive.
    //
    // HOW TO FIX THE ORIGINAL ERROR:
    // 1. Open your Notion Database.
    // 2. For each line below, change the string on the LEFT to be a perfect match
    //    of your column name in Notion.
    // 3. Ensure the Notion Data Type (e.g., 'title', 'email', 'rich_text') is correct.

    try {
        const response = await notion.pages.create({
            parent: { database_id: NOTION_DATABASE_ID },
            properties: {
                // --- Registrant Details ---
                'Name': { // This is the 'Title' property of the database.
                    title: [{ text: { content: `${data.firstName || ''} ${data.lastName || ''}` } }]
                },
                'First Name': {
                    rich_text: [{ text: { content: data.firstName || '' } }]
                },
                'Last Name': {
                    rich_text: [{ text: { content: data.lastName || '' } }]
                },
                'Preferred Name': {
                    rich_text: [{ text: { content: data.preferredName || 'N/A' } }]
                },
                'Email': {
                    email: data.email || null // Must be an Email type column in Notion
                },
                'Phone Number': { // Note: JSON key is 'phoneNumber'
                    phone_number: data.phoneNumber || null // Must be a Phone type column in Notion
                },
                'Membership #': { // Note: JSON key is 'membershipNumber'
                    rich_text: [{ text: { content: data.membershipNumber || '' } }]
                },
                'Membership Expiry': {
                    date: { start: data.membershipExpiry || null } // Must be a Date type column in Notion
                },
                'Chapter': { // Note: JSON key is 'chapterName'
                    rich_text: [{ text: { content: data.chapterName || 'Individual Member' } }]
                },
                'Mailing Address': {
                    rich_text: [{ text: { content: data.mailingAddress || '' } }]
                },

                // --- Additional Info ---
                'Emergency Contact': { // Note: JSON key is 'emergencyContactName'
                    rich_text: [{ text: { content: data.emergencyContactName || '' } }]
                },
                 'Emergency Contact Relationship': {
                    rich_text: [{ text: { content: data.emergencyContactRelationship || '' } }]
                },
                'Emergency Phone': { // Note: JSON key is 'emergencyContactNumber'
                    phone_number: data.emergencyContactNumber || null
                },
                'Emergency Contact Travelling': { // Must be a Select or Text column
                    select: { name: data.emergencyContactTravelling || 'No' }
                },
                'First Seminar': { // Must be a Select or Text column
                    select: { name: data.firstSeminar || 'No' }
                },
                'Class Angel': { // Must be a Select or Text column
                    select: { name: data.classAngel || 'No' }
                },
                 'Accommodations': {
                    rich_text: [{ text: { content: data.accommodations || '' } }]
                },

                // --- Class Selections (Rich Text is a safe default) ---
                'Session A Choice 1': { rich_text: [{ text: { content: data.sessionAChoice1 || 'N/A' } }] },
                'Session A Choice 2': { rich_text: [{ text: { content: data.sessionAChoice2 || 'N/A' } }] },
                'Session A Choice 3': { rich_text: [{ text: { content: data.sessionAChoice3 || 'N/A' } }] },
                'Session B Choice 1': { rich_text: [{ text: { content: data.sessionBChoice1 || 'N/A' } }] },
                'Session B Choice 2': { rich_text: [{ text: { content: data.sessionBChoice2 || 'N/A' } }] },
                'Session B Choice 3': { rich_text: [{ text: { content: data.sessionBChoice3 || 'N/A' } }] },
                'Options Day Choice 1': { rich_text: [{ text: { content: data.optionsDayChoice1 || 'N/A' } }] },
                'Options Day Choice 2': { rich_text: [{ text: { content: data.optionsDayChoice2 || 'N/A' } }] },
                'Options Day Choice 3': { rich_text: [{ text: { content: data.optionsDayChoice3 || 'N/A' } }] },
                
                // --- Additional Options ---
                'Virtual Classes': { // For a Multi-select column, use: multi_select: (data.virtualClasses || []).map(name => ({ name }))
                    rich_text: [{ text: { content: (data.virtualClasses || []).join(', ') || 'None' } }]
                },
                'Evening Lecture': { select: { name: data.eveningLecture || 'No' } },
                'Evening Lecture Tickets': { number: Number(data.eveningLectureTicketCount) || 0 },
                'Opening Reception Tickets': { select: { name: data.buyOpeningReceptionTickets || 'No' } },
                'Opening Reception Ticket Count': { number: Number(data.openingReceptionTicketCount) || 0 },
                'Opening Reception Guest Details': { rich_text: [{ text: { content: data.openingReceptionGuestDetails || 'N/A' } }] },
                'Luncheon Tickets': { select: { name: data.buyLuncheonTickets || 'No' } },
                'Luncheon Ticket Count': { number: Number(data.luncheonTicketCount) || 0 },
                'Luncheon Guest Details': { rich_text: [{ text: { content: data.luncheonGuestDetails || 'N/A' } }] },
                'Banquet Tickets': { select: { name: data.buyBanquetTickets || 'No' } },
                'Banquet Ticket Count': { number: Number(data.banquetTicketCount) || 0 },
                'Banquet Guest Details': { rich_text: [{ text: { content: data.banquetGuestDetails || 'N/A' } }] },
                'Market Night Member Type': { select: { name: data.marketNightMemberType || 'N/A' } },
                'Market Night Business Name': { rich_text: [{ text: { content: data.marketNightBusinessName || 'N/A' } }] },
                'Market Night Merch Desc': { rich_text: [{ text: { content: data.marketNightMerchDesc || 'N/A' } }] },

                // --- Financials & Payment ---
                'Estimated Total': {
                    number: data.estimatedTotal || 0 // Must be a Number type column in Notion
                },
                'Payment Method': { // Must be a Select type column
                    select: { name: data.depositPaymentMethod || 'Not specified' }
                },
                'Installment Plan': { // Must be a Select type column
                    select: { name: data.installmentPayments || 'No' }
                }
            }
        });
        
        // If successful, send a success response back to the form.
        res.status(200).json({ message: 'Registration successfully submitted to Notion!', data: response });

    } catch (error) {
        // If there's an error, log it to the console for debugging.
        console.error('Error submitting to Notion:', error.body || error);
        
        // Send a detailed error message back to the form.
        res.status(500).json({ message: 'Failed to submit to Notion.', error: error.message });
    }
});


// ===================================================================================
//  D. START THE SERVER
// ===================================================================================

// Start the server and listen for connections on the specified port.
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
        console.warn('WARNING: Notion API Key or Database ID is not set in the .env file.');
    }
});

