using LiteDB;
using global::Yarp.ReverseProxy.Configuration;

namespace Lgd.Yarp.Studio.Storage;

public class YarpConfigWrapper
{
    // LiteDB looks for an 'Id' property to use as the primary key document record
    public int Id { get; set; } = 1; 
    public List<RouteConfig> Routes { get; set; } = new();
    public List<ClusterConfig> Clusters { get; set; } = new();
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}