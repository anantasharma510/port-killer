# Port Killer ⚡

> "Error: EADDRINUSE" — The nightmare we all know.

Hey there! I'm [Ananta Sharma](https://www.anantasharma.com.np/), and I built this because I faced the same problem every single day as a developer. You try to run your server, and boom—port 3000 is taken. You try port 8080, taken.

I got tired of running:
`netstat -ano | findstr :3000`
`taskkill /PID 1234 /F`

...over and over again. It's frustrating, it breaks your flow, and frankly, we have better things to build than wrestling with zombie processes.

So I made **Port Killer**.

## What is it?
It's a minimalist, lightning-fast desktop app that sits quietly in your tray (well, taskbar). It shows you **exactly** what you care about:
- Node.js processes? **Yes.**
- Python scripts? **Yes.**
- Random system junk? **Hidden by default.**

## Features
- **Instant Search**: Type "node" or "3000" and find it instantly.
- **One-Click Kill**: Terminate the process without mercy.
- **Safety First**: A confirmation dialog so you don't kill the wrong thing.
- **Dev Mode**: Filters out system noise so you only see your tools.
- **Admin Mode**: Restart as Admin with one click to kill stubborn tasks.

## Download
You can grab the latest installer from the releases page (or build it yourself!).

## Built With
- **Electron** (for the native feel)
- **React** (for the UI)
- **TailwindCSS** (for the clean, dark aesthetic)

## Disclaimer ⚠️
**Use this app at your own risk.** 

I am a developer learning the ropes, and I built this tool primarily for myself because I was tired of the CLI struggle. I'm sharing it in case it helps you too! I am not responsible for any data loss (or if you accidentally kill a critical system process because you ignored the warnings 😅).

---
Made with ❤️ by [Ananta Sharma](https://www.anantasharma.com.np/)
[Check out my GitHub](https://github.com/anantasharma510)

## Troubleshooting
### "Windows protected your PC" / Unknown Publisher
Since I am an individual developer and not a corporation, I don't have a $400/year Code Signing Certificate. Windows flags all unsigned apps by default.
1. Click **More Info**.
2. Click **Run Anyway**.
(The app is open source, so you can inspect the code yourself if you're worried!)
