const fs = require('fs');
const path = require('path');

const dirs = [
    'config',
    'models',
    'routes',
    'middleware',
    'controllers',
    'socket'
];

dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
        console.log(`Created directory: ${dir}`);
    }
});
