namespace VX.PizzaDeliveryGuy.Speech.ChatBotClient
{
    public class SendActivityResponse
    {
        public string Id { get; set; }

        public SendActivityResponse(string id)
        {
            Id = id;
        }
    }
}
