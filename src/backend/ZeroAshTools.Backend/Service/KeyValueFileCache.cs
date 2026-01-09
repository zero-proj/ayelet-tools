using System.Collections.Concurrent;
using System.Text.Json;

namespace ZeroAshTools.Backend.Service;

public interface IKeyValueFileCache
{
    ValueTask InitializeAsync(CancellationToken cancellationToken = default);
}

public abstract class KeyValueFileCache<TValue>(string filePath, TimeSpan flushInterval): IKeyValueFileCache
{
    protected KeyValueFileCache(string filePath) : this(filePath, TimeSpan.FromSeconds(5)) {}
    
    private readonly string _tempFilePath = filePath + ".1";
    private readonly string _backFilePath = filePath + ".bak";
    
    private readonly Dictionary<string, SemaphoreSlim> _locks = [];
    private readonly SemaphoreSlim _lock = new(1);
    private ConcurrentDictionary<string, TValue> _cache = new();
    private bool _notInitialized = true;
    private readonly TaskCompletionSource _initLock = new();
    private readonly SemaphoreSlim _flushLock = new(0, 1);

    private async ValueTask<ConcurrentDictionary<string, TValue>> ReadCacheAsync()
    {
        if (!File.Exists(filePath))
        {
            return [];
        }
        await using var file = File.OpenRead(filePath);
        return await JsonSerializer.DeserializeAsync<ConcurrentDictionary<string, TValue>>(file) ?? [];
    }
    
    public async ValueTask InitializeAsync(CancellationToken cancellationToken = default)
    {
        if (!_notInitialized) return;

        _cache = await ReadCacheAsync();
        _ = Task.Run(() => IntervalFlushCacheAsync(cancellationToken), cancellationToken);
        _initLock.SetResult();
        _notInitialized = false;
    }
    
    protected abstract ValueTask<TValue> LoadValueAsync(string key, CancellationToken cancellationToken = default);

    public async ValueTask<TValue> GetAsync(string key, CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue(key, out var cacheItem)) return cacheItem;

        return await BeginCacheScopeAsync(key, async () =>
        {
            if (_cache.TryGetValue(key, out var serializedCacheItem)) return serializedCacheItem;
            var result = await LoadValueAsync(key, cancellationToken);
            _cache.TryAdd(key, result);
            _flushLock.Release();
            return result;
        }, cancellationToken);
    }

    private async Task IntervalFlushCacheAsync(CancellationToken cancellationToken)
    {
        if (_notInitialized) await _initLock.Task;
        while (!cancellationToken.IsCancellationRequested)
        {
            await _flushLock.WaitAsync(cancellationToken);
            await Task.Delay(flushInterval, cancellationToken);
            try
            {
                var data = JsonSerializer.SerializeToUtf8Bytes(_cache);
                if (data is not { Length: > 0}) continue;

                await File.WriteAllBytesAsync(_tempFilePath, data, cancellationToken);
                if (!File.Exists(filePath))
                {
                    File.Copy(_tempFilePath, filePath);
                    File.Delete(_tempFilePath);
                }
                else File.Replace(_tempFilePath, filePath, _backFilePath);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }
    }


    private async ValueTask<T> BeginCacheScopeAsync<T>(string key, Func<ValueTask<T>> scope,
        CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            if (!_locks.TryGetValue(key, out var bvLock))
                _locks.Add(key, new SemaphoreSlim(1));
        }
        finally
        {
            _lock.Release();
        }

        await _locks[key].WaitAsync(cancellationToken);
        try
        {
            return await scope();
        }
        finally
        {
            _locks[key].Release();
        }
    }

}


public static class KeyValueFileCacheExtensions
{
    extension<T>(IServiceCollection services) where T : class, IKeyValueFileCache
    {
        public IServiceCollection AddCache()
        {
            services.AddSingleton<T>();
            services.AddSingleton<IKeyValueFileCache, T>((sp) => sp.GetRequiredService<T>());
            return services;
        }
    }

    extension(IApplicationBuilder app)
    {
        public async ValueTask InitializeCache(CancellationToken cancellationToken)
        {
            foreach (var cache in app.ApplicationServices.GetServices<IKeyValueFileCache>())
            {
                await cache.InitializeAsync(cancellationToken); 
            }
        }
    }
}
