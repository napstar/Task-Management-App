---
name: debug_production
description: Instructions and tools for debugging production issues by temporarily enabling detailed errors and manual administration.
---

# Production Debugging Tools

This skill provides instructions on how to temporarily reduce security controls to diagnose production issues like database connectivity, migration failures, or unhandled exceptions.

**WARNING: DO NOT LEAVE THESE CHANGES ENABLED PERMANENTLY.**
These changes expose sensitive error details and allow unauthenticated administrative actions. Always revert after debugging.

## 1. Enable Detailed Errors in Production

By default, the API hides exception details in production. To see them:

**Modify `SwmcolTaskTracker.API/Program.cs`:**
Change the global exception handler logic:

```csharp
// FROM:
detail = app.Environment.IsDevelopment() ? ex?.Message : null

// TO:
detail = ex?.ToString() // Temporary debug change: Always show error details
```

## 2. Deploy Admin Controller (Manual Migrations)

If database migrations fail silently on startup, deploy this temporary controller to run them manually and see the error.

**Create `SwmcolTaskTracker.API/Controllers/AdminController.cs`:**

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwmcolTaskTracker.Shared.Data;
using System;
using System.Threading.Tasks;

namespace SwmcolTaskTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // POST /api/admin/migrate
        // Runs pending migrations and reports success or critical failure details.
        [HttpPost("migrate")]
        public async Task<IActionResult> RunMigrations()
        {
            try
            {
                var pending = await _context.Database.GetPendingMigrationsAsync();
                await _context.Database.MigrateAsync();
                return Ok(new 
                { 
                    message = "Migrations applied successfully", 
                    appliedMigrations = pending 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new 
                { 
                    error = "Migration Failed", 
                    details = ex.ToString() 
                });
            }
        }

        // POST /api/admin/fix-history
        // Use ONLY if "InitialCreate" fails because table already exists.
        // It manually inserts the InitialCreate record into history table.
        [HttpPost("fix-history")]
        public async Task<IActionResult> FixMigrartionHistory()
        {
            try
            {
                // 1. Ensure History Table Exists
                var historyTableSql = @"
                    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='__EFMigrationsHistory' AND xtype='U')
                    CREATE TABLE [__EFMigrationsHistory] (
                        [MigrationId] nvarchar(150) NOT NULL,
                        [ProductVersion] nvarchar(32) NOT NULL,
                        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
                    );";
                await _context.Database.ExecuteSqlRawAsync(historyTableSql);

                // 2. Insert InitialCreate if missing
                var insertSql = @"
                    IF NOT EXISTS (SELECT * FROM __EFMigrationsHistory WHERE MigrationId = '20260204153033_InitialCreate')
                    INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES ('20260204153033_InitialCreate', '8.0.0');
                ";
                await _context.Database.ExecuteSqlRawAsync(insertSql);
                
                return Ok("History table fixed. Now try /api/admin/migrate again.");
            }
            catch (Exception ex)
            {
                 return StatusCode(500, new { error = "Fix Failed", details = ex.ToString() });
            }
        }
    }
}
```

## 3. Enable IIS Error Passthrough

To prevent Azure/IIS from intercepting 500 errors (which strips CORS headers and custom JSON bodies), ensure `web.config` has `httpErrors` set to `PassThrough`.

**Modify `SwmcolTaskTracker.API/web.config`:**

```xml
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <httpErrors existingResponse="PassThrough" />
      <handlers>
        ...
      </handlers>
      ...
    </system.webServer>
  </location>
</configuration>
```

This file must ideally be in the root of the project so it gets copied during publish.

## 4. Usage Workflow

1. Apply changes (enable details, add controller).
2. Publish and Deploy API.
3. Restart App Service.
4. Execute tests or manual endpoints (e.g. `Invoke-WebRequest -Method Post ...`).
5. **Revert changes immediately after debugging.**
