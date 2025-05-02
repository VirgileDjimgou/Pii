using BackendApi.Models;
using System.Collections.Concurrent;

namespace BackendApi.Services
{
    public class AnnotationService
    {
        private readonly ConcurrentBag<Annotation> _annotations = new();

        public IEnumerable<Annotation> GetAll() => _annotations;

        public void Add(Annotation annotation)
        {
            _annotations.Add(annotation);
        }
    }
}
