using System.ComponentModel.DataAnnotations;

namespace CleanCheck.API.Models // (O el namespace que uses)
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
    }
}