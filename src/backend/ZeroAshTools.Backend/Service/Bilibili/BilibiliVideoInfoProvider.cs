using Mikibot.Crawler.Http.Bilibili;
using ZeroAshTools.Backend.Data;

namespace ZeroAshTools.Backend.Service.Bilibili;

public class BilibiliVideoInfoProvider(
    BiliVideoCrawler crawler,
    HttpClient httpClient)
    : KeyValueFileCache<RateItem>("data/cache.json")
{
    protected override async ValueTask<RateItem> LoadValueAsync(string key, CancellationToken cancellationToken = default)
    {
        var info = await crawler.GetVideoInfo(key, null, cancellationToken);
        var data = await httpClient.GetByteArrayAsync($"{info.CoverUrl}@300w_168h_1c.jpg", cancellationToken);
        var dataUri = $"data:image/jpeg;base64,{Convert.ToBase64String(data)}";
        return new RateItem(
            key,
            info.Title,
            info.Owner.Name,
            dataUri,
            $"https://www.bilibili.com/video/{key}",
            "bilibili-video");
    }
}
