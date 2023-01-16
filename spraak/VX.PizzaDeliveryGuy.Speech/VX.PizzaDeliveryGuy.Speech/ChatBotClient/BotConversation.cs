using System.Net.Http.Headers;
using System.Text.Json;

namespace VX.PizzaDeliveryGuy.Speech.ChatBotClient
{
    public class BotConversation
    {
        private const string loginToken = "RMJE5d_F8Bo.2653TuGdwWpae_rGJ5C4FlSLqVCmKGAHTh-n1zdV-24";

        private const string loginUrl = "https://directline.botframework.com/v3/directline/tokens/generate";
        private const string startConversationUrl = "https://directline.botframework.com/v3/directline/conversations";
        private const string sendActivatyUrl = "https://directline.botframework.com/v3/directline/conversations/{0}/activities";
        private const string getActivityUrl = "https://directline.botframework.com/v3/directline/conversations/{0}/activities?watermark={1}";
        private readonly HttpClient httpClient;

        private string? BearerToken { get; set; }
        private string? ConversationId { get; set; }
        private DateTime ExpireDate { get; set; }
        private bool IsExpired()
        {
            return ExpireDate <= DateTime.Now;
        }

        private BotConversation()
        {
            httpClient = new HttpClient();
            var contentType = new MediaTypeWithQualityHeaderValue("application/json");
            httpClient.DefaultRequestHeaders.Accept.Add(contentType);
        }

        public static async Task<BotConversation> StartConversation()
        {
            BotConversation conversation = new BotConversation();
            await conversation.Login();
            return conversation;
        }

        private async Task Login()
        {
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginToken);
            var response = await httpClient.PostAsync(loginUrl, null) ?? throw new InvalidOperationException("no response");

            var loginResponse = await response.Content.ReadFromJsonAsync<LoginResponse>();
            if (loginResponse != null)
            {
                BearerToken = loginResponse.token;
                ExpireDate = DateTime.Now.AddSeconds(loginResponse.ExpiresInSeconds);
                ConversationId = loginResponse.conversationId;

                await StartConversation(ConversationId);
            }
        }

        private async Task StartConversation(string conversationId)
        {
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", BearerToken);
            await httpClient.PostAsync(startConversationUrl, null);
        }

        public async Task<string> SendMessage(string from, string message)
        {
            if (IsExpired())
            {
                await Login();
            }

            BotActivity messageRequest = new BotActivity("nl-NL", "message", message, new Chatuser(from));
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", BearerToken);

            var url = string.Format(sendActivatyUrl, ConversationId);
            var requestContent = new StringContent(JsonSerializer.Serialize(messageRequest), MediaTypeHeaderValue.Parse("application/json"));

            var response = await httpClient.PostAsync(url, requestContent) ?? throw new Exception("no response");
            var sendActivityResponse = await response.Content.ReadFromJsonAsync<SendActivityResponse>() ?? throw new Exception("no response");

            var watermark = int.Parse(sendActivityResponse.Id.Split('|')[1]);
            var reply = await GetReply(watermark) ?? throw new Exception("no response");

            return reply.Activities.Last().Text;

        }

        public async Task<GetMessageResult> GetReply(int waterMark)
        {

            if (IsExpired())
            {
                await Login();
            }

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", BearerToken);
            var response = await httpClient.GetAsync(string.Format(getActivityUrl, ConversationId, waterMark)) ?? throw new Exception("no response");
            var activities = await response.Content.ReadFromJsonAsync<GetMessageResult>() ?? throw new Exception("no response");

            return activities;
        }
    }
}
