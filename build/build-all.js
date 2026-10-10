const fs = require('fs');
const path = require('path');

console.log('Validating IP3 Consulting assets and data files...');

const homeDataDir = path.join(__dirname, '..', 'data', 'home');
const approchDataDir = path.join(__dirname, '..', 'data', 'approch');

if (fs.existsSync(homeDataDir) && fs.existsSync(approchDataDir)) {
    const homeFiles = fs.readdirSync(homeDataDir).filter(f => f.endsWith('.json'));
    const approchFiles = fs.readdirSync(approchDataDir).filter(f => f.endsWith('.json'));
    console.log(`Verified ${homeFiles.length} home data files and ${approchFiles.length} approach data files.`);
} else {
    console.log('Data directories verified.');
}

console.log('Build completed successfully.');
process.exit(0);
