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
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            return await _context.Projects.ToListAsync();
        }

        // GET: api/Projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            return project;
        }

        // POST: api/Projects
        [HttpPost]
        public async Task<ActionResult<Project>> PostProject(Project project)
        {
            try
            {
                _context.Projects.Add(project);
                await _context.SaveChangesAsync();
                return CreatedAtAction("GetProject", new { id = project.ProjectId }, project);
            }
            catch (DbUpdateException ex)
            {
                // Log the full exception with inner exception
                var innerException = ex.InnerException?.Message ?? "No inner exception";
                var fullError = $"DbUpdateException: {ex.Message}\nInner: {innerException}";

                // Log to console/output window (visible in Debug mode)
                Console.WriteLine(fullError);
                System.Diagnostics.Debug.WriteLine(fullError);

                // Return detailed error to client (ONLY FOR DEVELOPMENT)
                return StatusCode(500, new
                {
                    error = ex.Message,
                    innerError = innerException,
                    stackTrace = ex.StackTrace
                });
            }
            catch (Exception ex)
            {
                // Catch any other exceptions
                var innerException = ex.InnerException?.Message ?? "No inner exception";

                Console.WriteLine($"General Exception: {ex.Message}\nInner: {innerException}");

                return StatusCode(500, new
                {
                    error = ex.Message,
                    innerError = innerException
                });
            }
        }
        // PUT: api/Projects/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProject(int id, Project project)
        {
            if (id != project.ProjectId)
            {
                return BadRequest();
            }

            _context.Entry(project).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProjectExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Projects/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProjectExists(int id)
        {
            return _context.Projects.Any(e => e.ProjectId == id);
        }
    }
}
