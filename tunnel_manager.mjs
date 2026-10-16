import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "server_config.json");
const cloudflaredPath = path.join(__dirname, "cloudflared.exe");

function updateConfigFile(activeUrl) {
  try {
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    config.activeServerUrl = activeUrl;
    config.fallbackUrls = [
      activeUrl,
      "http://192.168.1.84:9000"
    ];
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
    console.log(`\n✅ Updated server_config.json with live URL: ${activeUrl}`);
  } catch (err) {
    console.error("Failed to update server_config.json:", err.message);
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
      updateConfigFile(publicUrl);
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
