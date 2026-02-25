using System;
using System.ComponentModel.DataAnnotations;

namespace CleanCheck.API.Models
{
    public class SupplyRequest
    {
        [Key]
        public int Id { get; set; }

        // Estos son los IDs que manda Angular (ESTOS SÍ SON OBLIGATORIOS)
        public int UserId { get; set; }
        public int ProductId { get; set; }

        public string Location { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; } // "Pendiente" o "Entregado"
        public DateTime RequestMonth { get; set; }

        // EL SALVAVIDAS 👇: Le ponemos el "?" para que C# no exija recibir el objeto entero desde Angular
        public User? User { get; set; }
        public Product? Product { get; set; }
    }
}