using Mikibot.Crawler.Http.Bilibili;

namespace ZeroAshTools.Backend.Service.Bilibili;

public static class BilibiliProviderExtensions
{
    extension(IServiceCollection registry)
    {
        public IServiceCollection AddBilibiliProvider()
        {
            registry.AddSingleton<HttpClient>();
            registry.AddSingleton<BiliVideoCrawler>();
            registry.AddCache<BilibiliVideoInfoProvider>();
            return registry;
        }
    }
}