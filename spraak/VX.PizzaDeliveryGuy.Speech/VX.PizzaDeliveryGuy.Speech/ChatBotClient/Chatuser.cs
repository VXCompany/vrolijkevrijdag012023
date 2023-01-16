using System.Text.Json.Serialization;

namespace VX.PizzaDeliveryGuy.Speech.ChatBotClient
{
    public class Chatuser
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }
        public Chatuser(string id)
        {
            Id = id;
        }
    }
}
