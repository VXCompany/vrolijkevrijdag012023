using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using NAudio.Wave;
using VX.PizzaDeliveryGuy.Speech.ChatBotClient;

namespace VX.PizzaDeliveryGuy.Speech.SpeechToText
{
    public class SpeechEngine
    {
        private const string KEY = "da6641802edd4dd7be98b9b03dcb2f22";
        private const string REGION = "westeurope";
        private SpeechConfig speechConfig;
        private BotConversation? botConversation;

        public SpeechEngine()
        {
            speechConfig = SpeechConfig.FromSubscription(KEY, REGION);
            speechConfig.SpeechRecognitionLanguage = "nl-NL";
            speechConfig.SpeechSynthesisLanguage = "nl-NL";
        }

        public async Task Speak(SpeakRequest text)
        {
            using var audioConfig = AudioConfig.FromDefaultMicrophoneInput();
            using var speechSynthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

            var result = await speechSynthesizer.SpeakTextAsync(text.Content);
        }

        public async Task<ListResponse> Listen(ListenRequest listenRequest)
        {
            var OutputAudioFilePath = $"{listenRequest.AudioFilePath}temp.wav";
            CreateWaveFileFromSourceAudio(listenRequest, OutputAudioFilePath);

            using var audioConfig = AudioConfig.FromWavFileInput(OutputAudioFilePath);
            using var speechRecognizer = new SpeechRecognizer(speechConfig, audioConfig);

            var speechRecognitionResult = await speechRecognizer.RecognizeOnceAsync();

            if (botConversation == null)
            {
                botConversation = await BotConversation.StartConversation();
            }

            var botConversationResult = await botConversation.SendMessage("deurbel", speechRecognitionResult.Text);

            return new ListResponse(botConversationResult);
        }

        private static void CreateWaveFileFromSourceAudio(ListenRequest listenRequest, string OutputAudioFilePath)
        {
            using (MediaFoundationReader reader = new MediaFoundationReader($"{listenRequest.AudioFilePath}{listenRequest.AudioFileName}"))
            {
                WaveFileWriter.CreateWaveFile(OutputAudioFilePath, reader);
            }
        }
    }
}
