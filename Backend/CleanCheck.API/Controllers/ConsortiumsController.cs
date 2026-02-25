using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanCheck.API.Models;
using CleanCheck.API.Data; // Verifica tu namespace
using System.Threading.Tasks;

namespace CleanCheck.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConsortiumsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ConsortiumsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetConsortiums()
        {
            // Trae los edificios junto con sus horarios semanales
            var consortiums = await _context.Consortiums
                                            .Include(c => c.Schedules)
                                            .ToListAsync();
            return Ok(consortiums);
        }

        [HttpPost]
        public async Task<IActionResult> CreateConsortium([FromBody] Consortium consortium)
        {
            _context.Consortiums.Add(consortium);
            await _context.SaveChangesAsync();
            return Ok(consortium);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateConsortium(int id, [FromBody] Consortium consortium)
        {
            if (id != consortium.Id) return BadRequest();
            _context.Entry(consortium).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(consortium);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConsortium(int id)
        {
            var consortium = await _context.Consortiums.FindAsync(id);
            if (consortium == null) return NotFound();
            _context.Consortiums.Remove(consortium);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}