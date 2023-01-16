using System.Text.Json.Serialization;

namespace VX.PizzaDeliveryGuy.Speech.ChatBotClient
{
    public class LoginResponse
    {
        public string conversationId { get; set; }
        public string token { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresInSeconds { get; set; }

        public LoginResponse(string conversationId, string token, int expiresInSeconds)
        {
            this.conversationId = conversationId;
            this.token = token;
            ExpiresInSeconds = expiresInSeconds;
        }
    }
}
