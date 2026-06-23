# Contributing to YARP Studio

Thank you for your interest in contributing to YARP Studio! This guide explains how to set up your local development environment, build the frontend and backend, pack the library into a NuGet package, and test it locally in another application.

---

## 🛠️ Prerequisites

Before you start, make sure you have the following installed:
- **.NET 10.0 SDK** or higher
- **Node.js** (v18+) and **npm**

---

## 💻 Local Development

YARP Studio is comprised of a React SPA frontend (`yarp-studio-ui`) and a C# backend library (`Lgd.Yarp.Studio`). A playground application (`Playground.Gateway`) is provided to easily test changes locally.

### 1. Run the Frontend Dev Server
Navigate to the UI project directory and start Vite's dev server:
```bash
cd yarp-studio-ui/yarp-studio-ui
npm install
npm run dev
```
By default, the Vite dev server spins up on `http://localhost:5173`.

### 2. Run the Gateway Host (Backend)
In a new terminal window, run the Playground Gateway application:
```bash
cd Playground.Gateway
dotnet run
```
Open `http://localhost:5129/yarp-designer` in your browser. 

*Note: In development mode, the middleware automatically forwards static UI asset requests straight to the active Vite dev server (port 5173).*

---

## 📦 Packing the NuGet Package Locally

To package the project into a `.nupkg` archive (which embeds the compiled frontend UI directly into the C# DLL):

1. Navigate to the `Lgd.Yarp.Studio` project directory:
   ```bash
   cd Lgd.Yarp.Studio
   ```
2. Build and package the project in `Release` configuration:
   ```bash
   dotnet pack -c Release
   ```
3. The generated package will be saved to:
   `Lgd.Yarp.Studio/bin/Release/Lgd.Yarp.Studio.1.0.0.nupkg`

---

## 🧪 Testing the NuGet Package Locally

To test the generated NuGet package in an external local .NET application:

### Option A: Direct Path (Quickest)
You can add the package directly from your local filesystem path:
```bash
dotnet add package Lgd.Yarp.Studio -s /path/to/Yarp.Studio/Lgd.Yarp.Studio/bin/Release
```

### Option B: Local NuGet Feed (Recommended)
Creating a local feed allows you to test package upgrades easily:

1. **Create a local folder to act as your feed repository** (e.g., `~/local-nuget`):
   ```bash
   mkdir -p ~/local-nuget
   ```
2. **Copy the generated `.nupkg` to this folder**:
   ```bash
   cp Lgd.Yarp.Studio/bin/Release/Lgd.Yarp.Studio.1.0.0.nupkg ~/local-nuget/
   ```
3. **Register the local folder as a NuGet source**:
   ```bash
   dotnet nuget add source ~/local-nuget --name LocalFeed
   ```
4. **Install the package in your test project**:
   ```bash
   dotnet add package Lgd.Yarp.Studio --source LocalFeed
   ```

*Tip: If you package a new version (e.g., after making code edits), update the `<Version>` tag in `Lgd.Yarp.Studio.csproj`, repack it, copy it to the local feed, and update the version in your test application to prevent NuGet cache collisions.*
