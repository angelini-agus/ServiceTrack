using CleanCheck.API.Data;
using CleanCheck.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CleanCheck.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ServiceTasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public ServiceTasksController(AppDbContext context)
    {
        _context = context;
    }

    // 1. OBTENER TODAS LAS TAREAS (GET: api/ServiceTasks)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceTask>>> GetServiceTasks()
    {
        return await _context.ServiceTasks.ToListAsync();
    }

    // 2. CREAR UNA TAREA (POST: api/ServiceTasks)
    [HttpPost]
    public async Task<ActionResult<ServiceTask>> PostServiceTask(ServiceTask serviceTask)
    {
        serviceTask.CreatedAt = DateTime.Now; // Ponemos la fecha automática
        _context.ServiceTasks.Add(serviceTask);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetServiceTasks", new { id = serviceTask.Id }, serviceTask);
    }

    // 3. MARCAR COMO COMPLETADA (PUT: api/ServiceTasks/5)
    [HttpPut("{id}")]
    public async Task<IActionResult> PutServiceTask(int id, ServiceTask serviceTask)
    {
        if (id != serviceTask.Id)
        {
            return BadRequest();
        }

        _context.Entry(serviceTask).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.ServiceTasks.Any(e => e.Id == id))
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
}