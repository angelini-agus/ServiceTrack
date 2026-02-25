using System;
using System.ComponentModel.DataAnnotations; // <--- LA LIBRERÍA

namespace CleanCheck.API.Models
{
    public class WeeklySchedule
    {
        [Key] // <--- ACÁ ESTÁ EL QUE FALTABA
        public int Id { get; set; }
        public int ConsortiumId { get; set; }

        public int DayOfWeek { get; set; }

        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}