using CleanCheck.API.Data;
using CleanCheck.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CleanCheck.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    // REGISTRO: Para crear usuarios (Admin o Empleados)
    [HttpPost("register")]
    public async Task<IActionResult> Register(User user)
    {
        // 1. Validar que el email no exista
        if (await _context.Users.AnyAsync(u => u.Email == user.Email))
        {
            return BadRequest("El usuario ya existe.");
        }

        // 2. Guardar el usuario (En producción aquí encriptaríamos la contraseña)
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Usuario creado con éxito", userId = user.Id });
    }

    // LOGIN: Para entrar al sistema
    [HttpPost("login")]
    public async Task<IActionResult> Login(User loginRequest)
    {
        // 1. Buscar usuario por email y contraseña
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == loginRequest.Email && u.PasswordHash == loginRequest.PasswordHash);

        if (user == null)
        {
            return Unauthorized("Email o contraseña incorrectos.");
        }

        // 2. Login exitoso
        return Ok(new
        {
            message = "Login exitoso",
            user = user.FullName,
            role = user.Role
        });
    }
}