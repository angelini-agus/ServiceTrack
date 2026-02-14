namespace CleanCheck.API.Models;

public class UserDto
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Empleado";
    public string FullName { get; set; } = string.Empty;
}