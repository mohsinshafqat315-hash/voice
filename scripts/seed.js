// Seeding script - populates database with sample data
// Runs seeders for development and testing

require('dotenv').config();
const { seed } = require('../database/seeders/seed');

seed();
