using Mikibot.Crawler.Http.Bilibili;
using ZeroAshTools.Backend.Data;

namespace ZeroAshTools.Backend.Service.Bilibili;

public class BilibiliVideoInfoProvider(
    BiliVideoCrawler crawler,
    HttpClient httpClient)
    : KeyValueFileCache<VideoParseResult>("data/cache.json")
{
    protected override async ValueTask<VideoParseResult> LoadValueAsync(string key, CancellationToken cancellationToken = default)
    {
        var info = await crawler.GetVideoInfo(key, null, cancellationToken);
        var data = await httpClient.GetByteArrayAsync($"{info.CoverUrl}@300w_168h_1c.jpg", cancellationToken);
        var dataUri = $"data:image/jpeg;base64,{Convert.ToBase64String(data)}";
        return new VideoParseResult(
            info.Title,
            info.Owner.Name,
            dataUri,
            $"https://www.bilibili.com/video/{key}");
    }
}
