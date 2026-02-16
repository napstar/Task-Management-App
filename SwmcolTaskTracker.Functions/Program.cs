using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using SwmcolTaskTracker.Shared.Data;
using Azure.Identity;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((hostContext, services) =>
    {
        // Configure DB Context with Key Vault support in production
        var connectionString = hostContext.Configuration["TaskMgmtDB-Conn-String"];
        
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(connectionString));
    })
    .Build();

host.Run();

