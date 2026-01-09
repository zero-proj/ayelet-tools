using System.Text.Json.Serialization;

namespace ZeroAshTools.Backend.Data;

public record VideoParseResult(string Title, string Author, string Image, string Url);

[JsonSerializable(typeof(VideoParseResult[]))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}
