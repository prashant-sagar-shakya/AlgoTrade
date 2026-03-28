import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clusterHostname = 'algotrade.bqsiglm.mongodb.net';

console.log('🔍 Querying Google DNS-over-HTTPS to bypass local network DNS blocks...');

// Get SRV records
https.get(`https://dns.google/resolve?name=_mongodb._tcp.${clusterHostname}&type=SRV`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (!json.Answer) {
        console.error('❌ Failed to find SRV records. Is the cluster hostname correct?');
        return;
      }
      
      const hosts = json.Answer.map(a => {
        // data format: "0 0 27017 ac-XXXXX.mongodb.net."
        const parts = a.data.split(' ');
        const port = parts[2] || 27017;
        const host = parts[3].endsWith('.') ? parts[3].slice(0, -1) : parts[3];
        return `${host}:${port}`;
      });

      // Get TXT records (contains replicaSet and authSource)
      https.get(`https://dns.google/resolve?name=${clusterHostname}&type=TXT`, (txtRes) => {
        let txtData = '';
        txtRes.on('data', chunk => txtData += chunk);
        txtRes.on('end', () => {
          let options = '';
          try {
            const txtJson = JSON.parse(txtData);
            if (txtJson.Answer && txtJson.Answer.length > 0) {
              const txt = txtJson.Answer[0].data.replace(/^"|"$/g, '');
              options = txt;
            }
          } catch (e) {}

          const fullOptions = `${options}${options ? '&' : ''}ssl=true`;
          
          console.log('\n✅ Bypassed successfully! Here are your direct backend servers:');
          console.log(hosts.join(', '));
          
          // Build new connection string
          // Assume user's current env has credentials, let's just spit out the format
          const envPath = path.join(__dirname, '.env.local');
          if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
            if (match) {
              const user = match[1];
              const pass = match[2];
              
              const newUri = `mongodb://${user}:${pass}@${hosts.join(',')}/algotrade?${fullOptions}`;
              
              // Replace in env
              envContent = envContent.replace(/^MONGO_URI=.*$/m, `MONGO_URI=${newUri}`);
              fs.writeFileSync(envPath, envContent);
              
              console.log('\n🎉 Successfully updated .env.local with the direct bypass string!');
              console.log('\nYou can now restart your dev server (Ctrl+C -> npm run dev)');
            } else {
               console.log('\nCould not parse credentials from .env.local. Please copy this format:');
               console.log(`mongodb://<user>:<password>@${hosts.join(',')}/algotrade?${fullOptions}`);
            }
          }
        });
      });
    } catch (e) {
      console.error('Error parsing DNS response:', e);
    }
  });
}).on('error', (e) => {
  console.error(e);
});
