using System.Text.Json.Serialization;

namespace VX.PizzaDeliveryGuy.Speech.ChatBotClient
{
    public class BotActivity
    {
        [JsonPropertyName("locale")]
        public string Locale { get; set; }
        [JsonPropertyName("type")]
        public string Type { get; set; }
        [JsonPropertyName("text")]
        public string Text { get; set; }
        [JsonPropertyName("from")]
        public Chatuser From { get; set; }

        public BotActivity(string locale, string type, string text, Chatuser from)
        {
            Locale = locale;
            Type = type;
            Text = text;
            From = from;
        }
    }
}
