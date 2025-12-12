
const { connectDB } = require('./src/lib/mongodb');
const { Excursion } = require('./src/models/Excursion');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkExcursion() {
    try {
        await connectDB();
        const id = 'marrakech-quad-pilot-matin-0900-1200-55';
        const excursion = await Excursion.findOne({ id }).lean();

        if (!excursion) {
            console.log(`Excursion with ID ${id} not found.`);
        } else {
            console.log(`Excursion: ${excursion.id}`);
            console.log(`isAdultsOnly: ${excursion.isAdultsOnly}`);
            console.log('Full object keys:', Object.keys(excursion));
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // We can't easily close the connection if it's managed by the lib/mongodb cache, 
        // but for a script it's fine to just exit or let the process die.
        // However, to be clean for the run_command tool:
        process.exit(0);
    }
}

checkExcursion();
