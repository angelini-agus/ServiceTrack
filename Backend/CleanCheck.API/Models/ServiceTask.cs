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

    public DateTime ScheduledDate { get; set; } = DateTime.Today; // Por defecto: Hoy
    public string Location { get; set; } = string.Empty; // Ej: "Torre A - Piso 3"

    // --- NUEVOS CAMPOS DE GEOLOCALIZACIÓN ---
    public double Latitude { get; set; }  // Ej: -32.94682
    public double Longitude { get; set; } // Ej: -60.63932

    // Horarios programados por el Admin
    public TimeSpan StartTime { get; set; } // Ej: 07:00:00
    public TimeSpan EndTime { get; set; }   // Ej: 09:00:00

    // Registros reales del Empleado al escanear
    public DateTime? EntryTime { get; set; } // Hora exacta en la que escaneó la entrada
    public DateTime? ExitTime { get; set; }  // Hora exacta en la que escaneó la salida

    // Estados para facilitar la vista del Admin ("A Tiempo", "Tarde", "Salida Anticipada")
    public string? EntryStatus { get; set; }
    public string? ExitStatus { get; set; }
}