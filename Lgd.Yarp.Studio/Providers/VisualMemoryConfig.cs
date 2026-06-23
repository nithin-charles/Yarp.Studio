using Microsoft.Extensions.Primitives;
using global::Yarp.ReverseProxy.Configuration;

namespace Lgd.Yarp.Studio.Providers;

public class VisualMemoryConfig : IProxyConfig
{
    private readonly CancellationTokenSource _cts = new();

    public VisualMemoryConfig(IReadOnlyList<RouteConfig> routes, IReadOnlyList<ClusterConfig> clusters)
    {
        Routes = routes;
        Clusters = clusters;
        ChangeToken = new CancellationChangeToken(_cts.Token);
    }

    public IReadOnlyList<RouteConfig> Routes { get; }
    public IReadOnlyList<ClusterConfig> Clusters { get; }
    public IChangeToken ChangeToken { get; }

    public void SignalChange()
    {
        _cts.Cancel();
    }
}
