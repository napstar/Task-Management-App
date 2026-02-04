using System.Text;
using Azure.Storage.Blobs;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SwmcolTaskTracker.Shared.Data;
using SwmcolTaskTracker.Shared.Models;

public class WeeklyReportGenerator
{
    private readonly AppDbContext _context; // Corrected Class
    private readonly ILogger<WeeklyReportGenerator> _logger;
    
    // Connection string from local.settings.json or Azure Portal
    private const string BlobConnectionString = "UseDevelopmentStorage=true"; 
    private const string ContainerName = "weekly-reports";

    public WeeklyReportGenerator(AppDbContext context, ILogger<WeeklyReportGenerator> logger) // Corrected Class
    {
        _context = context;
        _logger = logger;
    }

    [Function("WeeklyReportGenerator_old")]
    public async Task Run_old([TimerTrigger("0 0 16 * * 1-5")] TimerInfo myTimer, FunctionContext context)
    {
        _logger.LogInformation($"Generating Weekly Report: {DateTime.Now}");

        // 1. DATA RETRIEVAL (Real DB)
        // ------------------------------------------
        DateTime startOfWeek = DateTime.UtcNow.AddDays(-(int)DateTime.UtcNow.DayOfWeek + (int)DayOfWeek.Monday);
        DateTime endOfWeek = startOfWeek.AddDays(4);

        // Note: Check if TaskItems property exists in AppDbContext, usually called "Tasks"
        var tasks = await _context.Tasks  // Changed from TaskItems to Tasks based on view_file output
                                  .Where(t => t.Status == "InProgress" || 
                                             (t.Status == "Completed" && t.CompletedDate >= startOfWeek))
                                  .ToListAsync();

        var inProgress = tasks.Where(t => t.Status == "InProgress").ToList();
        var completed = tasks.Where(t => t.Status == "Completed").ToList();

        // 2. TEMPLATE LOADING (From App Directory)
        // ------------------------------------------
        // Ensure "WeeklyReportTemplate.docx" is set to "Copy to Output Directory: Always" in .csproj
        string templatePath = Path.Combine(AppContext.BaseDirectory, "templates", "WeeklyReportTemplate.docx");
        
        byte[] byteArray = File.ReadAllBytes(templatePath);

        // 3. OPEN XML MANIPULATION (In Memory)
        // ------------------------------------------
        using (MemoryStream stream = new MemoryStream())
        {
            stream.Write(byteArray, 0, byteArray.Length); // Load template into stream

            using (WordprocessingDocument doc = WordprocessingDocument.Open(stream, true))
            {
                var body = doc.MainDocumentPart.Document.Body;
                var tables = body.Elements<Table>().ToList();

                // Safety Check
                if (tables.Count < 3) 
                {
                    _logger.LogError("Template does not have enough tables!");
                    return;
                }

                Table inProgressTable = tables[0];
                Table completedTable = tables[1];
                Table commentsTable = tables[2];

                // Clear Placeholders
                TableHelper.ClearDataRows(inProgressTable);
                TableHelper.ClearDataRows(completedTable);
                TableHelper.ClearDataRows(commentsTable);

                // Populate In Progress
                foreach (var task in inProgress)
                {
                    string rowText = $"{task.Title} (Due: {task.DueDate:dd-MMM})"; // Fixed 'Deadline' to 'DueDate'
                    TableHelper.AddRowToTable(inProgressTable, rowText);
                }

                // Populate Completed (FIXED INDEX BUG)
                int index = 1; 
                foreach (var task in completed)
                {
                    string rowText = $"{index}. {task.Title} (Done: {task.CompletedDate:dd-MMM})";
                    TableHelper.AddRowToTable(completedTable, rowText);
                    index++; // <--- Added increment
                }
                
                // Save changes to the MemoryStream
                doc.MainDocumentPart.Document.Save();
            }

            // 4. SAVE TO AZURE BLOB STORAGE
            // ------------------------------------------
            stream.Position = 0; // Reset stream pointer to beginning
            
            string fileName = $"{DateTime.UtcNow:yyyyMMdd}_TaskReport_NOkunna.docx";
            
            var blobServiceClient = new BlobServiceClient(Environment.GetEnvironmentVariable("AzureWebJobsStorage"));
            var containerClient = blobServiceClient.GetBlobContainerClient(ContainerName);
            await containerClient.CreateIfNotExistsAsync();
            
            var blobClient = containerClient.GetBlobClient(fileName);
            await blobClient.UploadAsync(stream, overwrite: true);

            _logger.LogInformation($"Report uploaded to Blob Storage: {fileName}");
        }
    }

