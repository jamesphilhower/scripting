import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import axios, { AxiosResponse } from 'axios';

const process1 = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    exec('sleep 5 && echo "Test" && false', (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const log = (message: string, logFile: string): void => {
  const timestampedMessage = `${new Date().toISOString()}: ${message}`;
  fs.appendFileSync(logFile, timestampedMessage + '\n');
  console.log(timestampedMessage);
};

const failCountDir = './failures';

// Create the directory if it does not exist
if (!fs.existsSync(failCountDir)) {
  fs.mkdirSync(failCountDir);
}

const failFiles = fs.readdirSync(failCountDir).filter(f => f.startsWith('fail_file_')).sort();
const lastFile = failFiles.length ? failFiles[failFiles.length - 1] : null;

const number = lastFile ? parseInt(lastFile.split('_')[2], 10) + 1 : 1;
const failCountFile = path.join(failCountDir, `fail_file_${number}`);
fs.writeFileSync(failCountFile, '0');

const logFile = path.join(process.cwd(), 'process_log.txt');
log('Starting the process...', logFile);

let failCount = 0;

const runProcess = async () => {
  const success = await process1();

  if (!success && failCount < 10) {
    failCount++;
    log(`Process ended with failure, incrementing failure count to ${failCount}...`, logFile);
    fs.writeFileSync(failCountFile, failCount.toString());
    
    log('Restarting the process...', logFile);
    await runProcess();
  } else if (failCount >= 10) {
    log('Process has failed 10 times, sending email notification...', logFile);
    
    await sendEmail('Helm in JS -- Process failed 10 times');
  }
};


const sendEmail = async (message: string): Promise<void> => {
    const SENDGRID_API_KEY: string = process.env.SENDGRID_API_KEY as string;
  
    try {
      const data = {
        personalizations: [{ to: [{ email: 'jamesphilhower@gmail.com' }] }],
        from: { email: 'jamesphilhower@gmail.com' },
        subject: `Helm in JS -- ${message}`,
        content: [{ type: 'text/plain', value: `Helm in JS -- ${message}. Failure occurred at ${new Date().toDateString}` }]
      };
  
      const response: AxiosResponse = await axios.post('https://api.sendgrid.com/v3/mail/send', data, {
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Email sent:', response.status);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

runProcess();
