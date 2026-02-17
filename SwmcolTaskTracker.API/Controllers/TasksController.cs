using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using SwmcolTaskTracker.Shared.Data;
using SwmcolTaskTracker.Shared.Models;

namespace SwmcolTaskTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TasksController> _logger; // Added logger field

        public TasksController(AppDbContext context, ILogger<TasksController> logger) // Modified constructor
        {
            _context = context;
            _logger = logger; // Assigned logger
        }

        // GET: api/Tasks
        [HttpGet]
        [AllowAnonymous] // Add this for testing
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            try
            {
                var tasks = await _context.Tasks
                    .AsNoTracking()
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tasks");
                return StatusCode(500, new { message = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        // GET: api/Tasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetTaskItem(int id)
        {
            var taskItem = await _context.Tasks
                .Include(t => t.Comments)
                .Include(t => t.Dependencies)
                .FirstOrDefaultAsync(t => t.TaskId == id);

            if (taskItem == null)
            {
                return NotFound();
            }

            return taskItem;
        }

        // POST: api/Tasks
        [HttpPost]
        public async Task<ActionResult<TaskItem>> PostTaskItem(TaskItem taskItem)
        {
            // Auto-populate ProjectName if ProjectId is provided
            if (taskItem.ProjectId.HasValue)
            {
                var project = await _context.Projects.FindAsync(taskItem.ProjectId.Value);
                if (project != null)
                {
                    taskItem.ProjectName = project.ProjectName;
                }
            }

            _context.Tasks.Add(taskItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTaskItem", new { id = taskItem.TaskId }, taskItem);
        }

        // PUT: api/Tasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTaskItem(int id, TaskItem taskItem)
        {
            if (id != taskItem.TaskId)
                return BadRequest("Task ID mismatch.");

            var existingTask = await _context.Tasks.FindAsync(id);
            if (existingTask == null)
                return NotFound();
            
            // Auto-populate ProjectName if ProjectId is provided
            // This ensures the denormalized ProjectName column stays in sync
            if (taskItem.ProjectId.HasValue)
            {
                // Only query if it changed or if Name is missing
                // Ideally, just always refresh it to be safe
                var project = await _context.Projects.FindAsync(taskItem.ProjectId.Value);
                if (project != null)
                {
                    taskItem.ProjectName = project.ProjectName;
                }
            }
            else
            {
                taskItem.ProjectName = null;
            }

            // ------------------------------------------------------------
            // AUTO-MAP ONLY CHANGED PROPERTIES USING EF CORE + REFLECTION
            // ------------------------------------------------------------
            var entry = _context.Entry(existingTask);
            entry.CurrentValues.SetValues(taskItem);

            // -----------------------------------------
            // EXCLUDE IMMUTABLE FIELDS FROM MODIFICATION
            // -----------------------------------------
            entry.Property(e => e.CreatedAt).IsModified = false;
            entry.Property(e => e.CreatedBy_AD_OID).IsModified = false;

            // Placeholder - reading file firstelds that should never update:
            // entry.Property(e => e.OtherField).IsModified = false;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskItemExists(id))
                    return NotFound();

                throw;
            }

            return NoContent();
        }


        // DELETE: api/Tasks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTaskItem(int id)
        {
            var taskItem = await _context.Tasks.FindAsync(id);
            if (taskItem == null)
            {
                return NotFound();
            }

            _context.Tasks.Remove(taskItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TaskItemExists(int id)
        {
            return _context.Tasks.Any(e => e.TaskId == id);
        }
    }
}
