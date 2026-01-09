using System.Text.Json.Serialization;

namespace ZeroAshTools.Backend.Data;

public record RateItem(string Title, string Author, string Image, string Url, string Type);

[JsonSerializable(typeof(RateItem[]))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}
