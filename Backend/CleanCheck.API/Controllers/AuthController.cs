using CleanCheck.API.Data;
using CleanCheck.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

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

    // --- REGISTRO INTELIGENTE ---
    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(UserDto request)
    {
        // 1. VALIDACIÓN: Que no vengan vacíos
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Email))
        {
            return BadRequest("El usuario y el email son obligatorios.");
        }

        // 2. CHECK DOBLE: Que no exista ni el Usuario ni el Email
        if (await _context.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email))
        {
            return BadRequest("El usuario o el email ya están registrados.");
        }

        // 3. GUARDAR (CORREGIDO): Guardamos cada cosa en su lugar
        var user = new User
        {
            Username = request.Username, // Aquí va "Pepe1"
            Email = request.Email,       // Aquí va "pepe@limpieza.com" (¡Ahora sí!)
            Role = request.Role,
            FullName = request.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(user);
    }

    // --- LOGIN INTELIGENTE ---
    [HttpPost("login")]
    public async Task<ActionResult<object>> Login(UserDto request)
    {
        // 1. DETECTOR DE INPUT:
        // A veces el frontend manda el dato en 'Username' y a veces en 'Email'.
        // Aquí tomamos el que no esté vacío.
        string loginInput = !string.IsNullOrEmpty(request.Username) ? request.Username : request.Email;

        if (string.IsNullOrEmpty(loginInput))
        {
            return BadRequest("Debes ingresar un usuario o email.");
        }

        // 2. BÚSQUEDA DOBLE (La magia ocurre aquí ✨):
        // Buscamos un usuario donde el input coincida con su Username O con su Email
        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.Username == loginInput || u.Email == loginInput);

        if (user == null)
        {
            return BadRequest("Usuario no encontrado.");
        }

        // 3. Verificar Contraseña
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return BadRequest("Contraseña incorrecta.");
        }

        // 4. Login Exitoso
        return Ok(new
        {
            message = "Login exitoso",
            id = user.Id,
            user = user.FullName,
            role = user.Role
        });
    }
}