# YARP Studio

[![NuGet Version](https://img.shields.io/nuget/v/Lgd.Yarp.Studio.svg?style=flat-square)](https://www.nuget.org/packages/Lgd.Yarp.Studio)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

A modern, visual administrative dashboard and designer for **YARP (Yet Another Reverse Proxy)**. YARP Studio allows developers and administrators to manage reverse proxy configurations (routes, clusters, destinations) dynamically through a web interface, persisting changes to a lightweight embedded database with zero-downtime hot-reloads.

---

## ✨ Features

![YARP Studio Dashboard](https://github.com/nithin-charles/Yarp.Studio/blob/master/asset/yarp-studio.png)

- **🌐 Live Topology Visualizer**: Trace traffic flow from public routes through authentication, CORS, and transforms to target clusters.
- **🛣️ Route Builder & Editor**: Define routing matchers (paths, methods, host headers), configure policies, and add path/header transforms.
- **🖥️ Cluster & Destination Manager**: Configure load-balancing, active/passive health checks, and manage backend destination addresses.
- **🧪 Routing Playground**: Test and dry-run HTTP requests to verify routing matches and transformations.
- **⚡ Hot-Reload Integration**: Save configuration updates instantly into the running gateway without restarting the application.

---

## 🚀 Getting Started

### 1. Installation

Install the NuGet package to your ASP.NET Core gateway host project:

```bash
dotnet add package Lgd.Yarp.Studio
```

### 2. Configure Services & Middleware

Register YARP Studio in your `Program.cs` file:

```csharp
using Lgd.Yarp.Studio.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add YARP and integrate Lgd.Yarp.Studio configuration provider
builder.Services.AddReverseProxy()
                .AddYarpStudio();

var app = builder.Build();

app.UseHttpsRedirection();

// Map visual designer dashboard REST APIs and UI files
// By default, the UI is served at `/yarp-designer`
app.UseYarpVisualDashboard();

// Map active proxy routes
app.MapReverseProxy();

app.Run();
```

### 3. Run the Dashboard

Start your gateway application and navigate to `http://localhost:<port>/yarp-designer` in your browser. The application will automatically initialize the database `yarp-studio.db` in your runtime directory.
