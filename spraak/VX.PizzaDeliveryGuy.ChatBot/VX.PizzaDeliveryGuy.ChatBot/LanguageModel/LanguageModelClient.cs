using System.Net.Http.Headers;
using System.Net.Http;
using System.Net.Http.Json;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

namespace VX.PizzaDeliveryGuy.ChatBot.LanguageModel
{
    public class LanguageModelClient
    {
        private const string Url = "https://vxpizzadeliveryguytextanalysys.cognitiveservices.azure.com/language/:query-knowledgebases?projectName=vxpizzadeliveryguyquestionmodel&api-version=2021-10-01&deploymentName=production";
        private HttpClient httpClient;

        public LanguageModelClient()
        {
            httpClient = new HttpClient();
            var contentType = new MediaTypeWithQualityHeaderValue("application/json");
            httpClient.DefaultRequestHeaders.Accept.Add(contentType);
            httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", "ce2178f90b40406294c76b4896d64ebe");
        }

        public async Task<string> AskQuestion(string question)
        {
            var response = await httpClient.PostAsJsonAsync<Question>(Url, new Question(question));
            var answerContent = (await response.Content.ReadAsStringAsync());

            var answer = JsonSerializer.Deserialize<Reply>(answerContent).answers.FirstOrDefault();

            return answer?.dialog?.prompts?.FirstOrDefault()?.displayText ?? "Ik heb de vraag niet begrepen.";  
        }
    }
}
