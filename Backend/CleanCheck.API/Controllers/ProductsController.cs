using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CleanCheck.API.Models; // Asegurate de que coincida con tu namespace
using CleanCheck.API.Data;   // O donde tengas tu AppDbContext
using System.Threading.Tasks;

namespace CleanCheck.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Products
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            return Ok(await _context.Products.ToListAsync());
        }

        // POST: api/Products
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Producto eliminado" });
        }
    }
}