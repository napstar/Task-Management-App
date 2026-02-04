using Microsoft.EntityFrameworkCore;
using SwmcolTaskTracker.Shared.Data;
using Azure.Identity;

var builder = WebApplication.CreateBuilder(args);

// Configure Azure Key Vault
var keyVaultName = "Operations1Vault";
var keyVaultUri = new Uri($"https://{keyVaultName}.vault.azure.net/");
builder.Configuration.AddAzureKeyVault(keyVaultUri, new DefaultAzureCredential());

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DB Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration["TaskMgmtDB-Conn-String"],
    b => b.MigrationsAssembly("SwmcolTaskTracker.API")));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient",
        b => b.WithOrigins("http://localhost:4200", "http://localhost:51624")
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowClient");

app.UseAuthorization();

app.MapControllers();

app.Run();
