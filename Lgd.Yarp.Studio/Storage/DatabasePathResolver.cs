namespace Lgd.Yarp.Studio.Storage;

public static class DatabasePathResolver
{
    public static string GetConnectionString()
    {
        return "Filename=yarp-studio.db;Connection=Shared";
    }
}
