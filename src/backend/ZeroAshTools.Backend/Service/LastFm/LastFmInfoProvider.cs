using IF.Lastfm.Core.Api;
using Microsoft.Extensions.Options;
using ZeroAshTools.Backend.Data;

namespace ZeroAshTools.Backend.Service.LastFm;

public class LastFmInfoProvider(LastfmClient client)
{
    public async ValueTask<List<RateItem>> SearchSongs(string term, int page,
        CancellationToken cancellationToken = default)
    {
        var result = await client.Track.SearchAsync(term, page).WaitAsync(cancellationToken);
        var items = result.Content.Select(track
            => new RateItem(
                track.Name, 
                $"{track.ArtistName}", 
                track.Images.Medium?.AbsoluteUri ?? "",
                track.Url.AbsoluteUri, 
                "lastfm-track")).ToList();

        return items;
    }

    public async ValueTask<List<RateItem>> SearchArtist(string term, int page,
        CancellationToken cancellationToken = default)
    {
        var result = await client.Artist.SearchAsync(term, page).WaitAsync(cancellationToken);

        return result.Content.Select(artist =>
            new RateItem(
                artist.Name,
                "",
                artist.MainImage.Medium?.AbsoluteUri ?? "",
                artist.Url.AbsoluteUri,
                "lastfm-artist")).ToList();
    }
}