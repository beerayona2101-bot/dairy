import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "server_config.json");
const apiConfigPath = path.join(__dirname, "mobile", "lib", "config", "api_config.dart");
const cloudflaredPath = path.join(__dirname, "cloudflared.exe");

let lastPushedUrl = null;

function updateConfigFileAndSync(activeUrl) {
  if (lastPushedUrl === activeUrl) return;
  lastPushedUrl = activeUrl;

  try {
    // 1. Update server_config.json
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    config.activeServerUrl = activeUrl;
    config.fallbackUrls = [
      activeUrl,
      "https://natural-milk-dairy.onrender.com",
      "http://10.39.242.110:9000"
    ];
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
    console.log(`\n✅ [1/3] Updated server_config.json with live URL: ${activeUrl}`);

    // 2. Update api_config.dart productionServerUrl
    if (fs.existsSync(apiConfigPath)) {
      let dartContent = fs.readFileSync(apiConfigPath, "utf-8");
      dartContent = dartContent.replace(
        /static const String productionServerUrl = 'https:\/\/[^']+';/,
        `static const String productionServerUrl = '${activeUrl}';`
      );
      fs.writeFileSync(apiConfigPath, dartContent, "utf-8");
      console.log(`✅ [2/3] Updated mobile/lib/config/api_config.dart`);
    }

    // 3. Git commit & push server_config.json so all installed APKs worldwide receive the new URL!
    try {
      console.log(`🚀 [3/3] Syncing updated server URL to GitHub...`);
      execSync('git add server_config.json', { cwd: __dirname, stdio: 'ignore' });
      execSync('git commit -m "chore: auto-sync live tunnel URL to server_config.json [skip ci]"', { cwd: __dirname, stdio: 'ignore' });
      execSync('git push origin main', { cwd: __dirname, stdio: 'ignore' });
      console.log(`✨ SUCCESS: GitHub raw config synced! All mobile APKs across any network are now connected!`);
    } catch (gitErr) {
      console.warn(`⚠️ Git auto-push warning (manual push may be needed): ${gitErr.message}`);
    }
  } catch (err) {
    console.error("Failed to update config files:", err.message);
  }
}

function startTunnel() {
  console.log("🌐 Starting Cloudflare Public Tunnel for port 9000...");
  const child = spawn(cloudflaredPath, ["tunnel", "--url", "http://127.0.0.1:9000"], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  const handleOutput = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match) {
      const publicUrl = match[0];
      console.log(`\n======================================================`);
      console.log(`🚀 LIVE GLOBAL APK URL: ${publicUrl}`);
      console.log(`📡 Storefront Health:   ${publicUrl}/health`);
      console.log(`======================================================\n`);
      updateConfigFileAndSync(publicUrl);
    }
  };

  child.stdout.on("data", handleOutput);
  child.stderr.on("data", handleOutput);

  child.on("close", (code) => {
    console.log(`⚠️ Tunnel process exited (code ${code}). Auto-restarting in 5 seconds...`);
    setTimeout(startTunnel, 5000);
  });

  child.on("error", (err) => {
    console.error("Cloudflare tunnel error:", err.message);
    setTimeout(startTunnel, 5000);
  });
}

startTunnel();
