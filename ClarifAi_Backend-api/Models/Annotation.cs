namespace BackendApi.Models
{
    public class Annotation
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public float X { get; set; }
        public float Y { get; set; }
        public float Z { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
