using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanCheck.API.Models;
using CleanCheck.API.Data;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace CleanCheck.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AttendanceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetLogs()
        {
            return Ok(await _context.AttendanceLogs.ToListAsync());
        }

        [HttpPost]
        public async Task<IActionResult> RegisterScan([FromBody] AttendanceLog log)
        {
            // Si Angular nos manda un ID mayor a 0, significa que ES UN EGRESO
            if (log.Id > 0)
            {
                var existingLog = await _context.AttendanceLogs.FindAsync(log.Id);
                if (existingLog != null && existingLog.ExitTime == null)
                {
                    existingLog.ExitTime = log.ExitTime;
                    existingLog.ExitStatus = log.ExitStatus;
                    await _context.SaveChangesAsync();
                }
                return Ok(existingLog);
            }
            else
            {
                // Si el ID es 0, es porque es un INGRESO NUEVO
                _context.AttendanceLogs.Add(log);
                await _context.SaveChangesAsync();
                return Ok(log);
            }
        }
    }
}