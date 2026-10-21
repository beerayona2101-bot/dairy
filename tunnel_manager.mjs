import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "server_config.json");
const apiConfigPath = path.join(__dirname, "mobile", "lib", "config", "api_config.dart");
const cloudflaredPath = path.join(__dirname, "cloudflared.exe");

let activeProcess = null;
let currentLiveUrl = null;
let healthCheckTimer = null;
let consecutiveFailures = 0;

function updateConfigFileAndSync(activeUrl) {
  if (currentLiveUrl === activeUrl) return;
  currentLiveUrl = activeUrl;
  consecutiveFailures = 0;

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

    startHealthMonitor(activeUrl);
  } catch (err) {
    console.error("Failed to update config files:", err.message);
  }
}

function startHealthMonitor(url) {
  if (healthCheckTimer) clearInterval(healthCheckTimer);

  healthCheckTimer = setInterval(() => {
    if (!currentLiveUrl) return;
    try {
      const checkUrl = `${currentLiveUrl}/health`;
      const client = checkUrl.startsWith("https") ? https : http;
      const req = client.get(checkUrl, { timeout: 6000 }, (res) => {
        if (res.statusCode === 200) {
          consecutiveFailures = 0;
        } else {
          consecutiveFailures++;
          console.warn(`⚠️ Health check non-200 (${res.statusCode}) on ${checkUrl}. Failures: ${consecutiveFailures}`);
          if (consecutiveFailures >= 2) {
            triggerRestart("Health check failed 2 consecutive times");
          }
        }
      });
      req.on("error", (err) => {
        consecutiveFailures++;
        console.warn(`⚠️ Health check network error on ${checkUrl}: ${err.message}. Failures: ${consecutiveFailures}`);
        if (consecutiveFailures >= 2) {
          triggerRestart("Health check unreachable 2 consecutive times");
        }
      });
      req.on("timeout", () => {
        req.destroy();
        consecutiveFailures++;
        if (consecutiveFailures >= 2) {
          triggerRestart("Health check timed out");
        }
      });
    } catch (_) {}
  }, 45000);
}

function triggerRestart(reason) {
  console.log(`🔄 Restarting tunnel due to: ${reason}`);
  consecutiveFailures = 0;
  if (healthCheckTimer) clearInterval(healthCheckTimer);
  if (activeProcess) {
    try {
      if (process.platform === "win32" && activeProcess.pid) {
        execSync(`taskkill /pid ${activeProcess.pid} /f /t`, { stdio: "ignore" });
      } else {
        activeProcess.kill("SIGTERM");
      }
    } catch (_) {}
    activeProcess = null;
  }
}

function startTunnel() {
  console.log("🌐 Starting Cloudflare Public Tunnel with HTTP/2 protocol for port 9000...");
  
  // Use http2 protocol to prevent ISP QUIC/UDP dropping
  activeProcess = spawn(
    cloudflaredPath,
    ["tunnel", "--protocol", "http2", "--url", "http://127.0.0.1:9000"],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  const handleOutput = (data) => {
    const text = data.toString();

    // Check for fatal Cloudflare tunnel revocation
    if (text.includes("Unauthorized: Tunnel not found") || text.includes("error=Unauthorized")) {
      console.warn("⚠️ Detected tunnel session revocation. Respawning fresh session...");
      triggerRestart("Cloudflare tunnel session revoked");
      return;
    }

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

  activeProcess.stdout.on("data", handleOutput);
  activeProcess.stderr.on("data", handleOutput);

  activeProcess.on("close", (code) => {
    console.log(`⚠️ Tunnel process exited (code ${code}). Auto-restarting in 4 seconds...`);
    activeProcess = null;
    setTimeout(startTunnel, 4000);
  });

  activeProcess.on("error", (err) => {
    console.error("Cloudflare tunnel spawn error:", err.message);
    activeProcess = null;
    setTimeout(startTunnel, 4000);
  });
}

startTunnel();
