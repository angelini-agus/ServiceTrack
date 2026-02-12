using System.ComponentModel.DataAnnotations;

namespace CleanCheck.API.Models;

public class ServiceTask
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty; // Ej: "Limpieza Edificio A"

    public string Description { get; set; } = string.Empty; // Ej: "Pasillo y escaleras"

    public bool IsCompleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Relación: ¿Quién debe hacer esta tarea? (Opcional por ahora)
    public int? AssignedUserId { get; set; }
}