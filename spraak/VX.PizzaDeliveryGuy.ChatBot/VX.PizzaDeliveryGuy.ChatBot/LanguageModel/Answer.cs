using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace VX.PizzaDeliveryGuy.ChatBot.LanguageModel
{
    public class Question
    {
        [JsonPropertyName("question")]
        public string Content { get;set;}

        public Question(string content)
        {
            Content = content;
        }
    }

    public class Reply
    {        
        public List<Answer> answers { get; set; }
    }

    public class Answer
    {
        public string answer { get; set; }        
        public Dialog dialog { get; set; }
    }

    public class Dialog
    {        
        public List<Prompt> prompts { get; set; } = new List<Prompt>();
    }

    public class Prompt
    {        
        public string displayText { get; set; }
    }
}
