using global::Yarp.ReverseProxy.Configuration;

namespace Lgd.Yarp.Studio.Extensions;

public class YarpConfigPayload
{
    public List<RouteConfig> Routes { get; set; } = new();
    public List<ClusterConfig> Clusters { get; set; } = new();
}
