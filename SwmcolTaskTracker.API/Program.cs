using Azure.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;
using SwmcolTaskTracker.Shared.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. SELECTIVE KEY VAULT
if (!builder.Environment.IsDevelopment())
{
    var keyVaultName = builder.Configuration["KeyVaultName"] ?? "Operations1Vault";
    var keyVaultUri = new Uri($"https://{keyVaultName}.vault.azure.net/");
    builder.Configuration.AddAzureKeyVault(keyVaultUri, new DefaultAzureCredential());
}

// 2. AUTHENTICATION (configured conditionally below, after CORS)

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 3. SWAGGER (single registration with Bearer auth)
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Task Management API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Enter your token below."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// 4. CONNECTION STRING LOGIC
// Prioritize Key Vault secret in production, fallback to local config in dev
var connectionString = builder.Configuration["TaskMgmtDB-Conn-String"] 
                       ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString,
    b => b.MigrationsAssembly("SwmcolTaskTracker.API")));

// 5. CORS - Build origins list properly (WithOrigins called once)
var allowedOrigins = new List<string>
{
    "http://localhost:4200",
    "http://localhost:51624",
    "https://red-sky-00bb6ae0f.1.azurestaticapps.net"
};

//if (!builder.Environment.IsDevelopment())
//{
//    allowedOrigins.Add("https://red-sky-00bb6ae0f1.azurestaticapps.net");
//}
    // 2. AUTHENTICATION
    // Always use Azure AD Authentication (no dev bypass)
    // Removed downstream API calls to avoid needing ClientSecret in dev environment
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", b =>
    {
        b.WithOrigins(allowedOrigins.ToArray())
         .AllowAnyMethod()
         .AllowAnyHeader()
         .AllowCredentials();
    });
});

var app = builder.Build();

// 6. PIPELINE
// Swagger available in all environments
app.UseSwagger();
app.UseSwaggerUI();

// Run Migrations in ALL environments to ensure DB schema is up to date
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        context.Database.Migrate();
        Console.WriteLine("Database migration completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration Error: {ex.Message}");
    }
}

app.UseCors("AllowClient");

// Global exception handler — catches unhandled exceptions AFTER CORS middleware
// has already added headers, preventing IIS from stripping Access-Control-Allow-Origin
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        var ex = error?.Error;
        
        var logger = context.RequestServices.GetService<ILoggerFactory>()?.CreateLogger("GlobalExceptionHandler");
        logger?.LogError(ex, "Unhandled exception on {Path}", context.Request.Path);
        
        await context.Response.WriteAsJsonAsync(new
        {
            message = "An internal server error occurred.",
            detail = app.Environment.IsDevelopment() ? ex?.Message : null
        });
    });
});

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers().RequireCors("AllowClient");

app.Run();