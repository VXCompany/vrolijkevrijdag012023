using VX.PizzaDeliveryGuy.Speech.ChatBotClient;

namespace VX.PizzaDeliveryGuy.Speech.ChatBotClient
{
    public class GetMessageResult
    {
        public List<BotActivity> Activities { get; set; }

        public GetMessageResult()
        {
            Activities = new List<BotActivity>();
        }
    }

}
