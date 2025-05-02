
namespace backend_core.Models
{
    public class VehicleElement
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string DescriptionShort { get; set; }
        public string DescriptionLong { get; set; }
        public List<string> Models { get; set; }
        public Dictionary<string, string> Audio { get; set; }
        public string Icon { get; set; }
    }
}
