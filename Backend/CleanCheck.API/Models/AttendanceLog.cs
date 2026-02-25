using System;
using System.ComponentModel.DataAnnotations;

namespace CleanCheck.API.Models
{
    public class AttendanceLog
    {
        [Key]
        public int Id { get; set; }
        public int ConsortiumId { get; set; }
        public int UserId { get; set; } // El empleado que escaneó

        public DateTime Date { get; set; } // Ej: 20/02/2026
        public DateTime? EntryTime { get; set; } // Hora real de escaneo
        public DateTime? ExitTime { get; set; }

        public string EntryStatus { get; set; } // "A Tiempo", "Tardanza"
        public string ExitStatus { get; set; }
    }
}