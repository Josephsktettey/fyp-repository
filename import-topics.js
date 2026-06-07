const XLSX = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push } = require('firebase/database');

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAzPQn5t_NOVwlNeyAz1lJh2S7xWmXgveY",
    authDomain: "fyp-repository-8edaa.firebaseapp.com",
    databaseURL: "https://fyp-repository-8edaa-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fyp-repository-8edaa",
    storageBucket: "fyp-repository-8edaa.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Read the spreadsheet
const workbook = XLSX.readFile('./2025 Project Topics (version 1).xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Import topics
async function importTopics() {
    let count = 0;
    const topicsRef = ref(database, 'topics');

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        // Column 1 topic
        if (row[0] && typeof row[0] === 'string' && row[0].trim() !== '') {
            await push(topicsRef, {
                title: row[0].trim(),
                department: 'Computer Science',
                year: 'Historical',
                status: 'approved',
                submittedBy: 'Historical Record',
                submittedByUid: 'historical',
                createdAt: new Date().toISOString()
            });
            count++;
            console.log(`Imported topic ${count}: ${row[0].trim().substring(0, 50)}...`);
        }

        // Column 4 topic
        if (row[3] && typeof row[3] === 'string' && row[3].trim() !== '') {
            await push(topicsRef, {
                title: row[3].trim(),
                department: 'Computer Science',
                year: 'Historical',
                status: 'approved',
                submittedBy: 'Historical Record',
                submittedByUid: 'historical',
                createdAt: new Date().toISOString()
            });
            count++;
            console.log(`Imported topic ${count}: ${row[3].trim().substring(0, 50)}...`);
        }
    }

    console.log(`\n✅ Done! Total topics imported: ${count}`);
    process.exit(0);
}

importTopics().catch(console.error);