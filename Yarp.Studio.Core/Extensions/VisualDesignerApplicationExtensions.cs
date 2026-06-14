namespace Yarp.Studio.Core.Extensions;

using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Yarp.ReverseProxy.Configuration;
using Yarp.Studio.Core.Providers;

public static class VisualDesignerApplicationExtensions
{
    public static IReverseProxyBuilder AddYarpStudio(this IReverseProxyBuilder builder)
    {
        builder.Services.AddSingleton<VisualProxyConfigProvider>();
        builder.Services.AddSingleton<IProxyConfigProvider>(sp => sp.GetRequiredService<VisualProxyConfigProvider>());
        return builder;
    }

    public static IApplicationBuilder UseYarpVisualDashboard(this IApplicationBuilder app,
        string routePrefix = "yarp-designer")
    {
        var baseRoute = routePrefix.Trim('/');
        var env = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();

        app.UseRouting();

        // 1. Setup Data Synchronization & Core Functional Configuration APIs (Runs in both Dev & Prod)
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapGet($"/{baseRoute}/api/config", (VisualProxyConfigProvider provider) =>
            {
                var activeConfig = provider.GetConfig();
                return Results.Ok(new { routes = activeConfig.Routes, clusters = activeConfig.Clusters });
            });

            endpoints.MapPost($"/{baseRoute}/api/save-config",
                async (VisualProxyConfigProvider provider, Yarp.ReverseProxy.Configuration.IConfigValidator validator, YarpConfigPayload payload) =>
                {
                    if (payload == null) return Results.BadRequest(new { message = "Malformed payload." });

                    var errors = new List<string>();

                    if (payload.Routes != null)
                    {
                        foreach (var route in payload.Routes)
                        {
                            var routeErrors = await validator.ValidateRouteAsync(route);
                            if (routeErrors != null && routeErrors.Count > 0)
                            {
                                foreach (var err in routeErrors)
                                {
                                    errors.Add($"Route '{route.RouteId}': {err.Message}");
                                }
                            }
                        }
                    }

                    if (payload.Clusters != null)
                    {
                        foreach (var cluster in payload.Clusters)
                        {
                            var clusterErrors = await validator.ValidateClusterAsync(cluster);
                            if (clusterErrors != null && clusterErrors.Count > 0)
                            {
                                foreach (var err in clusterErrors)
                                {
                                    errors.Add($"Cluster '{cluster.ClusterId}': {err.Message}");
                                }
                            }
                        }
                    }

                    if (errors.Count > 0)
                    {
                        return Results.BadRequest(new { success = false, message = "Configuration validation failed.", errors });
                    }

                    provider.UpdateRuntimeConfig(
                        payload.Routes ?? new List<RouteConfig>(),
                        payload.Clusters ?? new List<ClusterConfig>()
                    );
                    return Results.Ok(new { success = true, message = "Proxy hot-reload executed successfully!" });
                });

            endpoints.MapGet($"/{baseRoute}/api/status", (Yarp.ReverseProxy.IProxyStateLookup lookup) =>
            {
                var clusters = lookup.GetClusters();
                var status = clusters.Select(c => new
                {
                    ClusterId = c.ClusterId,
                    Destinations = c.Destinations.Select(d => new
                    {
                        DestinationId = d.Key,
                        Address = d.Value.Model?.Config?.Address ?? "",
                        HealthActive = d.Value.Health.Active.ToString(),
                        HealthPassive = d.Value.Health.Passive.ToString(),
                        IsHealthy = d.Value.Health.Active != Yarp.ReverseProxy.Model.DestinationHealth.Unhealthy &&
                                    d.Value.Health.Passive != Yarp.ReverseProxy.Model.DestinationHealth.Unhealthy
                    }).ToList()
                }).ToList();
                return Results.Ok(status);
            });
        });

        // 2. Conditional UI Asset Handling (The Core One-Time Setup logic)
        var devServerUrl = "http://localhost:5173";
        if (env.IsDevelopment() && IsSpaDevelopmentServerRunning(devServerUrl))
        {
            // APPROACH B: In Local Development mode, dynamically forward static request routing
            // straight to your active running Vite dev environment server (typically on port 5173).
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "../yarp-studio-ui"; // Relative path to your frontend directory
                spa.UseProxyToSpaDevelopmentServer(devServerUrl);
            });
        }
        else
        {
            // NUGET PRODUCTION MODE: Read static elements compiled inside your shipping DLL 
            var assembly = Assembly.GetExecutingAssembly();
            var embeddedProvider = new EmbeddedFileProvider(assembly, "Yarp.Studio.UI");

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = embeddedProvider,
                RequestPath = new PathString($"/{baseRoute}")
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapGet($"/{baseRoute}/{{*path}}", async context =>
                {
                    var fileInfo = embeddedProvider.GetFileInfo("index.html");
                    if (fileInfo.Exists)
                    {
                        context.Response.ContentType = "text/html";
                        using var stream = fileInfo.CreateReadStream();
                        using var reader = new StreamReader(stream);
                        await context.Response.WriteAsync(await reader.ReadToEndAsync());
                    }
                    else
                    {
                        // Friendly fallback page when UI assets or dev server are missing
                        context.Response.ContentType = "text/html";
                        await context.Response.WriteAsync($@"
<!DOCTYPE html>
<html>
<head>
    <title>YARP Studio Dashboard</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }}
        .card {{ background: #1e293b; border-radius: 8px; padding: 2rem; max-width: 600px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #334155; }}
        h1 {{ color: #38bdf8; margin-top: 0; }}
        code {{ background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 4px; color: #f43f5e; }}
        ul {{ padding-left: 1.5rem; }}
        li {{ margin-bottom: 0.5rem; }}
    </style>
</head>
<body>
    <div class='card'>
        <h1>YARP Studio Dashboard</h1>
        <p>The dashboard interface could not be loaded because the static UI assets were not found:</p>
        <ul>
            <li><strong>Development:</strong> Make sure your Vite dev server is running on <a href='http://localhost:5173' style='color:#38bdf8;'>http://localhost:5173</a>.</li>
            <li><strong>Production:</strong> The embedded resource <code>Yarp.Studio.UI</code> was not found in assembly <code>{assembly.GetName().Name}</code>.</li>
        </ul>
    </div>
</body>
</html>");
                    }
                });
            });
        }

        return app;
    }

    private static bool IsSpaDevelopmentServerRunning(string url)
    {
        try
        {
            using var client = new System.Net.Http.HttpClient { Timeout = TimeSpan.FromMilliseconds(200) };
            using var response = client.GetAsync(url).GetAwaiter().GetResult();
            return true;
        }
        catch
        {
            return false;
        }
    }
}