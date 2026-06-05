using LiteDB;
using Yarp.ReverseProxy.Configuration;
using Yarp.Studio.Core.Storage;

namespace Yarp.Studio.Core.Providers;

public class VisualProxyConfigProvider : IProxyConfigProvider
{
    private volatile VisualMemoryConfig _config;
    private readonly string _connectionString;
    private const string CollectionName = "gateway_config";

    static VisualProxyConfigProvider()
    {
        ConfigureBsonMapper();
    }

    private static void ConfigureBsonMapper()
    {
        var mapper = BsonMapper.Global;

        // Register custom mapping for read-only lists of YARP types
        RegisterReadOnlyList<string>(mapper);
        RegisterReadOnlyList<RouteHeader>(mapper);
        RegisterReadOnlyList<RouteQueryParameter>(mapper);
        RegisterReadOnlyList<IReadOnlyDictionary<string, string>>(mapper);

        // Register custom mapping for read-only dictionaries of YARP types
        RegisterReadOnlyDictionary<string>(mapper);
        RegisterReadOnlyDictionary<DestinationConfig>(mapper);
    }

    private static void RegisterReadOnlyList<T>(BsonMapper mapper)
    {
        mapper.RegisterType<IReadOnlyList<T>>(
            serialize: list =>
            {
                if (list == null) return BsonValue.Null;
                var array = new BsonArray();
                foreach (var item in list)
                {
                    array.Add(mapper.Serialize(typeof(T), item));
                }
                return array;
            },
            deserialize: bson =>
            {
                if (bson.IsArray)
                {
                    var list = new List<T>();
                    foreach (var item in bson.AsArray)
                    {
                        var val = mapper.Deserialize(typeof(T), item);
                        if (val is T typedVal)
                        {
                            list.Add(typedVal);
                        }
                    }
                    return list;
                }
                return new List<T>();
            }
        );
    }

    private static void RegisterReadOnlyDictionary<T>(BsonMapper mapper)
    {
        mapper.RegisterType<IReadOnlyDictionary<string, T>>(
            serialize: dict =>
            {
                if (dict == null) return BsonValue.Null;
                var doc = new BsonDocument();
                foreach (var kv in dict)
                {
                    doc[kv.Key] = mapper.Serialize(typeof(T), kv.Value);
                }
                return doc;
            },
            deserialize: bson =>
            {
                if (bson.IsDocument)
                {
                    var dict = new Dictionary<string, T>();
                    foreach (var kv in bson.AsDocument)
                    {
                        var val = mapper.Deserialize(typeof(T), kv.Value);
                        if (val is T typedVal)
                        {
                            dict[kv.Key] = typedVal;
                        }
                    }
                    return dict;
                }
                return new Dictionary<string, T>();
            }
        );
    }

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