
using Microsoft.AspNetCore.Mvc;
using backend_core.Models;

namespace backend_core.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VehicleElementsController : ControllerBase
    {
        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            var element = new VehicleElement
            {
                Id = id,
                Name = "Levier de vitesse",
                DescriptionShort = "Permet de changer les vitesses.",
                DescriptionLong = "Ce levier permet de sélectionner les modes de conduite : D, N, R, P.",
                Models = new List<string> { "Mazda 3", "Toyota Corolla" },
                Icon = "gear.svg",
                Audio = new Dictionary<string, string>
                {
                    { "fr", "gear_shift_fr.mp3" },
                    { "en", "gear_shift_en.mp3" }
                }
            };
            return Ok(element);
        }
    }
}
