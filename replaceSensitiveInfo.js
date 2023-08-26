const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const ignore = require('ignore');

const ig = ignore();
const gitignoreContent = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
ig.add(gitignoreContent);
ig.add(config.otherIgnoredPatterns);

const isIgnored = (filePath) => {
    // Convert absolute paths to relative for the ignore library to work properly
    const relativePath = path.relative(__dirname, filePath);

    // Returns true if the path should be ignored
    return ig.ignores(relativePath);
};


const directoryPath = './';  // Assuming you are running this at the root of your repo

const regexPatterns = {
    uuid: /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/gi,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
    phone: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,  // Simplified to match xxx-xxx-xxxx, xxx.xxx.xxxx, xxx xxx xxxx
    url: /\b((http|https):\/\/?)[^\s()<>]+\b/g
};

const processFile = (filePath) => {
    console.log('Processing file:', filePath)
    const content = fs.readFileSync(filePath, 'utf-8');

    // Flag items
    for (const [type, regex] of Object.entries(regexPatterns)) {
        const matches = content.match(regex);
        if (matches) {
            let notify = true
            // Skip items from leaveAlone section
            for (const item of config.leaveAlone) {
                if (content.includes(item)) {
                    notify = false
                }
            }
            for (const item of Object.keys(config.conversions)) {
                if (content.includes(item)) {
                    notify = false
                }
            }
            if (notify){
                console.log(`Found potential ${type} in ${filePath}:`, matches);
            }
        }
    }
   
    
    let updatedContent = content;

    // // Handle conversions
    for (const [oldString, newString] of Object.entries(config.conversions)) {
        updatedContent = updatedContent.replace(oldString, newString);
    }

    if (content != updatedContent) {
        //fs.writeFileSync(filePath, updatedContent, 'utf-8');
        console.log(`Updated ${filePath}`);
        console.log(updatedContent)
    }
};

const walkDirectory = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);

        if (isIgnored(filePath)) {
            continue;  // Skip this file or directory
        }

        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walkDirectory(filePath);
        } else if (stats.isFile()) {
            processFile(filePath);
        }
    }
};

walkDirectory(directoryPath);
