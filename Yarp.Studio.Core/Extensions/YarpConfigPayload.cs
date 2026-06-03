using Yarp.ReverseProxy.Configuration;

namespace Yarp.Studio.Core.Extensions;

public class YarpConfigPayload
{
    public List<RouteConfig> Routes { get; set; } = new();
    public List<ClusterConfig> Clusters { get; set; } = new();
}