     [Function("WeeklyReportGenerator")]
    public async Task Run([TimerTrigger("0 */5 * * * *")] TimerInfo myTimer, FunctionContext context)
    {
        //runs a every 5 minutes
        _logger.LogInformation($"Generating Weekly Report: {DateTime.Now}");

        // 1. DATA RETRIEVAL (Real DB)z
        // ------------------------------------------
        DateTime startOfWeek = DateTime.UtcNow.AddDays(-(int)DateTime.UtcNow.DayOfWeek + (int)DayOfWeek.Monday);
        DateTime endOfWeek = startOfWeek.AddDays(4);

        // Note: Check if TaskItems property exists in AppDbContext, usually called "Tasks"
        var tasks = await _context.Tasks  // Changed from TaskItems to Tasks based on view_file output
                                  .Where(t => t.Status == "InProgress" || 
                                             (t.Status == "Completed" && t.CompletedDate >= startOfWeek))
                                  .ToListAsync();

        var inProgress = tasks.Where(t => t.Status == "InProgress").ToList();
        var completed = tasks.Where(t => t.Status == "Completed").ToList();

        // 2. TEMPLATE LOADING (From App Directory)
        // ------------------------------------------
        // Ensure "WeeklyReportTemplate.docx" is set to "Copy to Output Directory: Always" in .csproj
        string templatePath = Path.Combine(AppContext.BaseDirectory, "templates", "WeeklyReportTemplate.docx");
        
        byte[] byteArray = File.ReadAllBytes(templatePath);

        // 3. OPEN XML MANIPULATION (In Memory)
        // ------------------------------------------
        using (MemoryStream stream = new MemoryStream())
        {
            stream.Write(byteArray, 0, byteArray.Length); // Load template into stream

            using (WordprocessingDocument doc = WordprocessingDocument.Open(stream, true))
            {
                var body = doc.MainDocumentPart.Document.Body;
                var tables = body.Elements<Table>().ToList();

                // Safety Check
                if (tables.Count < 3) 
                {
                    _logger.LogError("Template does not have enough tables!");
                    return;
                }

                Table inProgressTable = tables[0];
                Table completedTable = tables[1];
                Table commentsTable = tables[2];

                // Clear Placeholders
                TableHelper.ClearDataRows(inProgressTable);
                TableHelper.ClearDataRows(completedTable);
                TableHelper.ClearDataRows(commentsTable);

                // Populate In Progress
                foreach (var task in inProgress)
                {
                    string rowText = $"{task.Title} (Due: {task.DueDate:dd-MMM})"; // Fixed 'Deadline' to 'DueDate'
                    TableHelper.AddRowToTable(inProgressTable, rowText);
                }

                // Populate Completed (FIXED INDEX BUG)
                int index = 1; 
                foreach (var task in completed)
                {
                    string rowText = $"{index}. {task.Title} (Done: {task.CompletedDate:dd-MMM})";
                    TableHelper.AddRowToTable(completedTable, rowText);
                    index++; // <--- Added increment
                }
                
                // Save changes to the MemoryStream
                doc.MainDocumentPart.Document.Save();
            }

            // 4. SAVE TO AZURE BLOB STORAGE
            // ------------------------------------------
            stream.Position = 0; // Reset stream pointer to beginning
            
            string fileName = $"{DateTime.UtcNow:yyyyMMdd}_TaskReport_NOkunna.docx";
            
            var blobServiceClient = new BlobServiceClient(Environment.GetEnvironmentVariable("AzureWebJobsStorage"));
            var containerClient = blobServiceClient.GetBlobContainerClient(ContainerName);
            await containerClient.CreateIfNotExistsAsync();
            
            var blobClient = containerClient.GetBlobClient(fileName);
            await blobClient.UploadAsync(stream, overwrite: true);

            _logger.LogInformation($"Report uploaded to Blob Storage: {fileName}");
        }
    }
}