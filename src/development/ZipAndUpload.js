import AdmZip from 'adm-zip';
import {NodeSSH} from 'node-ssh';
import { exit } from 'process';

const zipDirectory = async (sourceDir, outputFilePath) => {
    const zip = new AdmZip();
    zip.addLocalFolder(sourceDir);
    await zip.writeZipPromise(outputFilePath);
    console.log(`Zip file created: ${outputFilePath}`);
};

await zipDirectory('dist', 'intern/tmp/dist.zip');

const ssh = new NodeSSH()

await ssh.connect({
  host: 'online-ide.de',
  username: 'root',
  privateKeyPath: 'intern/keys/ssh_private_key.ppk'
})

await ssh.mkdir('/var/www/online-ide/htdocs-new')
await ssh.putFile('intern/tmp/dist.zip', '/var/www/online-ide/htdocs-new/dist.zip');
await ssh.execCommand('unzip ./dist.zip', {cwd: '/var/www/online-ide/htdocs-new'});
await ssh.execCommand('rm dist.zip', {cwd: '/var/www/online-ide/htdocs-new'});
await ssh.execCommand('mv htdocs htdocs-old', {cwd: '/var/www/online-ide'});
await ssh.execCommand('mv htdocs-new htdocs', {cwd: '/var/www/online-ide'});

exit();

// await ssh.getFile('intern/nohup.out', '/home/martin/nohup.out');
//      console.log("Hier!");



