using LiteDB;
using Yarp.ReverseProxy.Configuration;
using Yarp.Studio.Core.Storage;

namespace Yarp.Studio.Core.Providers;

public class VisualProxyConfigProvider : IProxyConfigProvider
{
    private volatile VisualMemoryConfig _config;
    private readonly string _connectionString;
    private const string CollectionName = "gateway_config";

    public VisualProxyConfigProvider()
    {
        // Resolve our dynamic multi-environment file path string
        _connectionString = DatabasePathResolver.GetConnectionString();
        
        // Load whatever layout exists on disk or initialize clean empty arrays
        _config = LoadInitialConfigFromDatabase();
    }

    public IProxyConfig GetConfig() => _config;

    public void UpdateRuntimeConfig(IReadOnlyList<RouteConfig> routes, IReadOnlyList<ClusterConfig> clusters)
    {
        // 1. Persist changes down onto the permanent LiteDB file partition
        using (var db = new LiteDatabase(_connectionString))
        {
            var col = db.GetCollection<YarpConfigWrapper>(CollectionName);
            
            var entity = new YarpConfigWrapper
            {
                Id = 1, // Keep overwriting record #1 so we only store the latest state snapshot
                Routes = routes.ToList(),
                Clusters = clusters.ToList(),
                LastUpdated = DateTime.UtcNow
            };

            col.Upsert(entity);
        }

        // 2. Hot-swap active memory layer instantly for live traffic processing
        var oldConfig = _config;
        _config = new VisualMemoryConfig(routes, clusters);
        oldConfig.SignalChange(); 
    }

    private VisualMemoryConfig LoadInitialConfigFromDatabase()
    {
        using var db = new LiteDatabase(_connectionString);
        var col = db.GetCollection<YarpConfigWrapper>(CollectionName);
        var storedState = col.FindById(1);

        if (storedState != null)
        {
            return new VisualMemoryConfig(storedState.Routes, storedState.Clusters);
        }

        // Default fallback if database file is fresh/blank
        return new VisualMemoryConfig(new List<RouteConfig>(), new List<ClusterConfig>());
    }
}