using System.ComponentModel.DataAnnotations; // <--- OBLIGATORIO PARA QUE ENTIENDA EL [Key]
using System.Collections.Generic;

namespace CleanCheck.API.Models
{
    public class Consortium
    {
        [Key] // <--- ESTA ES LA ETIQUETA MÁGICA QUE FALTA
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public int? AssignedUserId { get; set; }

        public List<WeeklySchedule> Schedules { get; set; } = new List<WeeklySchedule>();
    }
}