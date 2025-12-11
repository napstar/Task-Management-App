using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SwmcolTaskTracker.API.Data;
using SwmcolTaskTracker.API.Models;

namespace SwmcolTaskTracker.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Tasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetTasks()
        {
            return await _context.Tasks
                
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
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
            _context.Tasks.Add(taskItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTaskItem", new { id = taskItem.TaskId }, taskItem);
        }

        // PUT: api/Tasks/5
        // PUT: api/Tasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTaskItem(int id, TaskItem taskItem)
        {
            if (id != taskItem.TaskId)
                return BadRequest("Task ID mismatch.");

            var existingTask = await _context.Tasks.FindAsync(id);
            if (existingTask == null)
                return NotFound();

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

            // If you have more fields that should never update:
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
