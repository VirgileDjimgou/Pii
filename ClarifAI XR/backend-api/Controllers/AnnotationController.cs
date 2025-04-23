using BackendApi.Models;
using BackendApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BackendApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnotationController : ControllerBase
    {
        private readonly AnnotationService _service;

        public AnnotationController(AnnotationService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetAnnotations() => Ok(_service.GetAll());

        [HttpPost]
        public IActionResult PostAnnotation([FromBody] Annotation annotation)
        {
            _service.Add(annotation);
            return Ok();
        }
    }
}
