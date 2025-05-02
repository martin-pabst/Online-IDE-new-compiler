import AdmZip from 'adm-zip';
import {NodeSSH} from 'node-ssh';
import { exit } from 'process';
import  chalk  from 'chalk'
import { mkdir } from 'fs';

const ssh = new NodeSSH()
const time = performance.now();

const d = new Date();
let hour = "" + d.getHours();
while(hour.length  < 2) hour = "0" + hour;

let minute = "" + d.getMinutes();
while(minute.length < 2) minute = "0" + minute;

let seconds = "" + d.getSeconds();
while(seconds.length < 2) seconds = "0" + seconds;

const date = d.getDate() + "." + d.getMonth() + "." + d.getFullYear + ",_" + hour + "_" + minute + "_" + seconds;

const zipDirectory = async (sourceDir, outputFilePath) => {
    const zip = new AdmZip();
    zip.addLocalFolder(sourceDir);
    await zip.writeZipPromise(outputFilePath);
    console.log(`Zip file created: ${outputFilePath}`);
};

console.log(chalk.blue('Zipping the dist directory...'));
mkdir('intern/tmp', { recursive: true }, (err) => {
  if (err) throw err;
});
await zipDirectory('dist', 'intern/tmp/dist.zip');

await ssh.connect({
  host: 'online-ide.de',
  username: 'root',
  privateKeyPath: 'intern/keys/ssh_private_key.ppk'
})


console.log(chalk.blue('Uploading the zip file to the server...'));
await ssh.mkdir('/var/www/online-ide/htdocs-new')
await ssh.putFile('intern/tmp/dist.zip', '/var/www/online-ide/htdocs-new/dist.zip');

console.log(chalk.blue('Unzipping the file on the server...'));
await ssh.execCommand('unzip ./dist.zip', {cwd: '/var/www/online-ide/htdocs-new'});

console.log(chalk.blue('tidying up...'));
await ssh.execCommand('rm dist.zip', {cwd: '/var/www/online-ide/htdocs-new'});

await ssh.execCommand('mv htdocs /home/martin/backup/program_files/online-ide/htdocs-old_' + date, {cwd: '/var/www/online-ide'});
await ssh.execCommand('mv ./htdocs-new htdocs', {cwd: '/var/www/online-ide'});

ssh.dispose();
console.log(chalk.green('Done deploying to www.online-ide.de!'));


/* Embedded-Version */

console.log(chalk.blue('Zipping the dist-embedded/assets directory...'));
mkdir('intern/tmp', { recursive: true }, (err) => {
  if (err) throw err;
});
await zipDirectory('dist-embedded/assets', 'intern/tmp/assets.zip');


await ssh.connect({
  host: 'mathe-pabst.de',
  username: 'root',
  privateKeyPath: 'intern/keys/ssh_private_key.ppk'
})


console.log(chalk.blue('Uploading files to the server...'));
await ssh.putFile('dist-embedded/online-ide-embedded.css', '/var/www/learnj.de/htdocs/javaonline/online-ide-embedded.css');
await ssh.putFile('dist-embedded/online-ide-embedded.js', '/var/www/learnj.de/htdocs/javaonline/online-ide-embedded.js');
await ssh.putFile('dist-embedded/online-ide-embedded.js.map', '/var/www/learnj.de/htdocs/javaonline/online-ide-embedded.js.map');
await ssh.putFile('dist-embedded/includeIDE.js', '/var/www/learnj.de/htdocs/javaonline/includeIDE.js');

await ssh.mkdir('/var/www/learnj.de/htdocs/javaonline/assets-new');
await ssh.putFile('intern/tmp/assets.zip', '/var/www/learnj.de/htdocs/javaonline/assets-new/assets.zip');

console.log(chalk.blue('Unzipping the file on the server...'));
await ssh.execCommand('unzip ./assets.zip', {cwd: '/var/www/learnj.de/htdocs/javaonline/assets-new'});

console.log(chalk.blue('tidying up...'));
await ssh.execCommand('rm assets.zip', {cwd: '/var/www/learnj.de/htdocs/javaonline/assets-new'});

await ssh.execCommand('rm -r ./assets', {cwd: '/var/www/learnj.de/htdocs/javaonline'});
await ssh.execCommand('mv assets-new assets', {cwd: '/var/www/learnj.de/htdocs/javaonline'});

await ssh.execCommand('/var/www/embed1.learnj.de/makeArchive.sh', {cwd: '/var/www/learnj.de/htdocs/javaonline'});

console.log(chalk.green('Done deploying to www.learnj.de in ' + Math.round(performance.now() - time) + ' ms!'));

exit();

