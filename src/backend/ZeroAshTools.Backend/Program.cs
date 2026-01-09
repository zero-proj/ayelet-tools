using Mikibot.Crawler.Http.Bilibili;
using ZeroAshTools.Backend.Data;
using ZeroAshTools.Backend.Service;
using ZeroAshTools.Backend.Service.Bilibili;

if (!Directory.Exists("data"))
{
    Directory.CreateDirectory("data");
}

var builder = WebApplication.CreateSlimBuilder(args);
builder.Services.AddSingleton<HttpClient>();
builder.Services.AddSingleton<BiliVideoCrawler>();
builder.Services.AddCache<BilibiliVideoInfoProvider>();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

builder.Services.AddCors(cors =>
{
    cors.AddPolicy("trust-sites", (policy) => policy
        .WithOrigins("https://tools.ayelet.cn", "https://tools.zeroash.cn", "http://localhost:5173"));
});
builder.Services.AddResponseCaching();
builder.Services.AddResponseCompression();

var app = builder.Build();
await app.InitializeCache(app.Lifetime.ApplicationStopping);;
app.UseResponseCaching();
app.UseResponseCompression();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseCors("trust-sites");
var videoInfoProvider = app.Services.GetRequiredService<BilibiliVideoInfoProvider>();
var bilibiliApi = app.MapGroup("/api/v1/bilibili");

bilibiliApi.MapGet("/cover/{bv}", async (string bv, CancellationToken cancellationToken) =>
{
    try
    {
        return Results.Ok(await videoInfoProvider.GetAsync(bv, cancellationToken));
    }
    catch (Exception e)
    {
        Console.WriteLine(e);
        return Results.NotFound();
    }
}).RequireCors("trust-sites");

app.Run();
