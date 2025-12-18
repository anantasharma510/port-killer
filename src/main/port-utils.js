import { exec } from 'child_process';
import path from 'path';

// Helper to get absolute path to system binaries
// This prevents "Command not found" errors in packaged Electron apps where PATH might be stripped
const getSystemBinary = (binaryName) => {
  const systemRoot = process.env.SystemRoot || 'C:\\Windows';
  const system32 = path.join(systemRoot, 'System32');
  
  if (binaryName === 'powershell') {
    return path.join(system32, 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  }
  return path.join(system32, `${binaryName}.exe`);
};

// Define constants for robust usage
const CMD_NETSTAT = getSystemBinary('netstat');
const CMD_TASKKILL = getSystemBinary('taskkill');
const CMD_TASKLIST = getSystemBinary('tasklist');
const CMD_POWERSHELL = getSystemBinary('powershell');

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    // Increase buffer size to 10MB to prevent crashes on busy systems
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        // Some commands write to stderr but exit 0.
        console.warn(`[Command Warnings]: ${stderr}`);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

// ... existing getProcessMap and getPorts ... (We will preserve them via "unchanged" chunks if possible, but simplest is to overwrite carefully or use the tool wisely. 
// Actually, I need to replace getParentPid and killPort mostly. 
// I'll rewrite the whole file for safety to ensure imports/exports match.

async function getProcessMap() {
  try {
    // Use fully qualified path for tasklist
    const stdout = await executeCommand(`"${CMD_TASKLIST}" /NH /FO CSV`);
    const map = new Map();
    const lines = stdout.trim().split('\r\n');
    lines.forEach(line => {
      const parts = line.split('","');
      if (parts.length >= 2) {
        const name = parts[0].replace(/"/g, '');
        const pid = parts[1].replace(/"/g, '');
        map.set(pid, name);
      }
    });
    return map;
  } catch (err) {
    console.error('Error fetching process list:', err);
    return new Map();
  }
}

async function getPorts() {
  try {
    const [netstatOutput, processMap] = await Promise.all([
      // Use fully qualified path for netstat
      executeCommand(`"${CMD_NETSTAT}" -ano`),
      getProcessMap()
    ]);

    const lines = netstatOutput.trim().split('\r\n');
    const ports = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('Active') || line.startsWith('Proto')) continue;

        const parts = line.split(/\s+/);
        if (parts.length < 5) continue;

        const proto = parts[0];
        const localAddress = parts[1];
        let pid = parts[parts.length - 1];
        
        // Basic filtering for TCP/UDP listening
        let shouldInclude = false;
        if (proto === 'TCP' && line.includes('LISTENING')) shouldInclude = true;
        else if (proto === 'UDP') shouldInclude = true;

        if (shouldInclude) {
            const lastColonIndex = localAddress.lastIndexOf(':');
            const port = localAddress.substring(lastColonIndex + 1);
            
            ports.push({
                port: parseInt(port),
                pid: pid,
                processName: processMap.get(pid) || 'Unknown',
                protocol: proto
            });
        }
    }
    
    // Deduplicate
    const uniquePorts = [];
    const seen = new Set();
    ports.forEach(p => {
        const key = `${p.port}-${p.protocol}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniquePorts.push(p);
        }
    });

    return uniquePorts.sort((a, b) => a.port - b.port);
  } catch (error) {
    console.error('Error in getPorts:', error);
    throw error;
  }
}

async function killPort(pid) {
  try {
     console.log(`[Main] Request to kill PID: ${pid}`);
     // Try standard taskkill with absolute path
     try {
       // quote the command path just in case
       await executeCommand(`"${CMD_TASKKILL}" /PID ${pid} /F /T`);
       return true;
     } catch (tkError) {
       console.warn(`[Main] taskkill failed, trying PowerShell...`, tkError);
       // Fallback to PowerShell
       await executeCommand(`"${CMD_POWERSHELL}" -NoProfile -Command "Stop-Process -Id ${pid} -Force"`);
       return true;
     }
  } catch (error) {
    console.error(`[Main] Error killing PID ${pid}:`, error);
    throw error; // UI will show the error details now
  }
}

async function getParentPid(pid) {
  try {
     // Use PowerShell with absolute path
     const output = await executeCommand(`"${CMD_POWERSHELL}" -NoProfile -Command "(Get-CimInstance Win32_Process -Filter 'ProcessId = ${pid}').ParentProcessId"`);
     const ppt = output.trim();
     if (ppt && !isNaN(ppt)) {
         return ppt;
     }
     return null;
  } catch (error) {
     console.error('Error getting parent PID:', error);
     return null;
  }
}

export { getPorts, killPort, getParentPid }
