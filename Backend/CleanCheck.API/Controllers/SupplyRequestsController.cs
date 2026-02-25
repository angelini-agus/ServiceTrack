using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanCheck.API.Models;
using CleanCheck.API.Data;
using System;
using System.Threading.Tasks;

namespace CleanCheck.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplyRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SupplyRequestsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/SupplyRequests
        [HttpGet]
        public async Task<IActionResult> GetRequests()
        {
            // El .Include(r => r.Product) es magia pura: 
            // trae los datos del pedido y ADEMÁS el nombre del producto para mostrar en Angular
            var requests = await _context.SupplyRequests
                                         .Include(r => r.Product)
                                         .ToListAsync();
            return Ok(requests);
        }

        // POST: api/SupplyRequests
        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] SupplyRequest request)
        {
            // Lógica automática de negocio:
            request.Status = "Pendiente";
            request.RequestMonth = DateTime.Now.AddMonths(1); // Pedido para el próximo mes

            _context.SupplyRequests.Add(request);
            await _context.SaveChangesAsync();

            // Devolvemos el objeto creado para que Angular lo actualice en pantalla
            return Ok(request);
        }

        // PUT: api/SupplyRequests/5/entregado (Para que el admin cambie el estado)
        [HttpPut("{id}/entregado")]
        public async Task<IActionResult> MarkAsDelivered(int id)
        {
            var request = await _context.SupplyRequests.FindAsync(id);
            if (request == null) return NotFound();

            request.Status = "Entregado";
            await _context.SaveChangesAsync();

            return Ok(request);
        }
    }
}